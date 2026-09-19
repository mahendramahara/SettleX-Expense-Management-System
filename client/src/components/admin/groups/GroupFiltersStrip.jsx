import React from 'react';
import { Search, X, Filter } from 'lucide-react';

export default function GroupFiltersStrip({
  search = '',
  onSearchChange,
  selectedUserFilter = '',
  onUserFilterChange,
  allUsers = [],
  currentCount = 0,
  totalCount = 0,
}) {
  const selectedUserName = allUsers.find((u) => u.id === selectedUserFilter)?.name;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search groups by name..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedUserFilter}
            onChange={(e) => onUserFilterChange(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer font-medium"
          >
            <option value="">Filter by Member (All Users)</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        {selectedUserFilter && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <span>Member: {selectedUserName || 'User'}</span>
            <button
              type="button"
              onClick={() => onUserFilterChange('')}
              className="hover:opacity-75 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium self-end lg:self-auto">
        Showing <strong className="text-slate-900 dark:text-white">{currentCount}</strong> of{' '}
        <strong className="text-slate-900 dark:text-white">{totalCount}</strong> total circles
      </div>
    </div>
  );
}
