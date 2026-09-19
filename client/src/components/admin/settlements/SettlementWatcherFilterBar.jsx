import React from 'react';
import { Search, FolderKanban, User, Filter, RotateCw, Plus, X } from 'lucide-react';

export function SettlementWatcherFilterBar({
  search,
  onSearchChange,
  selectedGroup,
  onGroupChange,
  selectedUser,
  onUserChange,
  allGroups = [],
  allUsers = [],
  onClearFilters,
  hasActiveFilters,
  onRefresh,
  isRefreshing,
  onOpenRecord,
  canRecord = true,
}) {
  const watchedGroup = allGroups.find((g) => g.id === selectedGroup);

  return (
    <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by circle, member, or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Group Watcher Dropdown */}
        <div className="lg:col-span-3">
          <div className="relative">
            <FolderKanban className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedGroup}
              onChange={(e) => onGroupChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">Watch: All Group Circles</option>
              {allGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.memberCount || g.members?.length || 0} members)
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Member / Debtor / Creditor Dropdown */}
        <div className="lg:col-span-3">
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedUser}
              onChange={(e) => onUserChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">Filter by Debtor / Creditor</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="lg:col-span-2 flex items-center justify-end gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Sync Settlements"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>

          {canRecord && (
            <button
              onClick={onOpenRecord}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Watcher Banner & Filter Tags */}
      {(hasActiveFilters || watchedGroup) && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {watchedGroup && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <FolderKanban className="w-3 h-3 text-indigo-500" />
                Watching Circle: {watchedGroup.name}
                <button
                  onClick={() => onGroupChange('')}
                  className="hover:text-indigo-950 dark:hover:text-white cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedUser && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <User className="w-3 h-3 text-amber-500" />
                Filtered User
                <button
                  onClick={() => onUserChange('')}
                  className="hover:text-amber-950 dark:hover:text-white cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={onClearFilters}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer ml-auto"
          >
            <X className="w-3 h-3" />
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
