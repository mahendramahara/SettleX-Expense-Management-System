import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { NotificationsList } from '../../components/notifications/NotificationsList';
import { NotificationDigestCard } from '../../components/notifications/NotificationDigestCard';
import { ActionableAlertsCard } from '../../components/notifications/ActionableAlertsCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function NotificationsPage({ onNavigateTab, onOpenOtp }) {
  const { user, isGuest } = useAuth();
  const toast = useToast();

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'New shared expense logged',
      description:
        'Aarav Gurung added "Paragliding Adventure" in Pokhara Trip. Your share is Rs. 3,000.00.',
      time: '10 mins ago',
      type: 'expense',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Settlement proposal ready',
      description:
        'Intelligent Debt Engine eliminated 2 cycles in Pokhara Trip. Minimal direct payments ready for review.',
      time: '1 hour ago',
      type: 'settlement',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Group balance updated',
      description:
        'Monthly electricity bill was recorded in Roommates Koteshwor. Your ledger was adjusted.',
      time: 'Yesterday',
      type: 'group',
      read: true,
    },
    {
      id: 'notif-4',
      title: 'Account security notification',
      description: 'Your SettleX session was verified successfully.',
      time: '2 days ago',
      type: 'security',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    if (isGuest) {
      toast.warning('Please log in to manage notifications.');
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const handleDismiss = (id) => {
    if (isGuest) {
      toast.warning('Please log in to manage notifications.');
      return;
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.info('Notification dismissed');
  };

  const handleClearRead = () => {
    if (isGuest) {
      toast.warning('Please log in to manage notifications.');
      return;
    }
    setNotifications((prev) => prev.filter((n) => !n.read));
    toast.success('Read notifications removed');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Bell className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Notifications & Alerts
          </h1>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Real-time updates regarding your expense shares, cycle cancellations, and group
          settlements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <NotificationsList
            notifications={notifications}
            onMarkAllRead={handleMarkAllRead}
            onDismiss={handleDismiss}
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <ActionableAlertsCard user={user} onNavigateTab={onNavigateTab} onOpenOtp={onOpenOtp} />
          <NotificationDigestCard unreadCount={unreadCount} onClearRead={handleClearRead} />
        </div>
      </div>
    </div>
  );
}
