import React from 'react';
import { Coins, Scale, Layers, TrendingUp } from 'lucide-react';

export function SettlementMetricsStrip({ stats = {} }) {
  const {
    totalPendingDebtFormatted = 'Rs. 0',
    totalSettlementsCount = 0,
    optimizedTransactionsCount = 0,
    reductionPercent = 0,
    rawTransactionsCount = 0,
  } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Pending Debt Volume */}
      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Pending Debt Volume
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          {totalPendingDebtFormatted}
        </p>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
          Total unsettled balance across platform
        </span>
      </div>

      {/* Active Settlement Transfers */}
      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Unsettled Debts
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          {totalSettlementsCount}
        </p>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
          Pairwise transactions awaiting payment
        </span>
      </div>

      {/* Simplified Transfers */}
      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Optimized Transfers
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          {optimizedTransactionsCount}
        </p>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
          Reduced from {rawTransactionsCount} raw peer splits
        </span>
      </div>

      {/* Graph Efficiency */}
      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Transfer Reduction
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          {reductionPercent}%
        </p>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
          Cycle cancellation algorithm efficiency
        </span>
      </div>
    </div>
  );
}
