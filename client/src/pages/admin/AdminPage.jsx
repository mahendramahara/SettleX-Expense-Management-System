import React, { useState, useEffect, useCallback } from 'react';
import { Shield, RotateCw } from 'lucide-react';
import { DashboardPage } from './DashboardPage';
import { AdminUsersPage } from './AdminUsersPage';
import { AdminStaffPage } from './AdminStaffPage';
import { AdminGroupsPage } from './AdminGroupsPage';
import { AdminExpensesPage } from './AdminExpensesPage';
import { AdminSettlementsPage } from './AdminSettlementsPage';
import { AdminAnalyticsPage } from './AdminAnalyticsPage';
import { AdminDebtOptimizationPage } from './AdminDebtOptimizationPage';
import { AdminAnomalyDetectionPage } from './AdminAnomalyDetectionPage';
import { AdminSystemLogsPage } from './AdminSystemLogsPage';
import { AdminSettingsPage } from './AdminSettingsPage';
import { AdminProfilePage } from './AdminProfilePage';
import { AdminNotificationsPage } from './AdminNotificationsPage';
import { GroupsPage } from '../user/GroupsPage';
import { ExpensesPage } from '../user/ExpensesPage';
import { SettlementsPage } from '../user/SettlementsPage';
import { AnalyticsPage } from '../user/AnalyticsPage';
import { adminService, userService } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DEMO from '../../demo/data.json';

export function AdminPage({
  activeTab = 'dashboard',
  onTabChange,
  onOpenNewGroup,
  onOpenNewExpense,
}) {
  const { isGuest } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (isGuest) {
      setStats({
        totalUsers: 24,
        totalGroups: 6,
        totalVolumePaisa: 12480000,
      });
      setUsers([
        {
          id: 'u-1',
          name: 'Demo User',
          email: 'demo@settlex.app',
          role: 'user',
          tier: 'student',
          isVerified: true,
          isSuspended: false,
        },
        {
          id: 'u-2',
          name: 'Aarav Gurung',
          email: 'aarav.gurung@demo.com',
          role: 'user',
          tier: 'student',
          isVerified: true,
          isSuspended: false,
        },
        {
          id: 'u-3',
          name: 'Priya Thapa',
          email: 'priya.thapa@demo.com',
          role: 'user',
          tier: 'premium',
          isVerified: true,
          isSuspended: false,
        },
        {
          id: 'u-4',
          name: 'Bikash Rai',
          email: 'bikash.rai@demo.com',
          role: 'user',
          tier: 'student',
          isVerified: false,
          isSuspended: false,
        },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const [overviewRes, usersRes] = await Promise.allSettled([
        adminService.getOverview(),
        userService.getUsers(),
      ]);

      if (overviewRes.status === 'fulfilled') {
        setStats(overviewRes.value?.data || overviewRes.value);
      }
      if (usersRes.status === 'fulfilled') {
        const list = usersRes.value?.data?.users || usersRes.value?.users || [];
        setUsers(Array.isArray(list) ? list : []);
      }
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isGuest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    toast.info('Admin dashboard synchronized');
  };

  const handleToggleSuspend = async (targetUser) => {
    const isSuspended = targetUser.isSuspended;
    const targetId = targetUser.id || targetUser._id;

    if (isGuest) {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetId ? { ...u, isSuspended: !isSuspended } : u))
      );
      toast.success(`User ${!isSuspended ? 'suspended' : 'reactivated'} in demo session`);
      return;
    }

    try {
      if (isSuspended) {
        await userService.reactivateUser(targetId);
        toast.success('User account reactivated');
      } else {
        await userService.suspendUser(targetId, 'Administrative hold');
        toast.warning('User account suspended');
      }
      await loadData();
    } catch (err) {
      toast.error(err?.message || 'Action failed');
    }
  };

  if (activeTab === 'users') {
    return <AdminUsersPage />;
  }

  if (activeTab === 'admins') {
    return <AdminStaffPage />;
  }

  if (activeTab === 'groups') {
    return <AdminGroupsPage />;
  }

  if (activeTab === 'expenses') {
    return <AdminExpensesPage />;
  }

  if (activeTab === 'settlements') {
    return <AdminSettlementsPage />;
  }

  if (activeTab === 'debt-optimization') {
    return <AdminDebtOptimizationPage />;
  }

  if (activeTab === 'anomaly-detection') {
    return <AdminAnomalyDetectionPage />;
  }

  if (activeTab === 'analytics' || activeTab === 'graph-analysis') {
    return <AdminAnalyticsPage />;
  }

  if (activeTab === 'profile') {
    return <AdminProfilePage />;
  }

  if (activeTab === 'notifications') {
    return <AdminNotificationsPage onNavigateTab={onTabChange} />;
  }

  if (activeTab === 'system-logs') {
    return <AdminSystemLogsPage />;
  }

  if (activeTab === 'settings') {
    return <AdminSettingsPage />;
  }

  return (
    <DashboardPage
      onOpenNewGroup={onOpenNewGroup}
      onOpenNewExpense={onOpenNewExpense}
      onOptimizeSettlement={() => onTabChange?.('settlements')}
      onViewAnalytics={() => onTabChange?.('analytics')}
      onNavigateTab={(tab) => onTabChange?.(tab)}
    />
  );
}
