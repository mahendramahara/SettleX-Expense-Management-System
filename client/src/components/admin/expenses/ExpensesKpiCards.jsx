import React, { useMemo } from 'react';
import { Receipt, TrendingUp, Calculator, FolderKanban } from 'lucide-react';

export default function ExpensesKpiCards({
  stats = { totalExpenses: 0, totalAmountFormatted: 'Rs. 0', totalAmountPaisa: 0 },
  groupsCount = 0,
}) {
  const averageExpenseFormatted = useMemo(() => {
    if (!stats.totalExpenses || stats.totalExpenses === 0) return 'Rs. 0';
    const avgPaisa = Math.round((stats.totalAmountPaisa || 0) / stats.totalExpenses);
    return `Rs. ${(avgPaisa / 100).toLocaleString('en-IN')}`;
  }, [stats]);

  const cards = [
    {
      label: 'Total Expenses',
      value: (stats.totalExpenses || 0).toLocaleString(),
      subtext: 'Recorded across all circles',
      icon: Receipt,
      bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Gross Platform Volume',
      value: stats.totalAmountFormatted || 'Rs. 0',
      subtext: 'Cumulative financial flow',
      icon: TrendingUp,
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Average Bill Size',
      value: averageExpenseFormatted,
      subtext: 'Per recorded transaction',
      icon: Calculator,
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Groups Monitored',
      value: groupsCount,
      subtext: 'Active expense circles',
      icon: FolderKanban,
      bg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                {c.label}
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {c.value}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">{c.subtext}</span>
            </div>
            <div
              className={`w-11 h-11 rounded-2xl ${c.bg} flex items-center justify-center shrink-0`}
            >
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
