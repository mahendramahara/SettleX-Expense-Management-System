import React from 'react';
import { Users, PieChart } from 'lucide-react';

const PALETTE = [
  'bg-blue-500 text-white',
  'bg-violet-500 text-white',
  'bg-emerald-500 text-white',
  'bg-amber-500 text-white',
  'bg-rose-500 text-white',
  'bg-cyan-500 text-white',
];

const BG_PALETTE = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
];

export function GroupSpendingDistribution({ groups = [], totalSpendPaisa = 0 }) {
  const sorted = [...groups].sort((a, b) => (b.totalSpendPaisa || 0) - (a.totalSpendPaisa || 0));

  const formatRs = (paisa) =>
    ((paisa || 0) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Spending by Group Distribution
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {sorted.length} {sorted.length === 1 ? 'group' : 'groups'}
        </span>
      </div>

      {totalSpendPaisa > 0 && (
        <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
          {sorted.map((grp, idx) => {
            const percent = ((grp.totalSpendPaisa || 0) / totalSpendPaisa) * 100;
            if (percent <= 0) return null;
            return (
              <div
                key={grp.id || idx}
                style={{ width: `${percent}%` }}
                className={`${BG_PALETTE[idx % BG_PALETTE.length]} transition-all duration-300`}
                title={`${grp.title || grp.name}: ${percent.toFixed(1)}%`}
              />
            );
          })}
        </div>
      )}

      <div className="space-y-3 pt-1">
        {sorted.map((grp, idx) => {
          const spend = grp.totalSpendPaisa || 0;
          const percent = totalSpendPaisa > 0 ? (spend / totalSpendPaisa) * 100 : 0;
          const membersCount = grp.membersCount || grp.members?.length || 1;
          const perMemberPaisa = membersCount > 0 ? Math.round(spend / membersCount) : 0;

          return (
            <div key={grp.id || idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${BG_PALETTE[idx % BG_PALETTE.length]}`}
                  />
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    {grp.title || grp.name}
                  </span>
                  <span className="text-[10px] text-slate-400">({membersCount} members)</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    Rs. {formatRs(spend)}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1.5 font-semibold">
                    {percent.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, percent)}%` }}
                  className={`h-full rounded-full ${BG_PALETTE[idx % BG_PALETTE.length]} transition-all`}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Avg / member: Rs. {formatRs(perMemberPaisa)}</span>
                <span>{grp.expensesCount || 0} expenses recorded</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
