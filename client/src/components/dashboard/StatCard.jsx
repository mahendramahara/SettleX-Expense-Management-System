import React from 'react';

export function StatCard({
  icon: Icon,
  label,
  value,
  valueColor = 'text-slate-900 dark:text-white',
  badgeBg = 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-150 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${badgeBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</div>
        <div className={`mt-1 text-2xl font-black tracking-tight ${valueColor}`}>{value}</div>
      </div>
    </div>
  );
}
