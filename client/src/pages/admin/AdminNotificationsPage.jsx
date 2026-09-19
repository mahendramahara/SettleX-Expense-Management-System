import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bell,
  RotateCw,
  CheckCheck,
  Megaphone,
  Search,
  Filter,
  ShieldCheck,
  SlidersHorizontal,
  CheckCircle2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { notificationService } from '../../services/notification.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Modular admin notification components
import AdminNotificationsKpiCards from '../../components/admin/notifications/AdminNotificationsKpiCards';
import AdminNotificationItem from '../../components/admin/notifications/AdminNotificationItem';
import AdminNotificationPreferencesCard from '../../components/admin/notifications/AdminNotificationPreferencesCard';
import AdminBroadcastModal from '../../components/admin/notifications/AdminBroadcastModal';
import DEMO from '../../demo/data.json';

export function AdminNotificationsPage({ onNavigateTab }) {
  const { user: currentAdmin, isGuest } = useAuth();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    unread: 0,
    critical: 0,
    warning: 0,
    financial: 0,
    security: 0,
    anomaly: 0,
    system: 0,
  });

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Load notifications from backend or demo
  const fetchNotifications = useCallback(async () => {
    if (isGuest) {
      const demoNotifs = DEMO.admin?.notifications || { summary: {}, notifications: [] };
      let list = demoNotifs.notifications || [];
      if (categoryFilter !== 'all') {
        list = list.filter((n) => n.category?.toLowerCase() === categoryFilter.toLowerCase());
      }
      if (severityFilter !== 'all') {
        list = list.filter((n) => n.severity?.toLowerCase() === severityFilter.toLowerCase());
      }
      if (unreadOnly) {
        list = list.filter((n) => !n.read);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(
          (n) => n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q)
        );
      }
      setNotifications(list);
      setSummary(demoNotifs.summary || {});
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await notificationService.getNotifications({
        category: categoryFilter,
        severity: severityFilter,
        read: unreadOnly ? false : 'all',
        search: searchQuery,
      });

      if (res && res.data) {
        setNotifications(res.data.notifications || []);
        setSummary(res.data.summary || {});
      }
    } catch (err) {
      console.warn('Failed to load notifications via API', err);
      if (isGuest) {
        // Fallback notifications with Nepal context for guest demo
        const fallbackList = [
          {
            id: 'fb-1',
            title: 'Repeated Authentication Failures Detected',
            message:
              'Endpoint /api/admin/login encountered 5 consecutive bad credentials from IP 103.145.72.10 (Kathmandu Subnet). Rate limiter temporary block engaged.',
            category: 'SECURITY',
            severity: 'CRITICAL',
            actionTab: 'system-logs',
            actionLabel: 'Inspect Audit Stream',
            details: { ip: '103.145.72.10', location: 'Kathmandu, NP', attempts: 5 },
            read: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'fb-2',
            title: 'Severe Outlier Expense Ratio Identified',
            message:
              'Heuristics flagged Demo User fronting 3.4x peer fair share across 3 active circles ("Design Studio Baneshwor", "Pokhara Trekking Expedition"). Overspend threshold exceeded.',
            category: 'ANOMALY',
            severity: 'WARNING',
            actionTab: 'anomaly-detection',
            actionLabel: 'Review Anomaly Profile',
            details: { user: 'Demo User', ratio: 3.4, groupsCount: 3 },
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: 'fb-3',
            title: 'High-Value Settlement Recorded',
            message:
              'Direct payment of Rs. 45,000 recorded in "Pokhara Trekking Expedition" between Aarav Gurung and Pooja Thapa verified with eSewa reference #ESW-99214.',
            category: 'FINANCIAL',
            severity: 'INFO',
            actionTab: 'settlements',
            actionLabel: 'View Settlement Details',
            details: { group: 'Pokhara Trekking Expedition', amount: 'Rs. 45,000', method: 'eSewa' },
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          },
          {
            id: 'fb-4',
            title: 'Algorithmic Graph Simplification Executed',
            message:
              'Automated greedy balance cancellation resolved 18 cyclic group debts into 6 minimal net payments across "Thamel Tech Hub", decreasing transaction friction by 66.7%.',
            category: 'SYSTEM',
            severity: 'SUCCESS',
            actionTab: 'debt-optimization',
            actionLabel: 'Open Sandbox',
            details: { rawTransactions: 18, reducedTo: 6, efficiencyGain: '66.7%' },
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
          },
        ];

        setNotifications(fallbackList);
        setSummary({
          total: 4,
          unread: 3,
          critical: 1,
          warning: 1,
          financial: 1,
          security: 1,
          anomaly: 1,
          system: 1,
        });
      } else {
        setNotifications([]);
        setSummary({
          total: 0,
          unread: 0,
          critical: 0,
          warning: 0,
          financial: 0,
          security: 0,
          anomaly: 0,
          system: 0,
        });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [categoryFilter, severityFilter, unreadOnly, searchQuery, isGuest]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
    toast.info('Notifications feed updated');
  };

  // Mark all read
  const handleMarkAllRead = async () => {
    if (isGuest) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setSummary((prev) => ({ ...prev, unread: 0 }));
      toast.success('All notifications marked as read (Demo).');
      return;
    }
    try {
      await notificationService.markAllNotificationsRead(categoryFilter);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setSummary((prev) => ({ ...prev, unread: 0 }));
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark notifications as read.');
    }
  };

  // Mark single read
  const handleMarkSingleRead = async (id) => {
    if (isGuest) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setSummary((prev) => ({
        ...prev,
        unread: Math.max(0, (prev.unread || 1) - 1),
      }));
      toast.success('Notification marked as read (Demo).');
      return;
    }
    try {
      await notificationService.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setSummary((prev) => ({
        ...prev,
        unread: Math.max(0, (prev.unread || 1) - 1),
      }));
      toast.success('Notification marked as read.');
    } catch {
      toast.error('Could not update notification.');
    }
  };

  // Dismiss notification
  const handleDismiss = async (id) => {
    if (isGuest) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setSummary((prev) => ({
        ...prev,
        total: Math.max(0, (prev.total || 1) - 1),
      }));
      toast.info('Notification dismissed (Demo).');
      return;
    }
    try {
      await notificationService.dismissNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setSummary((prev) => ({
        ...prev,
        total: Math.max(0, (prev.total || 1) - 1),
      }));
      toast.info('Notification dismissed.');
    } catch {
      toast.error('Could not dismiss notification.');
    }
  };

  // Clear all read notifications
  const handleClearRead = async () => {
    if (isGuest) {
      setNotifications((prev) => prev.filter((n) => !n.read));
      toast.success('Read notifications removed (Demo).');
      return;
    }
    try {
      await notificationService.clearReadNotifications();
      setNotifications((prev) => prev.filter((n) => !n.read));
      toast.success('Read notifications removed.');
      fetchNotifications();
    } catch {
      toast.error('Failed to clear read notifications.');
    }
  };

  // Broadcast announcement
  const handleBroadcast = async (data) => {
    if (isGuest) {
      setIsBroadcastOpen(false);
      toast.warning('Broadcasting notifications is disabled in guest preview mode.');
      return;
    }
    try {
      setIsSendingBroadcast(true);
      const res = await notificationService.broadcastNotification(data);
      if (res && res.success) {
        setIsBroadcastOpen(false);
        toast.success('Administrative alert broadcast successfully.');
        fetchNotifications();
      } else {
        throw new Error(res?.message || 'Failed to dispatch broadcast');
      }
    } catch (err) {
      toast.error(err.message || 'Broadcast dispatch failed.');
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Alerts' },
    { id: 'security', label: 'Security' },
    { id: 'financial', label: 'Financial' },
    { id: 'anomaly', label: 'Anomalies' },
    { id: 'system', label: 'System Hygiene' },
  ];

  const severities = [
    { id: 'all', label: 'All Severities' },
    { id: 'critical', label: 'Critical Only' },
    { id: 'warning', label: 'Warnings' },
    { id: 'info', label: 'Info' },
    { id: 'success', label: 'Resolved' },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Notifications & Operational Alerts Hub
              </h1>
              {summary.unread > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  {summary.unread} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live operational alerts, anomaly warnings, perimeter security events, and ledger
              reconciliation notices
            </p>
          </div>
        </div>

        {/* Global Header Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsBroadcastOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-accent-main hover:bg-accent-hover shadow-accent-main transition-all active:scale-95 cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Broadcast Notice</span>
          </button>

          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={summary.unread === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition disabled:opacity-50 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-accent-main" />
            <span>Mark All Read</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer"
            title="Refresh Notification Feed"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <AdminNotificationsKpiCards
        summary={summary}
        activeCategory={categoryFilter}
        onSelectCategory={(cat) => setCategoryFilter(cat)}
      />

      {/* Search & Category Filter Strip */}
      <div className="p-3 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
          {categories.map((c) => {
            const isActive = categoryFilter === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryFilter(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Severity, Search, Unread Filters */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter alerts..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Severity Dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer focus:outline-none"
          >
            {severities.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Unread Only Toggle */}
          <button
            type="button"
            onClick={() => setUnreadOnly((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
              unreadOnly
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Notification Feed */}
        <div className="lg:col-span-8 space-y-3">
          {isLoading ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Fetching operational notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No Notifications Found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                No active operational alerts match your selected category, search keywords, or
                severity filters.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <AdminNotificationItem
                key={notif.id}
                notification={notif}
                onMarkRead={handleMarkSingleRead}
                onDismiss={handleDismiss}
                onNavigate={onNavigateTab}
              />
            ))
          )}
        </div>

        {/* Right Column: Preferences & Dispatch Controls */}
        <div className="lg:col-span-4 space-y-5">
          <AdminNotificationPreferencesCard
            unreadCount={summary.unread}
            onClearRead={handleClearRead}
          />
        </div>
      </div>

      {/* Broadcast Modal */}
      <AdminBroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        onBroadcast={handleBroadcast}
        isSending={isSendingBroadcast}
      />
    </div>
  );
}

export default AdminNotificationsPage;
