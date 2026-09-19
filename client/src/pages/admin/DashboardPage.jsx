import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/index.js';
import { getTimeGreeting } from '../../utils/greeting.js';
import DEMO from '../../demo/data.json';
import {
  AdminKpiCards,
  MonthlyExpenseChartCard,
  ExpensesByCategoryCard,
  RecentActivityCard,
  TopSpendingGroupsCard,
  RecentExpensesCard,
  QuickActionsCard,
  RecentSettlementsCard,
  SystemHealthCard,
  AdminPromoCard,
} from '../../components/admin/dashboard';

export function DashboardPage({
  onOpenNewGroup,
  onOpenNewExpense,
  onOptimizeSettlement,
  onViewAnalytics,
  onNavigateTab,
}) {
  const { user, isGuest } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [overviewData, setOverviewData] = useState(null);

  const adminFirstName = user?.name ? user.name.split(' ')[0] : 'Mahendra';

  const fetchOverview = useCallback(async () => {
    if (isGuest) {
      setOverviewData(DEMO.admin.overview);
      return;
    }
    try {
      const res = await adminService.getOverview();
      const data = res?.data || res;
      if (data && typeof data === 'object') {
        setOverviewData(data);
      } else {
        setOverviewData(DEMO.admin.overview);
      }
    } catch {
      setOverviewData(DEMO.admin.overview);
    }
  }, [isGuest]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const timePart = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setCurrentDateTime(`${datePart}  ${timePart}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {getTimeGreeting()}, {adminFirstName}
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Here's what's happening with SettleX today.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono self-start sm:self-auto shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>{currentDateTime || 'Sep 18, 2025  10:24 AM'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <div className="xl:col-span-9 flex flex-col justify-between gap-4">
          <AdminKpiCards
            totalUsers={overviewData?.totalUsers ?? 0}
            totalGroups={overviewData?.totalGroups ?? 0}
            totalExpenses={overviewData?.totalExpensesFormatted ?? 'Rs. 0'}
            pendingSettlements={overviewData?.pendingSettlements ?? 0}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch">
            <div className="lg:col-span-7 h-full">
              <MonthlyExpenseChartCard
                className="h-full"
                customPoints={overviewData?.monthlyTrend}
              />
            </div>
            <div className="lg:col-span-5 h-full">
              <ExpensesByCategoryCard
                className="h-full"
                customCategories={overviewData?.categoryBreakdown}
                totalAmountFormatted={overviewData?.totalExpensesFormatted ?? 'Rs. 0'}
              />
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 h-full flex flex-col">
          <RecentActivityCard
            className="h-full flex-1"
            activities={overviewData?.recentActivity}
            onViewAll={() => onNavigateTab?.('activity')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-4 xl:col-span-4 h-full">
          <TopSpendingGroupsCard
            className="h-full"
            groups={overviewData?.topSpendingGroups}
            onViewAll={() => onNavigateTab?.('groups')}
          />
        </div>
        <div className="lg:col-span-5 xl:col-span-5 h-full">
          <RecentExpensesCard
            className="h-full"
            expenses={overviewData?.recentExpenses}
            onViewAll={() => onNavigateTab?.('expenses')}
          />
        </div>
        <div className="lg:col-span-3 xl:col-span-3 h-full">
          <QuickActionsCard
            className="h-full"
            onAddGroup={onOpenNewGroup}
            onAddExpense={onOpenNewExpense}
            onOptimizeSettlement={onOptimizeSettlement}
            onViewAnalytics={onViewAnalytics}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-5 xl:col-span-5 h-full">
          <RecentSettlementsCard
            className="h-full"
            settlements={overviewData?.recentSettlements}
            onViewAll={() => onNavigateTab?.('settlements')}
          />
        </div>
        <div className="lg:col-span-4 xl:col-span-4 h-full">
          <SystemHealthCard className="h-full" systems={overviewData?.systemHealth} />
        </div>
        <div className="lg:col-span-3 xl:col-span-3 h-full">
          <AdminPromoCard
            className="h-full"
            totalGroups={overviewData ? `${overviewData.totalGroups}+` : '0+'}
            totalUsers={String(overviewData?.totalUsers ?? 0)}
            totalExpenses={overviewData?.totalExpensesFormatted ?? 'Rs. 0'}
          />
        </div>
      </div>
    </div>
  );
}
