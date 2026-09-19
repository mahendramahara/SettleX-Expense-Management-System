import React from 'react';
import { Award, Medal, Crown } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export function TopContributorsLeaderboard({ expenses = [], currentUserId }) {
  const payerMap = new Map();

  expenses.forEach((e) => {
    const payerId = e.paidById?._id || e.paidById?.id || e.paidById;
    if (!payerId) return;

    const idStr = String(payerId);
    const existing = payerMap.get(idStr) || {
      userId: idStr,
      name: e.paidByName || e.paidById?.name || 'Member',
      amountPaisa: 0,
      count: 0,
    };

    existing.amountPaisa += e.amountPaisa || 0;
    existing.count += 1;
    payerMap.set(idStr, existing);
  });

  const sortedPayers = Array.from(payerMap.values())
    .sort((a, b) => b.amountPaisa - a.amountPaisa)
    .slice(0, 5);

  const topAmount = sortedPayers[0]?.amountPaisa || 1;

  const formatRs = (paisa) =>
    ((paisa || 0) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Top Disbursers Leaderboard
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Upfront Capital</span>
      </div>

      {sortedPayers.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">
          No expenditure records available yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedPayers.map((payer, idx) => {
            const isCurrentUser = String(payer.userId) === String(currentUserId);
            const percentOfTop = Math.round((payer.amountPaisa / topAmount) * 100);

            return (
              <div
                key={payer.userId}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isCurrentUser
                    ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 text-center font-black text-xs text-slate-400 shrink-0">
                    #{idx + 1}
                  </div>
                  <Avatar name={payer.name} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {payer.name}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {payer.count} {payer.count === 1 ? 'bill covered' : 'bills covered'}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    Rs. {formatRs(payer.amountPaisa)}
                  </div>
                  <div className="w-16 h-1 rounded-full bg-slate-200 dark:bg-slate-800 mt-1 ml-auto overflow-hidden">
                    <div
                      style={{ width: `${percentOfTop}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
