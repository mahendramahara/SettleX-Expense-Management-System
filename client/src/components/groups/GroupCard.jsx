import React from 'react';
import {
  Users,
  Receipt,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { LazyImage } from '../ui/LazyImage';
import { Avatar } from '../ui/Avatar';

export function GroupCard({ group, onSelect, onAddExpense }) {
  const members = group.members || [];
  const displayMembers = members.slice(0, 3);
  const remainingCount = Math.max(0, members.length - 3);

  const totalNpr = ((group.totalSpendPaisa || 0) / 100).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });

  return (
    <div className="group/card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col">
      <div className="relative overflow-hidden">
        <LazyImage
          src={group.imageUrl}
          alt={group.name || group.title}
          aspectRatio="aspect-[16/9]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />

        <div className="absolute bottom-2 left-2 right-2">
          {group.balanceType === 'owe' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/90 text-white backdrop-blur-sm">
              <TrendingDown className="w-3 h-3" />
              {group.balanceAmount}
            </span>
          )}
          {group.balanceType === 'owed' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-sm">
              <TrendingUp className="w-3 h-3" />
              {group.balanceAmount}
            </span>
          )}
          {(!group.balanceType || group.balanceType === 'settled') && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/80 text-slate-200 backdrop-blur-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Settled up
            </span>
          )}
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors line-clamp-1">
            {group.name || group.title}
          </h3>
          {group.description && (
            <p className="mt-0.5 text-[10px] text-slate-400 line-clamp-1 leading-relaxed">
              {group.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {displayMembers.map((m, idx) => (
                <Avatar
                  key={m._id || m.id || idx}
                  name={m.name || 'Member'}
                  size="xs"
                  className="ring-1 ring-white dark:ring-slate-900"
                />
              ))}
              {remainingCount > 0 && (
                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-1 ring-white dark:ring-slate-900 text-[9px] font-bold flex items-center justify-center">
                  +{remainingCount}
                </div>
              )}
            </div>
            <span className="text-[10px] font-medium text-slate-400">
              {group.membersCount || members.length}m • {group.expensesCount || 0}e
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddExpense?.(group);
              }}
              title="Add Expense"
              className="w-6 h-6 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onSelect?.(group)}
              className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
            >
              View
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
