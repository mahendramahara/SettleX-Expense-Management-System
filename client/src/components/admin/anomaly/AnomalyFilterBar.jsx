import React from 'react';
import { Search, SlidersHorizontal, RotateCw, Filter, X } from 'lucide-react';

export default function AnomalyFilterBar({
  searchQuery,
  onSearchChange,
  severityFilter,
  onSeverityChange,
  threshold,
  onThresholdChange,
  onRefresh,
  isRefreshing,
  onClearFilters,
  hasActiveFilters,
}) {
  const severityOptions = [
    { id: 'all', label: 'All Severities' },
    { id: 'CRITICAL', label: 'Critical (>2.5x)' },
    { id: 'ELEVATED', label: 'Elevated (>1.6x)' },
    { id: 'MODERATE', label: 'Moderate (>1.2x)' },
  ];

  return (
    <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="lg:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by user name, email, or connected circle..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Severity Tabs */}
        <div className="lg:col-span-4 flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
          {severityOptions.map((opt) => {
            const active = severityFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSeverityChange(opt.id)}
                className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer truncate text-center ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Sensitivity Dropdown & Refresh */}
        <div className="lg:col-span-3 flex items-center gap-2 justify-end">
          <div className="relative flex-1">
            <SlidersHorizontal className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={threshold}
              onChange={(e) => onThresholdChange(e.target.value)}
              className="w-full pl-8 pr-6 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="1.25">Sensitivity: 1.25x (+25%)</option>
              <option value="1.5">Sensitivity: 1.50x (+50%)</option>
              <option value="2.0">Sensitivity: 2.00x (+100%)</option>
              <option value="2.5">Sensitivity: 2.50x (+150%)</option>
            </select>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            title="Re-run statistical anomaly scan"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Active filters applied</span>
          <button
            onClick={onClearFilters}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
