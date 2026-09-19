import React from 'react';
import { Scale, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export function RecentSettlementsCard({
  settlements: customSettlements = null,
  onViewAll,
  className = '',
}) {
  const settlements = Array.isArray(customSettlements) ? customSettlements : [];

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-colors h-full ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Recent Settlements
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Direct debt repayments and status audits
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {settlements.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            No pending settlements
          </span>
          <p className="text-[11px] text-slate-400">
            All member balances are settled across active circles.
          </p>
        </div>
      ) : (
        <div className="pt-3 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/60">
                <th className="pb-2">From</th>
                <th className="pb-2">To</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Group</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
              {settlements.map((s) => {
                const isCompleted = s.status === 'Completed';
                return (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">{s.from}</td>
                    <td className="py-2.5 font-medium text-slate-600 dark:text-slate-300">
                      {s.to}
                    </td>
                    <td className="py-2.5 font-black text-slate-900 dark:text-white">{s.amount}</td>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400">{s.group}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{s.status}</span>
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-medium text-slate-400 dark:text-slate-500">
                      {s.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
