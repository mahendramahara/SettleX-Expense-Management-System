import React from 'react';
import {
  Receipt,
  Calendar,
  Layers,
  Percent,
  CircleDot,
  Trash2,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';

export function ExpenseDetailModal({ isOpen, onClose, expense, currentUserId, onDelete }) {
  if (!expense) return null;

  const amountRs = ((expense.amountPaisa || 0) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const payerId = expense.paidById?._id || expense.paidById?.id || expense.paidById;
  const isPaidByMe = String(payerId) === String(currentUserId);
  const paidName = expense.paidByName || expense.paidById?.name || (isPaidByMe ? 'You' : 'Member');

  const dateStr = expense.createdAt
    ? new Date(expense.createdAt).toLocaleDateString('en-US', {
        weekday: 'short',
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Expense Details"
      description={
        expense.groupName ? `Belongs to group: ${expense.groupName}` : 'Shared Expense Details'
      }
      maxWidth="max-w-xl"
    >
      <div className="space-y-5 py-2">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-primary shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                {expense.title || expense.description}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {dateStr}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <SplitIcon className="w-3.5 h-3.5" />
                  <span className="capitalize">
                    {String(expense.splitType || 'EQUAL').toLowerCase()} split
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total
            </div>
            <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              Rs. {amountRs}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Paid By
              </div>
              <div className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100">
                {paidName} {isPaidByMe ? '(You)' : ''}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
              Rs. {amountRs}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              100% upfront
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Participant Breakdown ({(expense.splits || []).length})
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Mode: {expense.splitType || 'EQUAL'}
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
            {(expense.splits || []).map((split, index) => {
              const splitUserId = split.userId?._id || split.userId?.id || split.userId;
              const isCurrentUser = String(splitUserId) === String(currentUserId);
              const splitAmount = ((split.amountPaisa || 0) / 100).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });

              return (
                <div
                  key={index}
                  className={`p-3 flex items-center justify-between gap-3 text-sm ${
                    isCurrentUser ? 'bg-primary/5 dark:bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={split.userName || 'Member'} size="sm" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate text-xs sm:text-sm">
                        {split.userName || 'Member'}{' '}
                        {isCurrentUser && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            You
                          </span>
                        )}
                      </div>
                      {split.percentage > 0 && (
                        <div className="text-[11px] text-slate-400">{split.percentage}% share</div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                      Rs. {splitAmount}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {isCurrentUser && isPaidByMe
                        ? 'Your self-cost'
                        : isCurrentUser
                          ? 'You owe payer'
                          : isPaidByMe
                            ? 'Owes you'
                            : 'Group member'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete(expense.id || expense._id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer border border-rose-200 dark:border-rose-900/40"
            >
              <Trash2 className="w-4 h-4" />
              Delete Expense
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
