import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart3, RotateCw } from 'lucide-react';
import { AnalyticsKpiCards } from '../../components/analytics/AnalyticsKpiCards';
import { GroupSpendingDistribution } from '../../components/analytics/GroupSpendingDistribution';
import { SplitStrategyBreakdown } from '../../components/analytics/SplitStrategyBreakdown';
import { TopContributorsLeaderboard } from '../../components/analytics/TopContributorsLeaderboard';
import { SpendingTrendChart } from '../../components/analytics/SpendingTrendChart';
import { expenseService, groupService } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DEMO } from '../../demo/index.js';

export function AnalyticsPage({ refreshKey }) {
  const { user, isGuest } = useAuth();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const currentUserId = user?.id || user?._id || DEMO.user.id;

  const loadData = useCallback(async () => {
    if (isGuest) {
      setGroups(DEMO.groups || DEMO.dashboard?.groups || []);
      setExpenses(DEMO.dashboard?.recentExpenses || []);
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
      setGroups([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isGuest]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    toast.info('Analytics metrics synchronized');
  };

  const metrics = useMemo(() => {
    let totalVolumePaisa = 0;
    let userPaidPaisa = 0;
    let userSharePaisa = 0;
    let largestExpensePaisa = 0;

    expenses.forEach((exp) => {
      const amt = exp.amountPaisa || 0;
      totalVolumePaisa += amt;

      if (amt > largestExpensePaisa) {
        largestExpensePaisa = amt;
      }

      const payerId = exp.paidById?._id || exp.paidById?.id || exp.paidById;
      if (String(payerId) === String(currentUserId)) {
        userPaidPaisa += amt;
      }

      const mySplit = (exp.splits || []).find((s) => {
        const sId = s.userId?._id || s.userId?.id || s.userId;
        return String(sId) === String(currentUserId);
      });

      if (mySplit) {
        userSharePaisa += mySplit.amountPaisa || 0;
      }
    });

    const averageExpensePaisa =
      expenses.length > 0 ? Math.round(totalVolumePaisa / expenses.length) : 0;

    return {
      totalVolumePaisa,
      userPaidPaisa,
      userSharePaisa,
      averageExpensePaisa,
      largestExpensePaisa,
      totalExpenseCount: expenses.length,
    };
  }, [expenses, currentUserId]);

  const enrichedGroups = useMemo(() => {
    return groups.map((grp) => {
      const gId = grp.id || grp._id;
      const grpExpenses = expenses.filter((e) => {
        const egId = e.groupId?._id || e.groupId?.id || e.groupId;
        return String(egId) === String(gId);
      });

      const totalSpendPaisa =
        grpExpenses.length > 0
          ? grpExpenses.reduce((acc, curr) => acc + (curr.amountPaisa || 0), 0)
          : grp.totalSpendPaisa || 0;

      return {
        ...grp,
        totalSpendPaisa,
        expensesCount: grpExpenses.length || grp.expensesCount || 0,
      };
    });
  }, [groups, expenses]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 dark:bg-cyan-400/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Analytics & Insights
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Comprehensive breakdown of cash disbursements, group allocations, and split algorithms
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            title="Refresh Analytics"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      <AnalyticsKpiCards
        totalVolumePaisa={metrics.totalVolumePaisa}
        userPaidPaisa={metrics.userPaidPaisa}
        userSharePaisa={metrics.userSharePaisa}
        averageExpensePaisa={metrics.averageExpensePaisa}
        largestExpensePaisa={metrics.largestExpensePaisa}
        totalExpenseCount={metrics.totalExpenseCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <GroupSpendingDistribution
            groups={enrichedGroups}
            totalSpendPaisa={metrics.totalVolumePaisa}
          />
          <SpendingTrendChart expenses={expenses} />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <TopContributorsLeaderboard expenses={expenses} currentUserId={currentUserId} />
          <SplitStrategyBreakdown expenses={expenses} />
        </div>
      </div>
    </div>
  );
}
