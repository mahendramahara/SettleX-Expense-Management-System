import React from 'react';
import { FolderKanban, Users, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export function GroupBalanceBreakdownCard({ group, balances = [], stats = {}, onClose }) {
  if (!group) return null;

  return (
    <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{group.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                Circle Balance Sheet
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Net balance audit and cyclic debt optimization for this group.
            </p>
          </div>
        </div>

        {/* Algorithm Insight Badge */}
        {stats.reductionPercent > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Cycle Cancellation: {stats.reductionPercent}% fewer transactions</span>
          </div>
        )}
      </div>

      {/* Member Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {balances.map((member) => {
          const isCreditor = member.status === 'Creditor';
          const isDebtor = member.status === 'Debtor';
          const isSettled = member.status === 'Settled';

          return (
            <div
              key={member.userId}
              className={`p-3.5 rounded-xl border transition-all ${
                isCreditor
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40'
                  : isDebtor
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-800/40'
                    : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Avatar name={member.userName || 'Member'} className="w-8 h-8 text-xs shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {member.userName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{member.userEmail}</p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {isCreditor ? 'Gets Back' : isDebtor ? 'Owes' : 'Status'}
                </span>
                <span
                  className={`text-xs font-bold ${
                    isCreditor
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isDebtor
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500'
                  }`}
                >
                  {isCreditor
                    ? `+${member.netBalanceFormatted}`
                    : isDebtor
                      ? `-${member.netBalanceFormatted}`
                      : 'Settled'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
