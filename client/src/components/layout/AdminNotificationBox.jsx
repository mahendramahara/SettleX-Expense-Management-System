import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Bell,
  CheckCheck,
  X,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  Scale,
  Cpu,
  Clock,
  Check,
  Trash2,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { notificationService } from '../../services/notification.service';
import { useAuth } from '../../context/AuthContext';
import DEMO from '../../demo/data.json';

const INITIAL_FALLBACK_NOTIFICATIONS = [
  {
    id: 'fb-sec-1',
    title: 'Repeated Authentication Failures Detected',
    message:
      'Endpoint /api/admin/login encountered 5 consecutive bad credentials from IP 103.145.72.10 (Kathmandu Subnet). Rate limiter temporary block engaged.',
    category: 'SECURITY',
    severity: 'CRITICAL',
    actionTab: 'system-logs',
    actionLabel: 'Inspect Audit Stream',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'fb-anom-1',
    title: 'Severe Outlier Expense Ratio Identified',
    message:
      'Heuristics flagged Demo User fronting 3.4x peer fair share across 3 active circles ("Design Studio Baneshwor", "Pokhara Trekking Expedition"). Overspend threshold exceeded.',
    category: 'ANOMALY',
    severity: 'WARNING',
    actionTab: 'anomaly-detection',
    actionLabel: 'Review Anomaly Profile',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'fb-fin-1',
    title: 'High-Value Settlement Recorded',
    message:
      'Direct payment of Rs. 45,000 recorded in "Pokhara Trekking Expedition" between Aarav Gurung and Pooja Thapa verified with eSewa reference #ESW-99214.',
    category: 'FINANCIAL',
    severity: 'INFO',
    actionTab: 'settlements',
    actionLabel: 'View Settlement Details',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'fb-sys-1',
    title: 'Algorithmic Graph Simplification Executed',
    message:
      'Automated greedy balance cancellation resolved 18 cyclic group debts into 6 minimal net payments across circles, decreasing transaction friction by 66.7%.',
    category: 'SYSTEM',
    severity: 'SUCCESS',
    actionTab: 'debt-optimization',
    actionLabel: 'Open Sandbox',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

function getCategoryIcon(category) {
  switch ((category || '').toUpperCase()) {
    case 'SECURITY':
      return <ShieldAlert className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
    case 'FINANCIAL':
      return <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    case 'ANOMALY':
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    case 'SYSTEM':
    default:
      return <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
  }
}

function getSeverityBadge(severity) {
  switch (severity) {
    case 'CRITICAL':
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
          Critical
        </span>
      );
    case 'WARNING':
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
          Warning
        </span>
      );
    case 'SUCCESS':
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
          Resolved
        </span>
      );
    case 'INFO':
    default:
      return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
          Info
        </span>
      );
  }
}

function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMins = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function AdminNotificationBox({
  isOpen,
  onClose,
  onNavigateTab,
  onUnreadCountChange,
}) {
  const { isGuest } = useAuth();
  const [notifications, setNotifications] = useState(() =>
    isGuest
      ? DEMO.admin?.notifications?.notifications || INITIAL_FALLBACK_NOTIFICATIONS
      : []
  );
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const popoverRef = useRef(null);

  // Fetch real notifications for real admin, or demo data for guest preview
  const loadNotifications = useCallback(async () => {
    if (isGuest) {
      const demoList = DEMO.admin?.notifications?.notifications || INITIAL_FALLBACK_NOTIFICATIONS;
      setNotifications(demoList);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await notificationService.getNotifications({ limit: 50 });
      if (res && res.data && Array.isArray(res.data.notifications)) {
        setNotifications(res.data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.warn('Could not load real admin notifications:', err);
      // For real authenticated admin, show empty state rather than fake mock notifications
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [isGuest]);

  // Load immediately on mount and when auth guest state changes
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Refresh when popover opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  // Click outside and escape detection to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose?.();
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  // Mark single as read
  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    if (!isGuest) {
      try {
        await notificationService.markNotificationRead(id);
      } catch (err) {
        console.warn('Failed to mark notification as read on server:', err);
      }
    }
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!isGuest) {
      try {
        await notificationService.markAllNotificationsRead('all');
      } catch (err) {
        console.warn('Failed to mark all notifications read on server:', err);
      }
    }
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  // Dismiss single notification
  const handleDismiss = async (id, e) => {
    e?.stopPropagation();
    if (!isGuest) {
      try {
        await notificationService.dismissNotification(id);
      } catch (err) {
        console.warn('Failed to dismiss notification on server:', err);
      }
    }
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear read notifications
  const handleClearRead = async () => {
    if (!isGuest) {
      try {
        await notificationService.clearReadNotifications();
      } catch (err) {
        console.warn('Failed to clear read notifications on server:', err);
      }
    }
    setNotifications((prev) => prev.filter((item) => !item.read));
  };

  // Filtered items
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (activeFilter === 'unread') return !item.read;
      if (activeFilter === 'security') return item.category === 'SECURITY';
      if (activeFilter === 'financial') return item.category === 'FINANCIAL';
      return true;
    });
  }, [notifications, activeFilter]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 mt-2 w-80 sm:w-[410px] max-h-[560px] rounded-2xl bg-white dark:bg-[#0c1527] border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_32px_-4px_rgba(15,23,42,0.14),0_4px_12px_-2px_rgba(15,23,42,0.06)] dark:shadow-2xl z-50 flex flex-col transition-all duration-200 ease-out transform origin-top-right animate-in fade-in zoom-in-95 overflow-hidden"
    >
      {/* Header Bar */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Bell className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Admin Notifications
          </span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white leading-none">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-[11px] font-semibold flex items-center gap-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-1 bg-white dark:bg-[#0c1527] overflow-x-auto">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'security', label: 'Security' },
          { id: 'financial', label: 'Financial' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification Items List */}
      <div className="flex-1 overflow-y-auto max-h-[380px] divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
        {isLoading ? (
          <div className="p-6 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading audit feed...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              All caught up
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              No pending notifications under this filter
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl transition-colors relative group ${
                !item.read
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50/80 dark:hover:bg-blue-950/35'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  {getCategoryIcon(item.category)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {getSeverityBadge(item.severity)}
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(item.createdAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      {item.actionTab && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose?.();
                            onNavigateTab?.(item.actionTab);
                          }}
                          className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>{item.actionLabel || 'Inspect'}</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}

                      {!item.read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          className="p-1 rounded text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDismiss(item.id, e)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Dismiss"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="px-3 py-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleClearRead}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          Clear read
        </button>

        <button
          type="button"
          onClick={() => {
            onClose?.();
            onNavigateTab?.('notifications');
          }}
          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Open Notification Center</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export default AdminNotificationBox;
