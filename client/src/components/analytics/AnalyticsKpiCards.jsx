import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Layers, BarChart3, TrendingUp } from 'lucide-react';

export function AnalyticsKpiCards({
  totalVolumePaisa = 0,
  userPaidPaisa = 0,
  userSharePaisa = 0,
  averageExpensePaisa = 0,
  largestExpensePaisa = 0,
  totalExpenseCount = 0,
}) {
  const formatRs = (paisa) =>
    (Math.abs(paisa) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const netBalancePaisa = userPaidPaisa - userSharePaisa;
  const isNetPositive = netBalancePaisa >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-primary shrink-0">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Spend Volume
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
            Rs. {formatRs(totalVolumePaisa)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Across {totalExpenseCount} shared transactions
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <ArrowUpRight className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            You Disbursed
          </div>
          <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
            Rs. {formatRs(userPaidPaisa)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Upfront payments covered by you
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-900 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Your Effective Share
          </div>
          <div className="text-lg font-extrabold text-violet-600 dark:text-violet-400 truncate">
            Rs. {formatRs(userSharePaisa)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Your individual consumption
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div
          className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${
            isNetPositive
              ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-100 dark:border-teal-900 text-teal-600 dark:text-teal-400'
              : 'bg-rose-50 dark:bg-rose-950/50 border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400'
          }`}
        >
          {isNetPositive ? (
            <ArrowUpRight className="w-5 h-5" />
          ) : (
            <ArrowDownLeft className="w-5 h-5" />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Net Ledger Position
          </div>
          <div
            className={`text-lg font-extrabold truncate ${
              isNetPositive
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isNetPositive ? '+' : '-'}Rs. {formatRs(netBalancePaisa)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {isNetPositive ? 'Overall surplus receivable' : 'Overall deficit payable'}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Average Ticket Size
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
            Rs. {formatRs(averageExpensePaisa)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Mean value per expense entry
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-100 dark:border-cyan-900 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Peak Transaction
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
            Rs. {formatRs(largestExpensePaisa)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Single largest recorded bill
          </div>
        </div>
      </div>
    </div>
  );
}
