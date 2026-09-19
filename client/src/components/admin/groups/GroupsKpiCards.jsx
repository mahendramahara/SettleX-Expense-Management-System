import React from 'react';
import { FolderKanban, Users, Receipt, TrendingUp } from 'lucide-react';

export default function GroupsKpiCards({ groups = [], totalCount = 0 }) {
  const totalGroups = totalCount || groups.length;
  const totalMembersAssigned = groups.reduce((acc, g) => acc + (g.members?.length || 0), 0);
  const avgMembers = groups.length > 0 ? (totalMembersAssigned / groups.length).toFixed(1) : '0';
  const totalBills = groups.reduce((acc, g) => acc + (g.totalExpensesCount || 0), 0);

  const cards = [
    {
      label: 'Total Circles',
      value: totalGroups,
      subtext: 'Active expense groups',
      icon: FolderKanban,
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Member Assignments',
      value: totalMembersAssigned,
      subtext: 'Aggregated participants',
      icon: Users,
      bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Avg Members / Group',
      value: avgMembers,
      subtext: 'Group size distribution',
      icon: TrendingUp,
      bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Recorded Group Bills',
      value: totalBills,
      subtext: 'Platform transactions',
      icon: Receipt,
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
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
