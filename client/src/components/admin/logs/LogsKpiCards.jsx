import React from 'react';
import { Terminal, ShieldAlert, Scale, Users } from 'lucide-react';

export default function LogsKpiCards({ summary = {}, isLoading = false }) {
  const {
    totalLogs = 0,
    securityEvents = 0,
    financialEvents = 0,
    activeOperatorsCount = 0,
  } = summary;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Audit Events */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Terminal className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
            Total Trace Logs
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {isLoading ? '...' : totalLogs}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            Recorded audit events
          </span>
        </div>
      </div>

      {/* Security & Access Events */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
            Security & Auth
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {isLoading ? '...' : securityEvents}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            Auth & privilege events
          </span>
        </div>
      </div>

      {/* Financial Operations */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Scale className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
            Financial Actions
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {isLoading ? '...' : financialEvents}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            Settlements & expenses
          </span>
        </div>
      </div>

      {/* Active Operators */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
            Active Operators
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {isLoading ? '...' : activeOperatorsCount}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            Admins & system actors
          </span>
        </div>
      </div>
    </div>
  );
}
