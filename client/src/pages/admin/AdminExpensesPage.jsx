import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Receipt, FolderKanban, RotateCw, Plus, X } from 'lucide-react';
import { groupService, userService, expenseService } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DEMO from '../../demo/data.json';
import ExpensesKpiCards from '../../components/admin/expenses/ExpensesKpiCards';
import ExpenseFiltersStrip from '../../components/admin/expenses/ExpenseFiltersStrip';
import ExpensesTable from '../../components/admin/expenses/ExpensesTable';
import { CreateExpenseModal } from '../../components/admin/expenses/CreateExpenseModal';
import { EditExpenseModal } from '../../components/admin/expenses/EditExpenseModal';
import { ExpenseDetailsModal } from '../../components/admin/expenses/ExpenseDetailsModal';
import { DeleteExpenseModal } from '../../components/admin/expenses/DeleteExpenseModal';

export function AdminExpensesPage() {
  const { user: currentAdmin, isGuest } = useAuth();
  const toast = useToast();

  const isSuperAdmin = currentAdmin?.role === 'superadmin';
  const permissions = currentAdmin?.permissions || [];
  const canCreate =
    isSuperAdmin ||
    permissions.includes('*') ||
    permissions.includes('expenses:create') ||
    permissions.includes('users:create');
  const canUpdate =
    isSuperAdmin ||
    permissions.includes('*') ||
    permissions.includes('expenses:update') ||
    permissions.includes('users:update');
  const canDelete =
    isSuperAdmin ||
    permissions.includes('*') ||
    permissions.includes('expenses:delete') ||
    permissions.includes('users:delete');

  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalAmountFormatted: 'Rs. 0',
    totalAmountPaisa: 0,
  });
  const [allGroups, setAllGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, totalPages: 1, total: 0 });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState('');
  const [selectedSplitType, setSelectedSplitType] = useState('ALL');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [inspectingExpense, setInspectingExpense] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadReferenceData = useCallback(async () => {
    if (isGuest) {
      setAllGroups(DEMO.groups || DEMO.dashboard.groups || []);
      setAllUsers(DEMO.admin.users || []);
      return;
    }
    try {
      const [groupsRes, usersRes] = await Promise.allSettled([
        groupService.getAll({ limit: 150 }),
        userService.getUsers({ limit: 150 }),
      ]);

      if (groupsRes.status === 'fulfilled') {
        const data = groupsRes.value?.data || groupsRes.value;
        setAllGroups(Array.isArray(data.groups) ? data.groups : DEMO.groups || []);
      } else {
        setAllGroups(DEMO.groups || DEMO.dashboard.groups || []);
      }
      if (usersRes.status === 'fulfilled') {
        const data = usersRes.value?.data || usersRes.value;
        setAllUsers(Array.isArray(data.users) ? data.users : DEMO.admin.users || []);
      } else {
        setAllUsers(DEMO.admin.users || []);
      }
    } catch {
      setAllGroups(DEMO.groups || DEMO.dashboard.groups || []);
      setAllUsers(DEMO.admin.users || []);
    }
  }, [isGuest]);

  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  const fetchExpenses = useCallback(async () => {
    if (isGuest) {
      let demoExpenses = [];
      const grps = DEMO.groups || DEMO.dashboard.groups || [];
      grps.forEach((g) => {
        if (Array.isArray(g.expenses)) {
          g.expenses.forEach((e) => {
            demoExpenses.push({
              id: e.id,
              description: e.description || e.title,
              amountPaisa: e.amountPaisa,
              amountFormatted: `Rs. ${(e.amountPaisa / 100).toLocaleString('en-IN')}`,
              splitType: e.splitType || 'EQUAL',
              groupName: g.name || g.title,
              groupId: g.id,
              paidByName: e.paidByName || 'Demo User',
              createdAt: e.createdAt || '2026-09-15T10:00:00Z',
            });
          });
        }
      });
      if (selectedGroupFilter) {
        demoExpenses = demoExpenses.filter((e) => e.groupId === selectedGroupFilter);
      }
      if (selectedSplitType !== 'ALL') {
        demoExpenses = demoExpenses.filter((e) => e.splitType === selectedSplitType);
      }
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        demoExpenses = demoExpenses.filter((e) => e.description?.toLowerCase().includes(q));
      }
      setExpenses(demoExpenses);
      setStats({
        totalExpenses: demoExpenses.length,
        totalAmountFormatted: 'Rs. 1,24,800',
        totalAmountPaisa: 12480000,
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await expenseService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        groupId: selectedGroupFilter,
        userId: selectedUserFilter,
      });

      const data = res?.data || res;
      if (data && Array.isArray(data.expenses)) {
        let list = data.expenses;
        if (selectedSplitType !== 'ALL') {
          list = list.filter((exp) => exp.splitType === selectedSplitType);
        }
        setExpenses(list);
        if (data.pagination) setPagination(data.pagination);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load expense records');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearch,
    selectedGroupFilter,
    selectedUserFilter,
    selectedSplitType,
    toast,
    isGuest,
  ]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchExpenses(), loadReferenceData()]);
    toast.info('Expense registers synchronized');
  };

  const handleCreateExpense = async (payload) => {
    if (isGuest) {
      toast.warning('Expense recording is disabled in guest preview mode.');
      setIsCreateOpen(false);
      return;
    }
    try {
      await expenseService.create(payload);
      toast.success('Expense recorded successfully');
      setIsCreateOpen(false);
      await fetchExpenses();
    } catch (err) {
      toast.error(err.message || 'Failed to record expense');
    }
  };

  const handleUpdateExpense = async (id, payload) => {
    if (isGuest) {
      toast.warning('Expense alterations are disabled in guest preview mode.');
      setExpenseToEdit(null);
      return;
    }
    try {
      await expenseService.update(id, payload);
      toast.success('Expense altered successfully');
      setExpenseToEdit(null);
      await fetchExpenses();
    } catch (err) {
      toast.error(err.message || 'Failed to update expense');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (isGuest) {
      toast.warning('Expense deletion is disabled in guest preview mode.');
      setExpenseToDelete(null);
      return;
    }
    try {
      await expenseService.delete(id);
      toast.success('Expense removed and audit trail logged');
      setExpenseToDelete(null);
      await fetchExpenses();
    } catch (err) {
      toast.error(err.message || 'Failed to delete expense');
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedGroupFilter('');
    setSelectedUserFilter('');
    setSelectedSplitType('ALL');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedGroupFilter !== '' ||
    selectedUserFilter !== '' ||
    selectedSplitType !== 'ALL';

  const watchedGroupName = useMemo(() => {
    if (!selectedGroupFilter) return null;
    const found = allGroups.find((g) => g.id === selectedGroupFilter);
    return found ? found.name : 'Selected Group';
  }, [selectedGroupFilter, allGroups]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Expense Management
                </h1>
                {selectedGroupFilter && (
                  <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center gap-1.5">
                    <FolderKanban className="w-3 h-3" />
                    <span>{watchedGroupName}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedGroupFilter('')}
                      className="hover:text-indigo-900 dark:hover:text-indigo-200 cursor-pointer"
                      title="Clear group watcher"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit platform transactions, watch group expenditures, and record bills on behalf of
                users
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            title="Refresh Expense List"
            className="p-2 rounded-xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm shadow-primary/20 hover:opacity-95 transition-opacity cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <ExpensesKpiCards stats={stats} groupsCount={allGroups.length} />

      {/* Filter and Watcher Strip */}
      <ExpenseFiltersStrip
        search={search}
        onSearchChange={setSearch}
        selectedGroupFilter={selectedGroupFilter}
        onGroupFilterChange={(groupId) => {
          setSelectedGroupFilter(groupId);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        selectedUserFilter={selectedUserFilter}
        onUserFilterChange={(userId) => {
          setSelectedUserFilter(userId);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        selectedSplitType={selectedSplitType}
        onSplitTypeChange={setSelectedSplitType}
        allGroups={allGroups}
        allUsers={allUsers}
        onResetFilters={clearAllFilters}
      />

      {/* Expenses Table Panel */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
        <ExpensesTable
          expenses={expenses}
          isLoading={isLoading}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
          hasActiveFilters={hasActiveFilters}
          pagination={pagination}
          onPageChange={(newPage) => setPagination((prev) => ({ ...prev, page: newPage }))}
          onResetFilters={clearAllFilters}
          onCreateExpense={() => setIsCreateOpen(true)}
          onGroupClick={(groupId) => {
            setSelectedGroupFilter(groupId);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          onInspectExpense={(exp) => setInspectingExpense(exp)}
          onEditExpense={(exp) => setExpenseToEdit(exp)}
          onDeleteExpense={(exp) => setExpenseToDelete(exp)}
        />
      </div>

      {/* Modals */}
      {isCreateOpen && (
        <CreateExpenseModal
          groups={allGroups}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateExpense}
        />
      )}

      {expenseToEdit && (
        <EditExpenseModal
          expense={expenseToEdit}
          groups={allGroups}
          onClose={() => setExpenseToEdit(null)}
          onSubmit={(data) => handleUpdateExpense(expenseToEdit.id, data)}
        />
      )}

      {inspectingExpense && (
        <ExpenseDetailsModal
          expense={inspectingExpense}
          onClose={() => setInspectingExpense(null)}
        />
      )}

      {expenseToDelete && (
        <DeleteExpenseModal
          expense={expenseToDelete}
          onClose={() => setExpenseToDelete(null)}
          onConfirm={() => handleDeleteExpense(expenseToDelete.id)}
        />
      )}
    </div>
  );
}

export default AdminExpensesPage;
