import React from 'react';
import {
  Activity,
  Receipt,
  Users,
  Scale,
  UserCheck,
  Tag,
  UserPlus,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const TYPE_ICONS = {
  expense: {
    icon: Receipt,
    iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  group: {
    icon: Users,
    iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  },
  settlement: {
    icon: Scale,
    iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
  user: {
    icon: UserCheck,
    iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  },
  category: {
    icon: Tag,
    iconBg: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  },
  member: {
    icon: UserPlus,
    iconBg: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
  },
  security: {
    icon: ShieldCheck,
    iconBg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  },
};

export function RecentActivityCard({ activities = null, onViewAll, className = '' }) {
  const displayActivities =
    Array.isArray(activities) && activities.length > 0 ? activities.slice(0, 8) : [];

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-colors h-full ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Recent Activity
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live platform operations
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

      {displayActivities.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2.5 min-h-[260px]">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-400 dark:text-slate-500">
            <Activity className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              No recent activities
            </span>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[220px] mt-0.5 leading-relaxed">
              Platform transactions and member operations will appear here in real time.
            </p>
          </div>
        </div>
      ) : (
        <div className="pt-2 divide-y divide-slate-100 dark:divide-slate-800/50 flex-1 flex flex-col justify-between">
          {displayActivities.map((act) => {
            const config = TYPE_ICONS[act.type] || TYPE_ICONS.expense;
            const Icon = config.icon;

            return (
              <div
                key={act.id}
                className="py-1.5 first:pt-1 last:pb-0 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg ${config.iconBg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight truncate">
                      {act.title}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight mt-0.5 truncate">
                      {act.subtitle}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-medium whitespace-nowrap">
                  {act.time}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
