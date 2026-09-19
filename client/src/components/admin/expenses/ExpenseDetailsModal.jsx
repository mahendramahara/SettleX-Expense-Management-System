import React from 'react';
import { Eye, X } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export function ExpenseDetailsModal({ expense, onClose }) {
  const dateFormatted = expense?.createdAt
    ? new Date(expense.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Expense Split Audit
              </h2>
              <p className="text-xs text-slate-400">{expense?.title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Bill
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 block">
                {expense?.amountFormatted}
              </span>
              <span className="text-xs text-slate-500 mt-0.5 block">Date: {dateFormatted}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Paid By
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                {expense?.paidBy?.name || 'Member'}
              </span>
              <span className="text-xs text-slate-500 truncate block">
                {expense?.paidBy?.email}
              </span>
            </div>
          </div>

          {/* Splits Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Participant Shares ({expense?.splits?.length || 0})
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50">
                Method: {expense?.splitType}
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {expense?.splits?.map((split, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white dark:bg-slate-900"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={split.userName || 'Member'} className="w-7 h-7 text-xs" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {split.userName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{split.userEmail}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {split.amountFormatted}
                    </p>
                    {split.percentage !== undefined && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {split.percentage}% share
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
}
