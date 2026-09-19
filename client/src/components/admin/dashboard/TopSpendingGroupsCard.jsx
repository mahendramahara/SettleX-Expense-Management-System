import React from 'react';
import { FolderKanban, MoreHorizontal, ArrowRight } from 'lucide-react';

export function TopSpendingGroupsCard({ groups: customGroups = null, onViewAll, className = '' }) {
  const groups = Array.isArray(customGroups) ? customGroups : [];

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-colors h-full ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Top Spending Groups
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Ranked by cumulative expense volume
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:opacity-80 transition-opacity cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            No group expenses recorded yet
          </span>
          <p className="text-[11px] text-slate-400">
            Top spending circles will appear here as groups log expenses.
          </p>
        </div>
      ) : (
        <div className="pt-3 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/60">
                <th className="pb-2 w-8">#</th>
                <th className="pb-2">Group Name</th>
                <th className="pb-2">Total Expenses</th>
                <th className="pb-2">Members</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
              {groups.map((grp) => (
                <tr
                  key={grp.rank}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-2.5 font-bold text-slate-400">{grp.rank}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg ${grp.avatarBg} flex items-center justify-center font-bold text-[11px] shrink-0`}
                      >
                        {grp.initials}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {grp.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                    {grp.totalExpenses}
                  </td>
                  <td className="py-2.5 text-slate-500 dark:text-slate-400">{grp.members}</td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
