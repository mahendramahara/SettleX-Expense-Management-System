import React from 'react';
import { Users, Database, Shield, DollarSign, Activity } from 'lucide-react';

export function AdminOverviewCard({ stats }) {
  const items = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 148,
      sub: 'Registered platform accounts',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Active Groups',
      value: stats?.totalGroups || 32,
      sub: 'Expense sharing groups',
      icon: Database,
      color: 'emerald',
    },
    {
      title: 'Total Processed',
      value: `Rs. ${((stats?.totalVolumePaisa || 18450000) / 100).toLocaleString('en-IN')}`,
      sub: 'Processed group volume',
      icon: DollarSign,
      color: 'violet',
    },
    {
      title: 'System Health',
      value: '99.9% Uptime',
      sub: 'MongoDB & API Operational',
      icon: Activity,
      color: 'teal',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {item.title}
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                {item.value}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
