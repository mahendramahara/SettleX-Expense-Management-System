import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Receipt, Plus, RotateCw, Inbox } from 'lucide-react';
import { ExpenseStats } from '../../components/expenses/ExpenseStats';
import { ExpenseFilters } from '../../components/expenses/ExpenseFilters';
import { ExpenseItem } from '../../components/expenses/ExpenseItem';
import { ExpenseDetailModal } from '../../components/expenses/ExpenseDetailModal';
import { expenseService, groupService } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DEMO } from '../../demo/index.js';

export function ExpensesPage({ onOpenNewExpense, refreshKey }) {
  const { user, isGuest } = useAuth();
  const toast = useToast();

  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('ALL');
  const [splitTypeFilter, setSplitTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  const [selectedExpense, setSelectedExpense] = useState(null);

  const currentUserId = user?.id || user?._id || DEMO.user.id;

  const loadData = useCallback(async () => {
    if (isGuest) {
      const demoExpenses = (DEMO.dashboard?.recentExpenses || []).map((exp, idx) => ({
        ...exp,
        id: exp.id || `demo-exp-${idx}`,
        amountPaisa: exp.amountPaisa || 100000,
        splits: exp.splits || [
          {
            userId: currentUserId,
            userName: user?.name || 'Demo User',
            amountPaisa: (exp.amountPaisa || 100000) / 2,
          },
          {
            userId: 'demo-user-aarav',
            userName: 'Aarav Gurung',
            amountPaisa: (exp.amountPaisa || 100000) / 2,
          },
        ],
      }));
      setExpenses(demoExpenses);
      setGroups(DEMO.groups || DEMO.dashboard?.groups || []);
      setIsLoading(false);
      return;
    }

    try {
      const [expRes, grpRes] = await Promise.allSettled([
        expenseService.getAll(),
        groupService.getAll(),
      ]);

      if (expRes.status === 'fulfilled') {
        const fetched = expRes.value?.data?.expenses || expRes.value?.expenses || [];
        setExpenses(Array.isArray(fetched) ? fetched : []);
      } else {
        setExpenses([]);
      }

      if (grpRes.status === 'fulfilled') {
        const fetchedGroups = grpRes.value?.data?.groups || grpRes.value?.groups || [];
        setGroups(Array.isArray(fetchedGroups) ? fetchedGroups : []);
      } else {
        setGroups([]);
      }
    } catch {
      setExpenses([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isGuest, currentUserId]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    toast.info('Expense records refreshed');
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!expenseId) return;

    if (isGuest) {
      toast.warning('Demo Mode Active', 'Please sign in to delete expenses. Modifications are disabled in demo mode.');
      return;
    }

    try {
      const res = await expenseService.delete(expenseId);
      if (res?.success) {
        setExpenses((prev) => prev.filter((e) => (e.id || e._id) !== expenseId));
        toast.success('Expense deleted successfully');
      } else {
        toast.error(res?.message || 'Could not delete expense');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to delete expense');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedGroupId('ALL');
    setSplitTypeFilter('ALL');
    setSortBy('NEWEST');
  };

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const titleMatch = (exp.title || exp.description || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const groupMatch = (exp.groupName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const payerMatch = (exp.paidByName || exp.paidById?.name || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const matchesSearch = titleMatch || groupMatch || payerMatch;
        if (!matchesSearch) return false;

        if (selectedGroupId !== 'ALL') {
          const eGroupId = exp.groupId?._id || exp.groupId?.id || exp.groupId;
          if (String(eGroupId) !== String(selectedGroupId)) {
            return false;
          }
        }

        if (splitTypeFilter !== 'ALL') {
          if (exp.splitType !== splitTypeFilter) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NEWEST') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'OLDEST') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'HIGHEST') {
          return (b.amountPaisa || 0) - (a.amountPaisa || 0);
        }
        if (sortBy === 'LOWEST') {
          return (a.amountPaisa || 0) - (b.amountPaisa || 0);
        }
        return 0;
      });
  }, [expenses, searchTerm, selectedGroupId, splitTypeFilter, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center text-primary">
              <Receipt className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Expenses
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track, audit, and inspect shared transactions with integer paisa split precision
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            title="Refresh list"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (isGuest) {
                toast.warning('Demo Mode Active', 'Please log in to add expenses. Interactions are disabled in demo preview mode.');
                return;
              }
              onOpenNewExpense?.();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 hover:shadow-primary/30 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      <ExpenseStats expenses={expenses} currentUserId={currentUserId} />

      <ExpenseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedGroupId={selectedGroupId}
        onGroupChange={setSelectedGroupId}
        groups={groups}
        splitTypeFilter={splitTypeFilter}
        onSplitTypeChange={setSplitTypeFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        onReset={handleResetFilters}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Expense Records ({filteredExpenses.length})
          </h2>
          {expenses.length > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredExpenses.length} of {expenses.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 animate-pulse flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-2">
                    <div className="w-36 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="w-48 h-3 rounded bg-slate-100 dark:bg-slate-850" />
                  </div>
                </div>
                <div className="w-20 h-5 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No expenses found</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {searchTerm || selectedGroupId !== 'ALL' || splitTypeFilter !== 'ALL'
                ? 'No expenses matched your filter criteria. Try resetting filters.'
                : 'No shared expenses have been recorded yet. Click "Add Expense" to log the first bill.'}
            </p>
            {searchTerm || selectedGroupId !== 'ALL' || splitTypeFilter !== 'ALL' ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-3.5 py-1.5 rounded-xl text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenNewExpense?.()}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add First Expense
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredExpenses.map((expense) => {
              const expId = expense.id || expense._id;
              return (
                <ExpenseItem
                  key={expId}
                  expense={expense}
                  currentUserId={currentUserId}
                  onSelect={(exp) => setSelectedExpense(exp)}
                  onDelete={handleDeleteExpense}
                />
              );
            })}
          </div>
        )}
      </div>

      <ExpenseDetailModal
        isOpen={Boolean(selectedExpense)}
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
        currentUserId={currentUserId}
        onDelete={handleDeleteExpense}
      />
    </div>
  );
}
