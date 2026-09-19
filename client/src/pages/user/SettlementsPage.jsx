import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Scale, Sparkles, RotateCw, ArrowRightLeft, CheckCircle2, Inbox } from 'lucide-react';
import { SettlementStats } from '../../components/settlements/SettlementStats';
import { GroupSelector } from '../../components/settlements/GroupSelector';
import { MemberBalanceList } from '../../components/settlements/MemberBalanceList';
import { OptimizedTransactionCard } from '../../components/settlements/OptimizedTransactionCard';
import { DebtGraphVisualizer } from '../../components/settlements/DebtGraphVisualizer';
import { RecordPaymentModal } from '../../components/settlements/RecordPaymentModal';
import { WhatIfSimulationModal } from '../../components/settlements/WhatIfSimulationModal';
import { ShareableSettlementSummaryModal } from '../../components/settlements/ShareableSettlementSummaryModal';
import { groupService, settlementService } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DEMO } from '../../demo/index.js';

export function SettlementsPage({ refreshKey }) {
  const { user, isGuest } = useAuth();
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingSettlements, setIsLoadingSettlements] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSimplifying, setIsSimplifying] = useState(false);

  const [balances, setBalances] = useState([]);
  const [optimizedTransactions, setOptimizedTransactions] = useState([]);
  const [simplifiedEdges, setSimplifiedEdges] = useState([]);
  const [groupSummary, setGroupSummary] = useState(null);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const currentUserId = user?.id || user?._id || DEMO.user.id;

  const loadGroups = useCallback(async () => {
    if (isGuest) {
      const demoList = DEMO.groups || [];
      setGroups(demoList);
      if (demoList.length > 0 && !selectedGroupId) {
        setSelectedGroupId(demoList[0].id);
      }
      setIsLoadingGroups(false);
      return;
    }

    try {
      const res = await groupService.getAll();
      const fetched = res?.data?.groups || res?.groups || [];
      const list = Array.isArray(fetched) ? fetched : [];
      setGroups(list);
      if (list.length > 0 && !selectedGroupId) {
        const firstId = list[0].id || list[0]._id;
        setSelectedGroupId(firstId);
      }
    } catch {
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [isGuest, selectedGroupId]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups, refreshKey]);

  const activeGroup = useMemo(() => {
    return groups.find((g) => String(g.id || g._id) === String(selectedGroupId));
  }, [groups, selectedGroupId]);

  const memberNameMap = useMemo(() => {
    const map = new Map();
    if (activeGroup?.members) {
      activeGroup.members.forEach((m) => {
        const mId = m.id || m._id || m.userId;
        map.set(String(mId), m.name || m.userName || 'Member');
      });
    }
    map.set(String(currentUserId), user?.name || 'You');
    return map;
  }, [activeGroup, currentUserId, user]);

  const loadSettlementData = useCallback(
    async (groupId) => {
      if (!groupId) return;

      if (isGuest) {
        const demoGrp = (DEMO.groups || []).find((g) => g.id === groupId) || DEMO.groups[0];
        const rawBalances = demoGrp?.memberBalances || [];
        const rawSettlements = (demoGrp?.settlements || []).map((s, idx) => ({
          id: `demo-s-${idx}`,
          fromUserId: s.fromUserId || `u-${idx}`,
          toUserId: s.toUserId || `u-${idx + 1}`,
          fromName: s.fromName,
          toName: s.toName,
          amountPaisa: s.amountPaisa,
        }));

        setBalances(rawBalances);
        setOptimizedTransactions(rawSettlements);
        setSimplifiedEdges(rawSettlements);
        setGroupSummary({
          totalSpentFormatted: 'Rs. 42,800',
          fairSharePerMemberFormatted: 'Rs. 7,133',
          topPayer: { name: 'Aarav Gurung', totalPaidFormatted: 'Rs. 24,000' },
          lowestPayer: { name: 'Rohan Shrestha', totalPaidFormatted: 'Rs. 0' },
        });
        setIsLoadingSettlements(false);
        return;
      }

      setIsLoadingSettlements(true);
      try {
        const [optRes, simRes] = await Promise.allSettled([
          settlementService.optimize(groupId),
          settlementService.cancelCycles(groupId),
        ]);

        if (optRes.status === 'fulfilled') {
          const data = optRes.value?.data || optRes.value;
          setBalances(data?.balances || []);
          const rawTxs = data?.optimizedTransactions || data?.transactions || data?.settlements || [];
          setOptimizedTransactions(rawTxs);
          if (data?.groupSummary) {
            setGroupSummary(data.groupSummary);
          }
        } else {
          setBalances([]);
          setOptimizedTransactions([]);
        }

        if (simRes.status === 'fulfilled') {
          const simData = simRes.value?.data || simRes.value;
          const edges = simData?.simplifiedEdges || simData?.transactions || [];
          setSimplifiedEdges(edges);
        } else {
          setSimplifiedEdges([]);
        }
      } catch {
        setBalances([]);
        setOptimizedTransactions([]);
        setSimplifiedEdges([]);
      } finally {
        setIsLoadingSettlements(false);
        setIsRefreshing(false);
      }
    },
    [isGuest]
  );

  useEffect(() => {
    if (selectedGroupId) {
      loadSettlementData(selectedGroupId);
    }
  }, [selectedGroupId, loadSettlementData, refreshKey]);

  const handleRefresh = async () => {
    if (!selectedGroupId) return;
    setIsRefreshing(true);
    await loadSettlementData(selectedGroupId);
    toast.info('Settlement calculations refreshed');
  };

  const handleRunCycleCancellation = async () => {
    if (!selectedGroupId) return;
    setIsSimplifying(true);
    try {
      if (isGuest) {
        toast.warning('Demo Mode Active', 'Please log in to run graph optimizations. Interactions are disabled in demo preview mode.');
        return;
      }

      const res = await settlementService.cancelCycles(selectedGroupId);
      if (res?.success) {
        const simEdges = res.data?.simplifiedEdges || res.data?.transactions || [];
        setSimplifiedEdges(simEdges);
        toast.success(
          `Cycle cancellation complete. ${res.data?.cyclesEliminated || 0} circular debts eliminated.`
        );
      } else {
        toast.info(res?.message || 'Cycle elimination complete');
      }
    } catch (err) {
      toast.error(err?.message || 'Cycle cancellation failed');
    } finally {
      setIsSimplifying(false);
    }
  };

  const handleConfirmPayment = async ({ transaction, method, notes }) => {
    if (!transaction || !selectedGroupId) return;
    setIsSubmittingPayment(true);
    try {
      if (isGuest) {
        setActiveTransaction(null);
        toast.warning('Demo Mode Active', 'Please log in to record payments. Interactions are disabled in demo preview mode.');
        return;
      }

      const res = await settlementService.recordPayment({
        groupId: selectedGroupId,
        fromUserId: transaction.fromUserId,
        toUserId: transaction.toUserId,
        amountPaisa: transaction.amountPaisa,
        paymentMethod: method,
        notes,
      });

      if (res?.success) {
        toast.success('Settlement payment recorded successfully');
        setActiveTransaction(null);
        await loadSettlementData(selectedGroupId);
      } else {
        toast.error(res?.message || 'Could not record payment');
      }
    } catch (err) {
      toast.error(err?.message || 'Payment submission failed');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center text-primary">
              <Scale className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Settlements
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Intelligent debt minimization using Greedy Cash Flow & Graph Cycle Cancellation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingSettlements || !selectedGroupId}
            title="Recalculate debts"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (isGuest) {
                toast.warning('Please log in to use the What-If Simulator.');
                return;
              }
              setIsWhatIfOpen(true);
            }}
            disabled={!selectedGroupId}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            What-If Simulator
          </button>

          <button
            type="button"
            onClick={() => {
              if (isGuest) {
                toast.warning('Please log in to share settlement summaries.');
                return;
              }
              setIsShareOpen(true);
            }}
            disabled={!selectedGroupId}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary-hover shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            Share Summary
          </button>
        </div>
      </div>

      <SettlementStats
        balances={balances}
        transactions={optimizedTransactions}
        currentUserId={currentUserId}
      />

      <GroupSelector
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelectGroup={(id) => setSelectedGroupId(id)}
        isLoading={isLoadingGroups}
      />

      {groupSummary && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Outing Spend
            </span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 block">
              {groupSummary.totalSpentFormatted}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Fair Share Each
            </span>
            <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
              {groupSummary.fairSharePerMemberFormatted}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block font-bold">
              Top Contributor
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
              {groupSummary.topPayer?.name || 'Equal'}
            </span>
            <span className="text-[10px] text-slate-400">Paid the most for trip</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block font-bold">
              Lowest Contributor
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
              {groupSummary.lowestPayer?.name || 'Equal'}
            </span>
            <span className="text-[10px] text-slate-400">Owes payments to group</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Optimized Direct Settlements ({optimizedTransactions.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Greedy Minimum Cash Flow transfers computed for{' '}
                {activeGroup?.name || 'Selected Group'}
              </p>
            </div>
            {optimizedTransactions.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Transactions Minimized
              </span>
            )}
          </div>

          {isLoadingSettlements ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 animate-pulse flex items-center justify-between"
                >
                  <div className="w-48 h-4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="w-24 h-6 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              ))}
            </div>
          ) : optimizedTransactions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">All Settled Up</h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                There are no pending debts for this group. Everyone is in balance.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {optimizedTransactions.map((tx, idx) => (
                <OptimizedTransactionCard
                  key={idx}
                  transaction={tx}
                  currentUserId={currentUserId}
                  onRecordPayment={(t) => {
                    if (isGuest) {
                      toast.warning('Please log in to record settlement payments.');
                      return;
                    }
                    setActiveTransaction(t);
                  }}
                />
              ))}
            </div>
          )}

          <DebtGraphVisualizer
            optimizedTransactions={optimizedTransactions}
            simplifiedEdges={simplifiedEdges}
            onRunCycleCancellation={handleRunCycleCancellation}
            isSimplifying={isSimplifying}
          />
        </div>

        <div className="lg:col-span-5">
          <MemberBalanceList balances={balances} currentUserId={currentUserId} />
        </div>
      </div>

      <RecordPaymentModal
        isOpen={Boolean(activeTransaction)}
        onClose={() => setActiveTransaction(null)}
        transaction={activeTransaction}
        onConfirmPayment={handleConfirmPayment}
        isSubmitting={isSubmittingPayment}
      />

      <WhatIfSimulationModal
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
        groupId={selectedGroupId}
        groupMembers={activeGroup?.members || []}
        currentUserId={currentUserId}
      />

      <ShareableSettlementSummaryModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        groupName={activeGroup?.name || activeGroup?.title || 'Expense Group'}
        transactions={optimizedTransactions}
        balances={balances}
      />
    </div>
  );
}
