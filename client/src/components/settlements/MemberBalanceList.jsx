import React from 'react';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export function MemberBalanceList({ balances = [], currentUserId }) {
  const sorted = [...balances].sort((a, b) => b.netBalancePaisa - a.netBalancePaisa);

  const formatRs = (paisa) =>
    (Math.abs(paisa || 0) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const maxPaidItem = [...balances].sort(
    (a, b) => (b.totalPaidPaisa || 0) - (a.totalPaidPaisa || 0)
  )[0];

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Trip Member Balances
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {balances.length} {balances.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      <div className="space-y-2">
        {sorted.map((item, index) => {
          const isMe = String(item.userId) === String(currentUserId);
          const isPositive = (item.netBalancePaisa || 0) > 0;
          const isNegative = (item.netBalancePaisa || 0) < 0;
          const isTopPayer =
            maxPaidItem &&
            maxPaidItem.userId === item.userId &&
            (maxPaidItem.totalPaidPaisa || 0) > 0;

          return (
            <div
              key={item.userId || index}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                isMe
                  ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={item.name || 'Member'} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.name || 'Member'}
                    </span>
                    {isMe && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        You
                      </span>
                    )}
                    {isTopPayer && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                        Top Payer
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {item.totalPaidPaisa !== undefined
                      ? `Paid Rs. ${formatRs(item.totalPaidPaisa)} out of pocket`
                      : item.email || ''}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div
                  className={`text-xs font-extrabold ${
                    isPositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isNegative
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isPositive ? '+' : isNegative ? '-' : ''}Rs. {formatRs(item.netBalancePaisa)}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {isPositive ? 'gets back' : isNegative ? 'owes group' : 'settled up'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
