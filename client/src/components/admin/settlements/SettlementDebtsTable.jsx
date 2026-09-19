import React from 'react';
import {
  Scale,
  ArrowRight,
  FolderKanban,
  CheckCircle2,
  Eye,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export function SettlementDebtsTable({
  settlements = [],
  isLoading = false,
  hasActiveFilters = false,
  onClearFilters,
  onOpenRecord,
  onSelectSettle,
  onInspectSettlement,
  onFilterGroup,
  canRecord = true,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
}) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-20 flex flex-col items-center justify-center gap-3">
        <RotateCw className="w-7 h-7 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Calculating platform debt graph...
        </p>
      </div>
    );
  }

  if (settlements.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          All Debts Settled
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
          {hasActiveFilters
            ? 'No pending settlement transactions match the current watcher or member filters.'
            : 'Every group circle on the platform currently has zero outstanding debt obligations.'}
        </p>
        {hasActiveFilters ? (
          <button
            onClick={onClearFilters}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 rounded-xl hover:bg-indigo-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
            Reset Filters
          </button>
        ) : canRecord ? (
          <button
            onClick={() => onOpenRecord?.()}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Initial Settlement
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-5">Group Circle</th>
              <th className="py-3.5 px-4">Debtor (Owes)</th>
              <th className="py-3.5 px-3 text-center">Flow</th>
              <th className="py-3.5 px-4">Creditor (Owed To)</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {settlements.map((settlement) => (
              <tr
                key={settlement.id}
                className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Group */}
                <td className="py-3.5 px-5">
                  <button
                    onClick={() => onFilterGroup?.(settlement.groupId)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 transition-colors cursor-pointer"
                    title="Watch this group"
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="truncate max-w-[130px] font-semibold">
                      {settlement.groupName}
                    </span>
                  </button>
                </td>

                {/* Debtor (From) */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={settlement.from.name || 'Member'} className="w-7 h-7 text-xs" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                        {settlement.from.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[130px]">
                        {settlement.from.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Flow Direction */}
                <td className="py-3.5 px-3 text-center">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                  </div>
                </td>

                {/* Creditor (To) */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={settlement.to.name || 'Member'} className="w-7 h-7 text-xs" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                        {settlement.to.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[130px]">
                        {settlement.to.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Amount */}
                <td className="py-3.5 px-4">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {settlement.amountFormatted}
                  </span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/60">
                    <Scale className="w-3 h-3" />
                    Pending
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onInspectSettlement?.(settlement)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Inspect Debt Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {canRecord && (
                      <button
                        onClick={() => onSelectSettle?.(settlement)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors cursor-pointer"
                        title="Record payment to settle this debt"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Settle Up</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{pagination.total}</span>{' '}
            settlement obligations
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <span className="px-2 font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
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
