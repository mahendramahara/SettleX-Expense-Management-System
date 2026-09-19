import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Scale, RotateCw, Plus, Sparkles, FolderKanban } from 'lucide-react';
import { groupService, userService, settlementService } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Import modular subcomponents from components/admin/settlements/
import { SettlementMetricsStrip } from '../../components/admin/settlements/SettlementMetricsStrip';
import { SettlementWatcherFilterBar } from '../../components/admin/settlements/SettlementWatcherFilterBar';
import { SettlementDebtsTable } from '../../components/admin/settlements/SettlementDebtsTable';
import { GroupBalanceBreakdownCard } from '../../components/admin/settlements/GroupBalanceBreakdownCard';
import { RecordSettlementModal } from '../../components/admin/settlements/RecordSettlementModal';
import { SettlementDetailsModal } from '../../components/admin/settlements/SettlementDetailsModal';
import DEMO from '../../demo/data.json';

export function AdminSettlementsPage() {
  const { user: currentAdmin, isGuest } = useAuth();
  const toast = useToast();

  const isSuperAdmin = currentAdmin?.role === 'superadmin';
  const permissions = currentAdmin?.permissions || [];
  const canRecord =
    isSuperAdmin ||
    permissions.includes('*') ||
    permissions.includes('settlements:create') ||
    permissions.includes('expenses:create') ||
    permissions.includes('users:create');

  const [settlements, setSettlements] = useState([]);
  const [userBalances, setUserBalances] = useState([]);
  const [stats, setStats] = useState({
    totalPendingDebtPaisa: 0,
    totalPendingDebtFormatted: 'Rs. 0',
    totalSettlementsCount: 0,
    rawTransactionsCount: 0,
    optimizedTransactionsCount: 0,
    reductionPercent: 0,
  });

  const [allGroups, setAllGroups] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [recordModalInitialData, setRecordModalInitialData] = useState(null);
  const [inspectingSettlement, setInspectingSettlement] = useState(null);

  const [page, setPage] = useState(1);
  const PAGE_LIMIT = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch reference metadata (groups & users)
  const loadMetadata = useCallback(async () => {
    if (isGuest) {
      setAllGroups(DEMO.admin?.groups || DEMO.groups || []);
      setAllUsers(DEMO.admin?.users || []);
      return;
    }
    try {
      const [groupsRes, usersRes] = await Promise.allSettled([
        groupService.getAll({ limit: 150 }),
        userService.getUsers({ limit: 150 }),
      ]);

      if (groupsRes.status === 'fulfilled') {
        const data = groupsRes.value?.data || groupsRes.value;
        setAllGroups(Array.isArray(data.groups) ? data.groups : []);
      }
      if (usersRes.status === 'fulfilled') {
        const data = usersRes.value?.data || usersRes.value;
        setAllUsers(Array.isArray(data.users) ? data.users : []);
      }
    } catch {
      // Non-critical reference failure
    }
  }, [isGuest]);

  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  // Fetch settlements data from backend or demo
  const fetchSettlements = useCallback(async () => {
    if (isGuest) {
      const demoData = DEMO.admin?.settlements || { settlements: [], userBalances: [], stats: {} };
      let list = demoData.settlements || [];
      if (selectedGroup) {
        list = list.filter((s) => s.groupId === selectedGroup);
      }
      if (selectedUser) {
        list = list.filter((s) => s.from?.id === selectedUser || s.to?.id === selectedUser);
      }
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        list = list.filter(
          (s) =>
            s.groupName?.toLowerCase().includes(q) ||
            s.from?.name?.toLowerCase().includes(q) ||
            s.to?.name?.toLowerCase().includes(q)
        );
      }
      setSettlements(list);
      setUserBalances(demoData.userBalances || []);
      if (demoData.stats) setStats(demoData.stats);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await settlementService.getAll({
        groupId: selectedGroup,
        userId: selectedUser,
        search: debouncedSearch,
      });

      const data = res?.data || res;
      if (data) {
        setSettlements(Array.isArray(data.settlements) ? data.settlements : []);
        setUserBalances(Array.isArray(data.userBalances) ? data.userBalances : []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to calculate platform settlements');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isGuest, selectedGroup, selectedUser, debouncedSearch, toast]);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchSettlements(), loadMetadata()]);
    toast.info('Settlement debt graph recalculated');
  };

  const handleRecordSettlement = async (payload) => {
    if (isGuest) {
      toast.warning('Settlement recording is disabled in guest preview mode.');
      setRecordModalOpen(false);
      setRecordModalInitialData(null);
      return;
    }
    try {
      await settlementService.recordSettlement(payload);
      toast.success('Settlement payment recorded successfully');
      setRecordModalOpen(false);
      setRecordModalInitialData(null);
      await fetchSettlements();
    } catch (err) {
      toast.error(err.message || 'Failed to record settlement');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedGroup('');
    setSelectedUser('');
    setPage(1);
  };

  const hasActiveFilters = search.trim() !== '' || selectedGroup !== '' || selectedUser !== '';

  const watchedGroupObj = useMemo(() => {
    if (!selectedGroup) return null;
    return allGroups.find((g) => g.id === selectedGroup) || null;
  }, [selectedGroup, allGroups]);

  // Client-side pagination slice for calculated settlements
  const paginatedSettlements = useMemo(() => {
    const start = (page - 1) * PAGE_LIMIT;
    return settlements.slice(start, start + PAGE_LIMIT);
  }, [settlements, page]);

  const paginationMeta = useMemo(() => {
    return {
      page,
      limit: PAGE_LIMIT,
      total: settlements.length,
      totalPages: Math.ceil(settlements.length / PAGE_LIMIT) || 1,
    };
  }, [settlements.length, page]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
              Graph Engine
            </span>
            {stats.reductionPercent > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {stats.reductionPercent}% Debt Simplification
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Settlement Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Audit multi-party debt cycles, watch circle net balances, and record clearance payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Recalculate Debt Graph"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
            <span className="hidden sm:inline">Optimize</span>
          </button>

          {canRecord && (
            <button
              onClick={() => {
                setRecordModalInitialData(null);
                setRecordModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Settlement</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Strip */}
      <SettlementMetricsStrip stats={stats} />

      {/* Filter and Watcher Bar */}
      <SettlementWatcherFilterBar
        search={search}
        onSearchChange={setSearch}
        selectedGroup={selectedGroup}
        onGroupChange={(gId) => {
          setSelectedGroup(gId);
          setPage(1);
        }}
        selectedUser={selectedUser}
        onUserChange={(uId) => {
          setSelectedUser(uId);
          setPage(1);
        }}
        allGroups={allGroups}
        allUsers={allUsers}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenRecord={() => {
          setRecordModalInitialData(null);
          setRecordModalOpen(true);
        }}
        canRecord={canRecord}
      />

      {/* Watched Group Circle Balance Sheet (Shown when specific group is selected) */}
      {watchedGroupObj && userBalances.length > 0 && (
        <GroupBalanceBreakdownCard
          group={watchedGroupObj}
          balances={userBalances}
          stats={stats}
          onClose={() => setSelectedGroup('')}
        />
      )}

      {/* Pending Settlement Debts Table */}
      <SettlementDebtsTable
        settlements={paginatedSettlements}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        onOpenRecord={() => {
          setRecordModalInitialData(null);
          setRecordModalOpen(true);
        }}
        onSelectSettle={(debt) => {
          setRecordModalInitialData(debt);
          setRecordModalOpen(true);
        }}
        onInspectSettlement={(debt) => setInspectingSettlement(debt)}
        onFilterGroup={(groupId) => {
          setSelectedGroup(groupId);
          setPage(1);
        }}
        canRecord={canRecord}
        pagination={paginationMeta}
        onPageChange={setPage}
      />

      {/* Record Settlement Modal */}
      {recordModalOpen && (
        <RecordSettlementModal
          initialData={recordModalInitialData}
          groups={allGroups}
          onClose={() => {
            setRecordModalOpen(false);
            setRecordModalInitialData(null);
          }}
          onSubmit={handleRecordSettlement}
        />
      )}

      {/* Inspect Settlement Modal */}
      {inspectingSettlement && (
        <SettlementDetailsModal
          settlement={inspectingSettlement}
          onClose={() => setInspectingSettlement(null)}
          onSettleNow={(debt) => {
            setRecordModalInitialData(debt);
            setRecordModalOpen(true);
          }}
          canRecord={canRecord}
        />
      )}
    </div>
  );
}
