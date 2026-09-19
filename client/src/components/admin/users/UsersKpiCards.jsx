import React from 'react';
import { Users, UserCheck, UserX, ShieldCheck } from 'lucide-react';

export default function UsersKpiCards({ counts = {} }) {
  const cards = [
    {
      label: 'Total Users',
      value: counts.total || 0,
      icon: Users,
      bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Active Users',
      value: counts.active || 0,
      icon: UserCheck,
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Suspended',
      value: counts.suspended || 0,
      icon: UserX,
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      label: 'Verified Emails',
      value: counts.verified || 0,
      icon: ShieldCheck,
      bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                {card.label}
              </span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {card.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
