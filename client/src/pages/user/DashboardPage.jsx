import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  FileText,
  TrendingDown,
  TrendingUp,
  Plus,
  Sparkles,
  Receipt,
  Calendar,
  Layers,
  ArrowUpRight,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { GroupCard } from '../../components/dashboard/GroupCard';
import { SettlementOptimizerPreview } from '../../components/dashboard/SettlementOptimizerPreview';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { userService } from '../../services/index.js';
import { DEMO } from '../../demo/index.js';

export function DashboardPage({ onOpenNewExpense, onOpenNewGroup, refreshKey = 0 }) {
  const { user, isGuest, logout } = useAuth();
  const toast = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenExpense = () => {
    if (isGuest) {
      toast.warning('Demo Mode Active', 'Please log in to add expenses. Interactions are disabled in demo preview mode.');
      return;
    }
    onOpenNewExpense?.();
  };

  const handleOpenGroup = () => {
    if (isGuest) {
      toast.warning('Demo Mode Active', 'Please log in to create groups. Interactions are disabled in demo preview mode.');
      return;
    }
    onOpenNewGroup?.();
  };

  const loadDashboard = useCallback(async () => {
    if (isGuest) {
      setDashboardData(DEMO.dashboard);
      return;
    }

    setIsLoading(true);
    try {
      const res = await userService.getDashboard();
      if (res?.data) {
        setDashboardData(res.data);
      } else {
        setDashboardData(null);
      }
    } catch {
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, refreshKey]);

  const stats = dashboardData?.stats || (isGuest ? DEMO.dashboard.stats : {
    totalGroups: 0,
    totalExpensesPaisa: 0,
    youOwePaisa: 0,
    youAreOwedPaisa: 0,
    netBalancePaisa: 0,
  });

  const totalExpensesFormatted = `Rs. ${((stats.totalExpensesPaisa || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  const youOweFormatted = `Rs. ${((stats.youOwePaisa || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  const youAreOwedFormatted = `Rs. ${((stats.youAreOwedPaisa || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const statsData = [
    {
      id: 'stat-groups',
      icon: Users,
      label: 'Total Groups',
      value: String(stats.totalGroups || 0),
      badgeBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
      valueColor: 'text-slate-900 dark:text-white',
    },
    {
      id: 'stat-expenses',
      icon: FileText,
      label: 'Total Expenses',
      value: totalExpensesFormatted,
      badgeBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      valueColor: 'text-slate-900 dark:text-white',
    },
    {
      id: 'stat-owe',
      icon: TrendingDown,
      label: 'You Owe',
      value: youOweFormatted,
      badgeBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
      valueColor: 'text-rose-600 dark:text-rose-400',
    },
    {
      id: 'stat-owed',
      icon: TrendingUp,
      label: "You're Owed",
      value: youAreOwedFormatted,
      badgeBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  const groupsList = dashboardData?.groups && dashboardData.groups.length > 0
    ? dashboardData.groups
    : (isGuest ? DEMO.dashboard.groups : []);

  const recentExpenses = dashboardData?.recentExpenses && dashboardData.recentExpenses.length > 0
    ? dashboardData.recentExpenses
    : (isGuest ? DEMO.dashboard.recentExpenses : []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {isGuest && (
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:border-blue-800/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/20 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  Live Demo — Sample Nepali Group Data
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300 opacity-90 mt-0.5 max-w-lg">
                  You are viewing SettleX with realistic mock data: 4 groups, 46 expenses, and
                  Greedy Cash Flow debt minimization. All figures are read-only in demo mode.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  logout();
                  toast.info('Demo Exited', 'You have left demo mode.');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer border border-blue-200 dark:border-blue-700"
              >
                Exit Demo
              </button>
              <Badge variant="info" size="sm">
                Demo Mode
              </Badge>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => (
          <StatCard
            key={stat.id}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            badgeBg={stat.badgeBg}
            valueColor={stat.valueColor}
          />
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Your Groups
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live balances and expense breakdown per group
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleOpenGroup} icon={Plus}>
              New Group
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleOpenExpense}
              icon={Receipt}
            >
              New Expense
            </Button>
          </div>
        </div>

        {groupsList.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Groups Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Create your first shared group for trips, roommates, or projects to begin recording
              expenses.
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenGroup} icon={Plus}>
              Create First Group
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {groupsList.map((group) => (
              <GroupCard
                key={group.id}
                title={group.title || group.name}
                membersCount={group.membersCount}
                expensesCount={group.expensesCount}
                balanceType={group.balanceType}
                balanceAmount={group.balanceAmount}
                imageUrl={group.imageUrl}
              />
            ))}
          </div>
        )}
      </div>

      {recentExpenses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Recent Expenses
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {recentExpenses.length} transactions recorded
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/60 overflow-hidden shadow-sm">
            {recentExpenses.map((exp) => {
              const amountRs = (exp.amountPaisa / 100).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
              const dateStr = exp.createdAt
                ? new Date(exp.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Today';

              return (
                <div
                  key={exp.id || exp._id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {exp.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{exp.groupName || 'Group Expense'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      Rs. {amountRs}
                    </div>
                    <span className="inline-block text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-0.5">
                      {exp.splitType || 'EQUAL'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SettlementOptimizerPreview />
    </div>
  );
}
