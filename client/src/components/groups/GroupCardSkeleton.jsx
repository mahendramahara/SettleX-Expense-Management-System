import React from 'react';

export function GroupCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs animate-pulse">
      <div className="w-full aspect-video bg-slate-200 dark:bg-slate-800" />
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800/60 rounded-md" />
          <div className="h-3.5 w-2/3 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-900" />
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-900" />
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="h-6 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
