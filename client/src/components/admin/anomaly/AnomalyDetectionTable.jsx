import React from 'react';
import {
  RotateCw,
  Search,
  X,
  Eye,
  Send,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  AlertTriangle,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export default function AnomalyDetectionTable({
  anomalies = [],
  isLoading = false,
  searchQuery = '',
  onSearchChange,
  severityFilter = 'all',
  onSeverityChange,
  threshold = '1.5',
  onThresholdChange,
  counts = { total: 0, critical: 0, elevated: 0, moderate: 0 },
  onInspect,
  onOpenAdvisory,
  onUpdateStatus,
  pagination = { page: 1, limit: 10, total: 0, totalPages: 1 },
  onPageChange,
}) {
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Critical Outlier
          </span>
        );
      case 'ELEVATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Elevated Spender
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/40">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            Moderate Variance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Normal
          </span>
        );
    }
  };

  const tabs = [
    { id: 'all', label: `All (${counts.total})` },
    { id: 'CRITICAL', label: `Critical (${counts.critical})` },
    { id: 'ELEVATED', label: `Elevated (${counts.elevated})` },
    { id: 'MODERATE', label: `Moderate (${counts.moderate})` },
  ];

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      {/* Top Toolbar matching Users and Staff table */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Severity Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSeverityChange?.(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                severityFilter === tab.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Controls: Sensitivity Dropdown & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
              Threshold:
            </span>
            <select
              value={threshold}
              onChange={(e) => onThresholdChange?.(e.target.value)}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer text-xs"
            >
              <option value="1.25">1.25x (+25%)</option>
              <option value="1.5">1.50x (+50%)</option>
              <option value="2.0">2.00x (+100%)</option>
              <option value="2.5">2.50x (+150%)</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search contributor or circle..."
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

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="pb-3 px-3">Flagged Contributor</th>
              <th className="pb-3 px-3">Severity</th>
              <th className="pb-3 px-3">Total Fronted</th>
              <th className="pb-3 px-3">Peer Quota</th>
              <th className="pb-3 px-3">Overspend Ratio</th>
              <th className="pb-3 px-3">Dominant Circles</th>
              <th className="pb-3 px-3">Advisory Status</th>
              <th className="pb-3 px-3 text-right">Privileged Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <RotateCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                  <span>Scanning cross-circle contribution metrics...</span>
                </td>
              </tr>
            ) : anomalies.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block text-sm">
                    No spending outliers found
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {searchQuery || severityFilter !== 'all'
                      ? 'Try adjusting your search criteria or sensitivity threshold.'
                      : 'All members are currently contributing within normal statistical variance.'}
                  </p>
                </td>
              </tr>
            ) : (
              anomalies.map((item) => {
                const u = item.user || {};

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* User Profile */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name || 'User'} size="sm" />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white block truncate">
                            {u.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getSeverityBadge(item.severity)}
                    </td>

                    {/* Total Fronted */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.totalPaidFormatted}
                      </div>
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                        +{item.overspendFormatted} excess
                      </div>
                    </td>

                    {/* Peer Quota */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">
                        {item.expectedFairShareFormatted}
                      </div>
                      <div className="text-[10px] text-slate-400">fair circle quota</div>
                    </td>

                    {/* Overspend Ratio */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.overspendRatio}x
                        </span>
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                          (+{item.overspendPercent}%)
                        </span>
                      </div>
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.severity === 'CRITICAL'
                              ? 'bg-rose-500'
                              : item.severity === 'ELEVATED'
                                ? 'bg-amber-500'
                                : 'bg-yellow-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (item.overspendRatio / 4) * 100)}%`,
                          }}
                        />
                      </div>
                    </td>

                    {/* Dominant Circles */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.dominantCount}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          of {item.totalGroupsCount} circles
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">paying &ge;50% volume</div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'RESOLVED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                              : item.status === 'ADVISED'
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40'
                                : item.status === 'INVESTIGATING'
                                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/40'
                                  : item.status === 'DISMISSED'
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
                          }`}
                        >
                          {item.status || 'DETECTED'}
                        </span>
                        {item.advisoriesSentCount > 0 && (
                          <div className="text-[10px] text-slate-400">
                            {item.advisoriesSentCount} advisory sent
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Privileged Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {item.status !== 'RESOLVED' && onUpdateStatus && (
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(item.id, 'RESOLVED')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                            title="Mark as Resolved"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onInspect?.(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Inspect Diagnostics"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenAdvisory?.(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                          title="Draft and send special financial notice"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Notice</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination matching Users and Staff */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} spenders)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange?.(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange?.(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
