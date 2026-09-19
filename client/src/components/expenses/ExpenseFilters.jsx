import React from 'react';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';

export function ExpenseFilters({
  searchTerm,
  onSearchChange,
  selectedGroupId,
  onGroupChange,
  groups = [],
  splitTypeFilter,
  onSplitTypeChange,
  sortBy,
  onSortByChange,
  onReset,
}) {
  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedGroupId !== 'ALL' ||
    splitTypeFilter !== 'ALL' ||
    sortBy !== 'NEWEST';

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-3.5">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by expense title, paid by, or group..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={selectedGroupId}
              onChange={(e) => onGroupChange(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option value="ALL">All Groups</option>
              {groups.map((g) => {
                const gId = g.id || g._id;
                return (
                  <option key={gId} value={gId}>
                    {g.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="HIGHEST">Highest Amount</option>
              <option value="LOWEST">Lowest Amount</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-400 mr-1 shrink-0">Strategy:</span>
        {['ALL', 'EQUAL', 'EXACT', 'PERCENTAGE'].map((type) => {
          const isActive = splitTypeFilter === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSplitTypeChange(type)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {type === 'ALL' ? 'All Splits' : type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
