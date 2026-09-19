import React from 'react';
import {
  Receipt,
  Calendar,
  Users,
  ChevronRight,
  CircleDot,
  Layers,
  Percent,
  Trash2,
} from 'lucide-react';
import { Badge } from '../ui/Badge';

export function ExpenseItem({ expense, currentUserId, onSelect, onDelete }) {
  const amountRs = ((expense.amountPaisa || 0) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const payerId = expense.paidById?._id || expense.paidById?.id || expense.paidById;
  const isPaidByMe = String(payerId) === String(currentUserId);
  const paidName = expense.paidByName || expense.paidById?.name || (isPaidByMe ? 'You' : 'Member');

  const userSplit = (expense.splits || []).find((s) => {
    const sId = s.userId?._id || s.userId?.id || s.userId;
    return String(sId) === String(currentUserId);
  });

  const userShareRs = userSplit
    ? (userSplit.amountPaisa / 100).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : null;

  const dateStr = expense.createdAt
    ? new Date(expense.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const SplitIcon =
    expense.splitType === 'EXACT'
      ? Layers
      : expense.splitType === 'PERCENTAGE'
        ? Percent
        : CircleDot;

  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all">
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
          <Receipt className="w-5 h-5" />
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {expense.title || expense.description}
            </h4>
            {expense.groupName && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {expense.groupName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1 text-[11px]">
              <Calendar className="w-3 h-3 text-slate-400" />
              {dateStr}
            </span>
            <span>•</span>
            <span className="text-[11px]">
              Paid by{' '}
              <strong
                className={
                  isPaidByMe
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-700 dark:text-slate-200'
                }
              >
                {paidName} {isPaidByMe ? '(You)' : ''}
              </strong>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <SplitIcon className="w-3 h-3 text-slate-400" />
              <span className="capitalize">
                {String(expense.splitType || 'EQUAL').toLowerCase()}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60 flex items-center justify-between sm:justify-end gap-4 shrink-0">
        <div className="text-left sm:text-right">
          <div className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
            Rs. {amountRs}
          </div>
          {userShareRs && (
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Your share:{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Rs. {userShareRs}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSelect?.(expense)}
            title="View Split Details"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(expense.id || expense._id)}
              title="Delete Expense"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
