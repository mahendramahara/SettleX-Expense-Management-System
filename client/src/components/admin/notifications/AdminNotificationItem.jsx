import React, { useState } from 'react';
import {
  ShieldAlert,
  Scale,
  AlertTriangle,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Trash2,
  ChevronDown,
  Clock,
  Check,
} from 'lucide-react';

export default function AdminNotificationItem({ notification, onMarkRead, onDismiss, onNavigate }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'SECURITY':
        return <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'FINANCIAL':
        return <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'ANOMALY':
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'SYSTEM':
      default:
        return <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
            Critical
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
            Warning
          </span>
        );
      case 'SUCCESS':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
            Resolved
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
            Info
          </span>
        );
    }
  };

  const formattedTime = notification.createdAt
    ? new Date(notification.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }) +
      ' · ' +
      new Date(notification.createdAt).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      })
    : 'Recent';

  const hasDetails = notification.details && Object.keys(notification.details).length > 0;

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        !notification.read
          ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/70 dark:border-blue-900/50 shadow-xs'
          : 'bg-white dark:bg-[#0e172a] border-slate-200 dark:border-slate-800/80'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Category Icon & Title */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center shrink-0 mt-0.5">
            {getCategoryIcon(notification.category)}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {notification.title}
              </h4>
              {getSeverityBadge(notification.severity)}
              {!notification.read && (
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              {notification.message}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formattedTime}
              </span>

              <span className="font-semibold uppercase text-[10px] tracking-wider text-slate-400">
                {notification.category}
              </span>

              {hasDetails && (
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="inline-flex items-center gap-0.5 font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <span>{isExpanded ? 'Hide Payload' : 'View Payload'}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {notification.actionTab && (
            <button
              type="button"
              onClick={() => onNavigate?.(notification.actionTab)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <span>{notification.actionLabel || 'Inspect'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {!notification.read && (
            <button
              type="button"
              onClick={() => onMarkRead?.(notification.id)}
              title="Mark as Read"
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onDismiss?.(notification.id)}
            title="Dismiss Alert"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Technical Details Drawer */}
      {isExpanded && hasDetails && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
            {Object.entries(notification.details).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-slate-400">{k}:</span>
                <span className="font-semibold truncate max-w-xs">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
