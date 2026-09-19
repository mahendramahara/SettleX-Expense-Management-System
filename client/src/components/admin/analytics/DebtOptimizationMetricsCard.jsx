import React from 'react';
import { Sparkles, GitFork, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export function DebtOptimizationMetricsCard({ kpis = {} }) {
  const { debtReductionPercent = 0, rawDebtsCount = 0, simplifiedDebtsCount = 0 } = kpis;

  const eliminatedCount = Math.max(0, rawDebtsCount - simplifiedDebtsCount);

  return (
    <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                SettleX Settlement Engine
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Greedy Cycle Optimizer Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated topological debt minimization and cycle elimination telemetry.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400 block">Overall Simplification</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {debtReductionPercent}% Less Transactions
          </span>
        </div>
      </div>

      {/* Algorithmic Flow Comparison Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Raw Peer Transfers
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{rawDebtsCount}</p>
          <span className="text-xs text-slate-500 mt-0.5 block">
            Initial unoptimized debtor-to-creditor edges
          </span>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-800/40">
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
            Cycles Cancelled
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {eliminatedCount}
          </p>
          <span className="text-xs text-slate-500 mt-0.5 block">
            Redundant multi-party transfers eliminated
          </span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Final Settlement Path
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {simplifiedDebtsCount}
          </p>
          <span className="text-xs text-slate-500 mt-0.5 block">
            Optimal transactions needed to zero all balances
          </span>
        </div>
      </div>
    </div>
  );
}
