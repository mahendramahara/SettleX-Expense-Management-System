import React from 'react';
import {
  RotateCw,
  Receipt,
  FolderKanban,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export default function ExpensesTable({
  expenses = [],
  isLoading = false,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
  hasActiveFilters = false,
  pagination = { page: 1, limit: 12, totalPages: 1, total: 0 },
  onPageChange,
  onResetFilters,
  onCreateExpense,
  onGroupClick,
  onInspectExpense,
  onEditExpense,
  onDeleteExpense,
}) {
  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <RotateCw className="w-7 h-7 animate-spin text-primary" />
        <p className="text-xs font-medium text-slate-400">Loading platform expenses...</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="py-20 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
          <Receipt className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No expenses found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
          {hasActiveFilters
            ? 'No transactions match your current query or group filter criteria.'
            : 'No platform expenses have been recorded yet.'}
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        ) : canCreate ? (
          <button
            type="button"
            onClick={onCreateExpense}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary hover:opacity-90 rounded-xl shadow-xs transition-opacity cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record First Expense
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Expense / Title</th>
              <th className="py-3.5 px-4">Group Circle</th>
              <th className="py-3.5 px-4">Paid By</th>
              <th className="py-3.5 px-4">Split Method</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Recorded Date</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
            {expenses.map((expense) => {
              const splitCount = expense.splits?.length || 0;
              const dateStr = expense.createdAt
                ? new Date(expense.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent';

              return (
                <tr
                  key={expense.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Title */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-xs shrink-0">
                        <Receipt className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {expense.title}
                        </p>
                        <span className="text-[11px] text-slate-400">
                          ID: {expense.id?.slice(-6)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Group Circle */}
                  <td className="py-3.5 px-4">
                    {expense.group ? (
                      <button
                        type="button"
                        onClick={() => onGroupClick(expense.group.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                        title="Filter by this group"
                      >
                        <FolderKanban className="w-3.5 h-3.5 text-primary" />
                        <span className="truncate max-w-[120px]">{expense.group.name}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Independent</span>
                    )}
                  </td>

                  {/* Paid By */}
                  <td className="py-3.5 px-4">
                    {expense.paidBy ? (
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={expense.paidBy.name || 'Member'}
                          className="w-7 h-7 text-xs"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                            {expense.paidBy.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[120px]">
                            {expense.paidBy.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Unknown Payer</span>
                    )}
                  </td>

                  {/* Split Method */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          expense.splitType === 'EQUAL'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/70 dark:border-blue-800/60'
                            : expense.splitType === 'EXACT'
                              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200/70 dark:border-purple-800/60'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/70 dark:border-amber-800/60'
                        }`}
                      >
                        {expense.splitType}
                      </span>
                      <span className="text-xs text-slate-400">
                        {splitCount} {splitCount === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {expense.amountFormatted}
                  </td>

                  {/* Recorded Date */}
                  <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                    {dateStr}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onInspectExpense(expense)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="View Split Breakdown"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => onEditExpense(expense)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Alter Expense Details"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(expense)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-bold text-slate-900 dark:text-white">{pagination.total}</span>{' '}
            expenses
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <span className="px-2 font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
