import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Layers, Wallet } from 'lucide-react';

export function ExpenseStats({ expenses = [], currentUserId }) {
  const totalAmountPaisa = expenses.reduce((acc, curr) => acc + (curr.amountPaisa || 0), 0);

  let totalPaidPaisa = 0;
  let totalSharePaisa = 0;

  expenses.forEach((exp) => {
    const payerId = exp.paidById?._id || exp.paidById?.id || exp.paidById;
    if (String(payerId) === String(currentUserId)) {
      totalPaidPaisa += exp.amountPaisa || 0;
    }

    const mySplit = (exp.splits || []).find((s) => {
      const sId = s.userId?._id || s.userId?.id || s.userId;
      return String(sId) === String(currentUserId);
    });

    if (mySplit) {
      totalSharePaisa += mySplit.amountPaisa || 0;
    }
  });

  const netBalancePaisa = totalPaidPaisa - totalSharePaisa;
  const isNetPositive = netBalancePaisa >= 0;

  const formatRs = (paisa) =>
    (Math.abs(paisa) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Volume
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
            Rs. {formatRs(totalAmountPaisa)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} recorded
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <ArrowUpRight className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            You Paid
          </div>
          <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
            Rs. {formatRs(totalPaidPaisa)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Out of pocket payments
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-900 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Your Share
          </div>
          <div className="text-lg font-extrabold text-violet-600 dark:text-violet-400 truncate">
            Rs. {formatRs(totalSharePaisa)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Your consumption share
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
            Net Standing
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
            {isNetPositive ? 'You are owed in total' : 'You owe in total'}
          </div>
        </div>
      </div>
    </div>
  );
}
