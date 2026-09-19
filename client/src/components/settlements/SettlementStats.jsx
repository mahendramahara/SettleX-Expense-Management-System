import React from 'react';
import { Scale, ArrowRightLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function SettlementStats({
  balances = [],
  transactions = [],
  currentUserId,
  totalDebtPaisa: propDebtPaisa,
  rawDebtCount: propRawCount,
  optimizedCount: propOptimizedCount,
  membersCount: propMembersCount,
}) {
  const formatRs = (paisa) =>
    ((Math.abs(paisa || 0)) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const computedDebtPaisa =
    propDebtPaisa ??
    balances.reduce((acc, b) => acc + (b.netBalancePaisa > 0 ? b.netBalancePaisa : 0), 0);

  const computedOptimizedCount = propOptimizedCount ?? transactions.length;
  const computedMembersCount = propMembersCount ?? balances.length;

  const rawCount =
    propRawCount ?? (computedMembersCount > 1 ? (computedMembersCount * (computedMembersCount - 1)) / 2 : 0);

  const savedTransfers = Math.max(0, rawCount - computedOptimizedCount);
  const reductionPercent = rawCount > 0 ? Math.round((savedTransfers / rawCount) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Scale className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Group Debt
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
            Rs. {formatRs(computedDebtPaisa)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Across active group balances
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
          <ArrowRightLeft className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Optimal Payments
          </div>
          <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 truncate">
            {computedOptimizedCount} {computedOptimizedCount === 1 ? 'Payment' : 'Payments'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Greedy flow minimal path
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Transfer Minimization
          </div>
          <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
            {reductionPercent}% Reduced
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {savedTransfers} redundant transfers saved
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Group Coverage
          </div>
          <div className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
            {computedMembersCount} Members
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Zero-sum balance invariant
          </div>
        </div>
      </div>
    </div>
  );
}
