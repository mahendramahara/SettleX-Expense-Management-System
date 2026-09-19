import React from 'react';
import { Users, Receipt, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

export function GroupCard({
  title,
  membersCount,
  expensesCount,
  balanceType = 'settled',
  balanceAmount,
  imageUrl,
  onClick,
}) {
  const isOwe = balanceType === 'owe';
  const isOwed = balanceType === 'owed';

  return (
    <div
      onClick={onClick}
      className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Users className="w-6 h-6 text-slate-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />

        <div className="absolute bottom-2 left-2 right-2">
          {isOwe && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/90 text-white backdrop-blur-sm">
              <TrendingDown className="w-3 h-3" />
              {balanceAmount}
            </span>
          )}
          {isOwed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-sm">
              <TrendingUp className="w-3 h-3" />
              {balanceAmount}
            </span>
          )}
          {!isOwe && !isOwed && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/80 text-slate-200 backdrop-blur-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Settled up
            </span>
          )}
        </div>
      </div>

      <div className="p-3 flex flex-col gap-1.5">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {membersCount} members
          </span>
          <span className="flex items-center gap-1">
            <Receipt className="w-3 h-3" />
            {expensesCount} expenses
          </span>
        </div>
      </div>
    </div>
  );
}
