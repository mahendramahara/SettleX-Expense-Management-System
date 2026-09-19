import React from 'react';
import { TrendingUp, Receipt, Calculator, Users, Sparkles, FolderKanban } from 'lucide-react';

export function AnalyticsKpiStrip({ kpis = {} }) {
  const {
    totalVolumeFormatted = 'Rs. 0',
    totalTransactions = 0,
    averageExpenseFormatted = 'Rs. 0',
    activeUsersCount = 0,
    totalUsersCount = 0,
    activeCirclesCount = 0,
    debtReductionPercent = 0,
  } = kpis;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Gross Platform Volume */}
      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Gross Volume Flow
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          {totalVolumeFormatted}
        </p>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
          Total processed across circles
        </span>
      </div>

      {/* Transaction Throughput */}
      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Transactions
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          {totalTransactions.toLocaleString()}
        </p>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
          Average bill: {averageExpenseFormatted}
        </span>
      </div>

      {/* Active User Base */}
      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Active Accounts
          </span>
          <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-800/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{activeUsersCount}</p>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
          Out of {totalUsersCount} registered users
        </span>
      </div>

      {/* Graph Efficiency */}
      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Cycle Optimization
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          {debtReductionPercent}%
        </p>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
          Redundant debt eliminated
        </span>
      </div>
    </div>
  );
}
