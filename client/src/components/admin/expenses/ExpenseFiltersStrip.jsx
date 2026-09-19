import React from 'react';
import { Search, X, FolderKanban, User, Filter } from 'lucide-react';

export default function ExpenseFiltersStrip({
  search = '',
  onSearchChange,
  selectedGroupFilter = '',
  onGroupFilterChange,
  selectedUserFilter = '',
  onUserFilterChange,
  selectedSplitType = 'ALL',
  onSplitTypeChange,
  allGroups = [],
  allUsers = [],
  onResetFilters,
}) {
  const hasActiveFilters =
    search.trim() !== '' ||
    selectedGroupFilter !== '' ||
    selectedUserFilter !== '' ||
    selectedSplitType !== 'ALL';

  return (
    <div className="bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search Box */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search expenses by note or title..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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

        {/* Group Watcher Dropdown */}
        <div className="lg:col-span-3">
          <div className="relative">
            <FolderKanban className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedGroupFilter}
              onChange={(e) => onGroupFilterChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-medium"
            >
              <option value="">Watch: All Group Circles</option>
              {allGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.memberCount || g.members?.length || 0} members)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User / Payer Filter Dropdown */}
        <div className="lg:col-span-3">
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedUserFilter}
              onChange={(e) => onUserFilterChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-medium"
            >
              <option value="">Filter by Member / Payer</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Split Type Selector */}
        <div className="lg:col-span-2">
          <select
            value={selectedSplitType}
            onChange={(e) => onSplitTypeChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-medium"
          >
            <option value="ALL">All Splits</option>
            <option value="EQUAL">Equal Split</option>
            <option value="EXACT">Exact Share</option>
            <option value="PERCENTAGE">Percentage</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>Active filters applied</span>
          </div>
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
