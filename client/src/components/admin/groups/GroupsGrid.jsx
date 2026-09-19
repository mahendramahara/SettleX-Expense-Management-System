import React from 'react';
import { RotateCw, FolderKanban, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export default function GroupsGrid({
  groups = [],
  isLoading = false,
  canUpdate = false,
  canDelete = false,
  selectedUserFilter = '',
  pagination = { page: 1, limit: 12, totalPages: 1, total: 0 },
  onPageChange,
  onEditGroup,
  onDeleteGroup,
  onInspectUser,
}) {
  if (isLoading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <RotateCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
        <span>Loading group records...</span>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
          <FolderKanban className="w-6 h-6" />
        </div>
        <span className="font-bold text-slate-700 dark:text-slate-300 block text-sm">
          No groups found
        </span>
        <p className="text-xs text-slate-400 mt-0.5">
          {selectedUserFilter
            ? 'This user is not currently assigned to any group circles.'
            : 'Create a new group and assign members to begin tracking expenses.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map((group) => {
          const members = group.members || [];
          const initials = (group.name || 'GP')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <div
              key={group.id}
              className="p-4 sm:p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/30">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {group.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 block truncate">
                        Created by: {group.createdBy?.name || 'Administrator'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEditGroup(group)}
                      disabled={!canUpdate}
                      title={
                        canUpdate ? 'Alter Group & Members' : 'Missing groups:update privilege'
                      }
                      className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteGroup(group)}
                      disabled={!canDelete}
                      title={canDelete ? 'Delete Group' : 'Missing groups:delete privilege'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {group.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {group.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white dark:bg-[#0e172a] border border-slate-200/70 dark:border-slate-800/70 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Volume</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                    {group.totalExpenseAmountFormatted || 'Rs. 0'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Expenses Recorded</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {group.totalExpensesCount || 0} bills
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">
                    Members ({members.length})
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    Click member to inspect circles
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onInspectUser(m)}
                      title={`Inspect ${m.name}'s connected circles`}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/70 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                    >
                      <Avatar name={m.name || 'Member'} size="xs" />
                      <span className="truncate max-w-[100px]">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} groups)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
