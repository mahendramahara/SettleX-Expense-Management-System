import React from 'react';
import { Layers, CheckCircle2 } from 'lucide-react';

export function SplitStrategyCard({ strategies = [] }) {
  return (
    <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md flex flex-col">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Split Strategy Adoption
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            How users partition shared group expenses across circles.
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
          <Layers className="w-4 h-4 text-indigo-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
        {strategies.map((strat, idx) => {
          const isPrimary = strat.percentage >= 40;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                isPrimary
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/50'
                  : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/60'
              }`}
            >
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  {strat.label}
                </span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {strat.percentage}%
                </p>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  {strat.count} recorded transactions
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Flow</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {strat.amountFormatted}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
