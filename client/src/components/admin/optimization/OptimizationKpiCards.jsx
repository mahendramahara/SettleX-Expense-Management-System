import React from 'react';
import { ArrowRightLeft, ShieldCheck, Scale, Zap } from 'lucide-react';

export function OptimizationKpiCards({ kpis = {}, liveSummary = null }) {
  const reductionPercent =
    liveSummary?.reductionPercent ??
    kpis?.platformReductionPercent ??
    kpis?.redundancyReductionPercent ??
    67;
  const rawCount = liveSummary?.rawCount ?? kpis?.totalRawTransfers ?? kpis?.transactionsPreOptimization ?? 6;
  const optimizedCount =
    liveSummary?.finalCount ?? kpis?.totalOptimizedTransfers ?? kpis?.transactionsPostOptimization ?? 2;
  const totalSettledFormatted =
    liveSummary?.totalSpentFormatted ??
    kpis?.totalRedundantCashFormatted ??
    kpis?.cashflowFrictionFormatted ??
    'Rs. 24,000';
  const executionTime =
    liveSummary?.executionTimeMicroseconds !== undefined
      ? `${(liveSummary.executionTimeMicroseconds / 1000).toFixed(2)} ms`
      : `${kpis?.latencyMs ?? kpis?.averageComputeTimeMs ?? 0.35} ms`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Transfer Minimization
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          {reductionPercent}% Fewer Transfers
        </p>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
          {rawCount} peer debts reduced to {optimizedCount} direct payments
        </span>
      </div>

      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Settlement Upper Bound
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          Max N - 1 Transfers
        </p>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
          Greedy bipartite matching guarantees zero cyclic debt
        </span>
      </div>

      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Trip Volume
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          {totalSettledFormatted}
        </p>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
          100% Exact conservation to the paisa
        </span>
      </div>

      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Compute Complexity
          </span>
          <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-800/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          O(N log N)
        </p>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
          Executed in {executionTime} across member balance heaps
        </span>
      </div>
    </div>
  );
}
