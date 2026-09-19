import React from 'react';
import { Receipt, ArrowRight } from 'lucide-react';

export function RecentExpensesCard({ expenses: customExpenses = null, onViewAll, className = '' }) {
  const expenses = Array.isArray(customExpenses) ? customExpenses : [];

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-colors h-full ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Recent Expenses
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Latest shared expenditures logged across groups
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

      {expenses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            No expenses logged yet
          </span>
          <p className="text-[11px] text-slate-400">
            Recent expenditures across groups will appear here.
          </p>
        </div>
      ) : (
        <div className="pt-3 divide-y divide-slate-100 dark:divide-slate-800/40 flex-1 flex flex-col justify-between">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="py-2 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl ${exp.iconBg} flex items-center justify-center shrink-0`}
                >
                  <Receipt className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight truncate">
                    {exp.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight mt-0.5 truncate">
                    {exp.group}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-right">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                    {exp.amount}
                  </span>
                  <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
                    Paid by {exp.paidBy}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 w-12 text-right">
                  {exp.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
