import React from 'react';
import { Zap, FolderPlus, Receipt, Scale, BarChart3, ChevronRight } from 'lucide-react';

export function QuickActionsCard({
  onAddGroup,
  onAddExpense,
  onOptimizeSettlement,
  onViewAnalytics,
  className = '',
}) {
  const actions = [
    {
      id: 'act-group',
      title: 'Add New Group',
      description: 'Create a group and invite members',
      icon: FolderPlus,
      iconBg: 'bg-emerald-600 text-white',
      onClick: onAddGroup,
    },
    {
      id: 'act-expense',
      title: 'Add Expense',
      description: 'Record a new shared expense',
      icon: Receipt,
      iconBg: 'bg-blue-600 text-white',
      onClick: onAddExpense,
    },
    {
      id: 'act-settle',
      title: 'Optimize Settlement',
      description: 'Find minimum transactions',
      icon: Scale,
      iconBg: 'bg-pink-600 text-white',
      onClick: onOptimizeSettlement,
    },
    {
      id: 'act-analytics',
      title: 'View Analytics',
      description: 'Check spending insights',
      icon: BarChart3,
      iconBg: 'bg-indigo-600 text-white',
      onClick: onViewAnalytics,
    },
  ];

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-colors h-full ${className}`}
    >
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Quick Actions
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Shortcuts to primary workflows
          </p>
        </div>
      </div>

      <div className="pt-3 space-y-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              type="button"
              onClick={act.onClick}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between gap-3 text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl ${act.iconBg} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                    {act.title}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight mt-0.5">
                    {act.description}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
