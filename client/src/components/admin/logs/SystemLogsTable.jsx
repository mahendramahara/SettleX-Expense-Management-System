import React, { useState } from 'react';
import {
  RotateCw,
  Search,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldAlert,
  Scale,
  Terminal,
  FolderKanban,
  Download,
  CheckCircle2,
  Code,
  Layers,
} from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export default function SystemLogsTable({
  logs = [],
  isLoading = false,
  categoryFilter = 'all',
  onCategoryChange,
  searchQuery = '',
  onSearchChange,
  counts = { total: 0, security: 0, financial: 0, group: 0, system: 0 },
  onInspectLog,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
  onExportLogs,
}) {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'terminal'

  const tabs = [
    { id: 'all', label: `All (${counts.total})` },
    { id: 'SECURITY', label: `Security (${counts.security})` },
    { id: 'FINANCIAL', label: `Financial (${counts.financial})` },
    { id: 'GROUP', label: `Groups (${counts.group})` },
    { id: 'SYSTEM', label: `System (${counts.system})` },
  ];

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'SECURITY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 uppercase">
            <ShieldAlert className="w-3 h-3" />
            Security
          </span>
        );
      case 'FINANCIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 uppercase">
            <Scale className="w-3 h-3" />
            Financial
          </span>
        );
      case 'GROUP':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 uppercase">
            <FolderKanban className="w-3 h-3" />
            Group
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40 uppercase">
            <Terminal className="w-3 h-3" />
            System
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Top Toolbar matching Users and Staff table */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onCategoryChange?.(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Controls: View Switcher, Export & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* View Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('terminal')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'terminal'
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Console</span>
            </button>
          </div>

          {/* Export JSON Button */}
          <button
            type="button"
            onClick={onExportLogs}
            title="Download audit logs as JSON file"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search action, actor, or target..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main View: Table or Terminal Console */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Timestamp</th>
                <th className="pb-3 px-3">Event Action</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Operator / Actor</th>
                <th className="pb-3 px-3">Target Scope</th>
                <th className="pb-3 px-3">Summary Description</th>
                <th className="pb-3 px-3 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RotateCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    <span>Streaming platform trace events...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block text-sm">
                      No system events found
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try adjusting your category filter or search keywords.
                    </p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {log.relativeTime}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                        </span>
                      </td>

                      {/* Event Action */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-[11px] block">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ID: {log.id.slice(0, 14)}...
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getCategoryBadge(log.category)}
                      </td>

                      {/* Operator / Actor */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={log.operator?.name || 'System'} size="sm" />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white block truncate">
                              {log.operator?.name || 'System'}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {log.operator?.role || 'Internal'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Target Scope */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {log.target?.model || 'System'}
                        </span>
                      </td>

                      {/* Summary */}
                      <td className="py-3 px-3 max-w-xs">
                        <p className="text-slate-700 dark:text-slate-300 truncate text-xs">
                          {log.summary}
                        </p>
                      </td>

                      {/* Payload Inspect Action */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onInspectLog?.(log)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer text-xs font-semibold"
                          title="Inspect raw payload and metadata"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Terminal Live Stream Console */
        <div className="rounded-xl bg-[#090d16] border border-slate-800 p-4 font-mono text-xs text-slate-300 space-y-2 max-h-[500px] overflow-y-auto leading-relaxed shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-500 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SettleX Live Kernel & Audit Trace Stream</span>
            </div>
            <span>{logs.length} Active Stream Records</span>
          </div>

          {logs.map((log) => (
            <div
              key={log.id}
              onClick={() => onInspectLog?.(log)}
              className="p-1.5 rounded-md hover:bg-slate-800/60 transition-colors cursor-pointer flex items-start gap-2 group text-[11px]"
            >
              <span className="text-slate-500 shrink-0 select-none">
                [{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'RECENT'}]
              </span>
              <span
                className={`font-bold shrink-0 ${
                  log.category === 'SECURITY'
                    ? 'text-rose-400'
                    : log.category === 'FINANCIAL'
                    ? 'text-emerald-400'
                    : log.category === 'GROUP'
                    ? 'text-blue-400'
                    : 'text-purple-400'
                }`}
              >
                [{log.category}]
              </span>
              <span className="text-amber-400 shrink-0 font-bold">
                {log.action}
              </span>
              <span className="text-slate-400 shrink-0">
                by &lt;{log.operator?.name || 'System'}&gt;
              </span>
              <span className="text-slate-200 truncate group-hover:underline">
                {log.summary}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination matching Users and Staff */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} audit logs)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange?.(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange?.(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
