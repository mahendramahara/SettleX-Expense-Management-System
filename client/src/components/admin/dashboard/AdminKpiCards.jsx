import React from 'react';
import { Users, FolderKanban, Receipt, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function AdminKpiCards({
  totalUsers = 0,
  totalGroups = 0,
  totalExpenses = 'Rs. 0',
  pendingSettlements = 0,
}) {
  const cards = [
    {
      id: 'kpi-users',
      title: 'Total Users',
      value: String(totalUsers),
      trend: '12% vs. last month',
      trendDirection: 'up',
      icon: Users,
      iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      borderClass: 'border-blue-500/20',
    },
    {
      id: 'kpi-groups',
      title: 'Total Groups',
      value: String(totalGroups),
      trend: '18% vs. last month',
      trendDirection: 'up',
      icon: FolderKanban,
      iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-500/20',
    },
    {
      id: 'kpi-expenses',
      title: 'Total Expenses',
      value: totalExpenses,
      trend: '24% vs. last month',
      trendDirection: 'up',
      icon: Receipt,
      iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
      borderClass: 'border-purple-500/20',
    },
    {
      id: 'kpi-settlements',
      title: 'Pending Settlements',
      value: String(pendingSettlements),
      trend: '36% vs. last month',
      trendDirection: 'down',
      icon: Clock,
      iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      borderClass: 'border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isUp = card.trendDirection === 'up';

        return (
          <div
            key={card.id}
            className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200/80 dark:border-slate-800/80 ${card.borderClass} shadow-xs flex items-center gap-4 transition-all hover:border-blue-400 dark:hover:border-slate-700`}
          >
            <div
              className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center shrink-0 shadow-inner`}
            >
              <Icon className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block truncate">
                {card.title}
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {card.value}
              </div>
              <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold">
                {isUp ? (
                  <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{card.trend}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center text-rose-600 dark:text-rose-400">
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>{card.trend}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
