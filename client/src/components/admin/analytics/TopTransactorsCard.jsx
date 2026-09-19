import React from 'react';
import { Users, FolderKanban, Award, ChevronRight } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export function TopTransactorsCard({ topUsers = [], topCircles = [], onSelectCircle }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Transacting Users */}
      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md flex flex-col">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Top Contributing Members
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Users who have settled the highest bill volumes.
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 flex-1">
          {topUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No transactions recorded yet.
            </div>
          ) : (
            topUsers.map((usr, idx) => (
              <div
                key={usr.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-850 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      idx === 0
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                        : idx === 1
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : 'bg-slate-100 dark:bg-slate-850 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <Avatar name={usr.name || 'Member'} className="w-8 h-8 text-xs shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {usr.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{usr.email}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {usr.amountFormatted}
                  </p>
                  <span className="text-[10px] text-slate-400 block">
                    {usr.expenseCount} {usr.expenseCount === 1 ? 'bill' : 'bills'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Spending Group Circles */}
      <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md flex flex-col">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Top Spending Circles
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Active group circles with the largest shared expenditure.
            </p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
            <FolderKanban className="w-4 h-4 text-indigo-500" />
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/60 flex-1">
          {topCircles.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No circle expenditures tracked yet.
            </div>
          ) : (
            topCircles.map((circle, idx) => (
              <div
                key={circle.id}
                onClick={() => onSelectCircle?.(circle.id)}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-850 rounded-xl px-2 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      idx === 0
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                        : idx === 1
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : 'bg-slate-100 dark:bg-slate-850 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {circle.name}
                    </p>
                    <span className="text-[11px] text-slate-400 block">
                      {circle.expenseCount} recorded expenses
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {circle.amountFormatted}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
