import React from 'react';
import { ShieldAlert, TrendingUp, AlertOctagon, Send } from 'lucide-react';

export default function AnomalyKpiCards({ summary = {}, isLoading = false }) {
  const {
    anomaliesCount = 0,
    severeCount = 0,
    elevatedCount = 0,
    totalDisproportionFormatted = 'Rs. 0',
    averageDeviationPercent = 0,
    totalAdvisoriesDispatched = 0,
  } = summary;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Flagged Asymmetric Spenders */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
            Flagged Spenders
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {isLoading ? '...' : anomaliesCount}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {severeCount} critical, {elevatedCount} elevated
          </span>
        </div>
      </div>

      {/* Disproportionate Volume */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
            Outlier Volume
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5 truncate">
            {isLoading ? '...' : totalDisproportionFormatted}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">Exceeding fair share</span>
        </div>
      </div>

      {/* Mean Overspend Deviation */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
            Mean Variance
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {isLoading ? '...' : `+${averageDeviationPercent}%`}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">Above peer benchmarks</span>
        </div>
      </div>

      {/* Active Advisories Dispatched */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
          <Send className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
            Advisories Sent
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {isLoading ? '...' : totalAdvisoriesDispatched}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">Notices dispatched</span>
        </div>
      </div>
    </div>
  );
}
