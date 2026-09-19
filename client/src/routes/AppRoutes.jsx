import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';

// User Pages
import { DashboardPage as UserDashboardPage } from '../pages/user/DashboardPage';
import { GroupsPage as UserGroupsPage } from '../pages/user/GroupsPage';
import { ExpensesPage as UserExpensesPage } from '../pages/user/ExpensesPage';
import { SettlementsPage as UserSettlementsPage } from '../pages/user/SettlementsPage';
import { AnalyticsPage as UserAnalyticsPage } from '../pages/user/AnalyticsPage';
import { ProfilePage as UserProfilePage } from '../pages/user/ProfilePage';
import { SettingsPage as UserSettingsPage } from '../pages/user/SettingsPage';
import { NotificationsPage as UserNotificationsPage } from '../pages/user/NotificationsPage';

// Admin Pages
import { DashboardPage as AdminDashboardPage } from '../pages/admin/DashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminStaffPage } from '../pages/admin/AdminStaffPage';
import { AdminGroupsPage } from '../pages/admin/AdminGroupsPage';
import { AdminExpensesPage } from '../pages/admin/AdminExpensesPage';
import { AdminSettlementsPage } from '../pages/admin/AdminSettlementsPage';
import { AdminAnalyticsPage } from '../pages/admin/AdminAnalyticsPage';
import { AdminDebtOptimizationPage } from '../pages/admin/AdminDebtOptimizationPage';
import { AdminAnomalyDetectionPage } from '../pages/admin/AdminAnomalyDetectionPage';
import { AdminProfilePage } from '../pages/admin/AdminProfilePage';
import { AdminNotificationsPage } from '../pages/admin/AdminNotificationsPage';
import { AdminSystemLogsPage } from '../pages/admin/AdminSystemLogsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

// Auth Pages & Modals
import { LandingPage } from '../pages/auth/LandingPage';
import { GoogleCallbackPage } from '../pages/auth/GoogleCallbackPage';
import { OtpVerificationModal } from '../components/auth/OtpVerificationModal';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { CreateGroupModal } from '../components/groups/CreateGroupModal';
import { AppLoadingScreen } from '../components/ui/AppLoadingScreen';

function RequireAdmin({ isAdmin, isLoading, children }) {
  if (isLoading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

export function AppRoutes() {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    isGuest,
    isSwitchedToMember,
    switchToMemberView,
    switchToAdminView,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
  } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [preselectedGroupId, setPreselectedGroupId] = useState(null);

  // Derive active tab for AdminSidebar based on current URL
  const getAdminActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/staff') || path.includes('/admin/admins')) return 'admins';
    if (path.includes('/admin/groups')) return 'groups';
    if (path.includes('/admin/expenses')) return 'expenses';
    if (path.includes('/admin/settlements')) return 'settlements';
    if (path.includes('/admin/analytics')) return 'analytics';
    if (path.includes('/admin/settlement-calculation') || path.includes('/admin/debt-optimization'))
      return 'settlement-calculation';
    if (path.includes('/admin/anomaly-detection')) return 'anomaly-detection';
    if (path.includes('/admin/profile')) return 'profile';
    if (path.includes('/admin/notifications')) return 'notifications';
    if (path.includes('/admin/logs') || path.includes('/admin/system-logs')) return 'system-logs';
    if (path.includes('/admin/settings')) return 'settings';
    return 'dashboard';
  };

  // Derive active tab for User Sidebar based on current URL
  const getUserActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith('/groups')) return 'groups';
    if (path.startsWith('/expenses')) return 'expenses';
    if (path.startsWith('/settlements')) return 'settlements';
    if (path.startsWith('/analytics')) return 'analytics';
    if (path.startsWith('/profile')) return 'profile';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/notifications')) return 'notifications';
    return 'home';
  };

  // Auto redirect admin arriving at root path
  useEffect(() => {
    if (
      isAuthenticated &&
      isAdmin &&
      !isSwitchedToMember &&
      location.pathname === '/' &&
      !sessionStorage.getItem('settlex_switched_to_user')
    ) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, isSwitchedToMember, location.pathname, navigate]);

  const handleOpenOtp = (email) => {
    if (isGuest) {
      toast.warning('Please create a free account to verify your email.');
      return;
    }
    setPendingVerificationEmail(email);
    setIsOtpOpen(true);
  };

  const handleNewExpense = (targetGroupId = null) => {
    if (isGuest) {
      toast.warning('Please log in to add expenses.');
      return;
    }
    if (user && !user.isVerified && !user.isAdmin) {
      handleOpenOtp(user.email);
      return;
    }
    const cleanId =
      typeof targetGroupId === 'string' ? targetGroupId : targetGroupId?.id || targetGroupId?._id;
    setPreselectedGroupId(typeof cleanId === 'string' ? cleanId : null);
    setIsAddExpenseOpen(true);
  };

  const handleNewGroup = () => {
    if (isGuest) {
      toast.warning('Demo Mode', 'Create a free account to manage your own expense groups.');
      return;
    }
    if (user && !user.isVerified && !user.isAdmin) {
      handleOpenOtp(user.email);
      return;
    }
    setIsCreateGroupOpen(true);
  };

  // Navigation handlers
  const handleAdminTabChange = (tab) => {
    if (tab === 'dashboard') navigate('/admin/dashboard');
    else if (tab === 'admins') navigate('/admin/staff');
    else if (tab === 'system-logs') navigate('/admin/logs');
    else if (tab === 'settlement-calculation' || tab === 'debt-optimization')
      navigate('/admin/settlement-calculation');
    else navigate(`/admin/${tab}`);
  };

  const handleUserTabChange = (tab) => {
    if (tab === 'admin') {
      if (isSwitchedToMember) {
        switchToAdminView();
      } else {
        sessionStorage.removeItem('settlex_switched_to_user');
      }
      navigate('/admin/dashboard');
    } else if (tab === 'home') {
      navigate('/');
    } else {
      navigate(`/${tab}`);
    }
  };

  const handleSwitchToUserPortal = () => {
    switchToMemberView();
    navigate('/');
  };

  // 1. Google OAuth Callback Route
  if (location.pathname === '/auth/callback') {
    return (
      <AuthLayout onNavigateHome={() => navigate('/')}>
        <GoogleCallbackPage onCompleted={() => navigate('/')} />
      </AuthLayout>
    );
  }

  // 2. Global Authentication Loading State (Prevents Auth Blink on Refresh/Login)
  if (isLoading) {
    return <AppLoadingScreen />;
  }

  // 3. Unauthenticated Public Views
  if (!isAuthenticated) {
    return (
      <AuthLayout onNavigateHome={() => navigate('/')}>
        <LandingPage
          onOpenOtp={handleOpenOtp}
          onOpenForgotPassword={() => setIsForgotOpen(true)}
        />
        <OtpVerificationModal
          isOpen={isOtpOpen}
          onClose={() => setIsOtpOpen(false)}
          email={pendingVerificationEmail}
          onVerify={verifyOtp}
          onResend={resendOtp}
          onSuccess={() => {
            setIsOtpOpen(false);
            navigate('/', { replace: true });
          }}
        />
        <ForgotPasswordModal
          isOpen={isForgotOpen}
          onClose={() => setIsForgotOpen(false)}
          onRequestOtp={forgotPassword}
          onResetPassword={resetPassword}
          onSuccess={() => setIsForgotOpen(false)}
        />
      </AuthLayout>
    );
  }

  // 3. Authenticated Routes (Member Portal & Admin Console)
  return (
    <>
      <Routes>
        {/* Admin Console Route Hierarchy — requires admin authentication */}
        <Route
          path="/admin/*"
          element={
            <RequireAdmin isAdmin={isAdmin} isLoading={isLoading}>
              <AdminLayout
                activeTab={getAdminActiveTab()}
                onTabChange={handleAdminTabChange}
                onSwitchToUserPortal={handleSwitchToUserPortal}
                onOpenNewGroup={handleNewGroup}
                onOpenNewExpense={() => handleNewExpense()}
              />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <AdminDashboardPage
                onOpenNewGroup={handleNewGroup}
                onOpenNewExpense={() => handleNewExpense()}
                onOptimizeSettlement={() => navigate('/admin/settlement-calculation')}
                onViewAnalytics={() => navigate('/admin/analytics')}
                onNavigateTab={handleAdminTabChange}
              />
            }
          />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="staff" element={<AdminStaffPage />} />
          <Route path="admins" element={<Navigate to="/admin/staff" replace />} />
          <Route path="groups" element={<AdminGroupsPage />} />
          <Route path="expenses" element={<AdminExpensesPage />} />
          <Route path="settlements" element={<AdminSettlementsPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settlement-calculation" element={<AdminDebtOptimizationPage />} />
          <Route
            path="debt-optimization"
            element={<Navigate to="/admin/settlement-calculation" replace />}
          />
          <Route path="anomaly-detection" element={<AdminAnomalyDetectionPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="notifications" element={<AdminNotificationsPage onNavigateTab={handleAdminTabChange} />} />
          <Route path="logs" element={<AdminSystemLogsPage />} />
          <Route path="system-logs" element={<Navigate to="/admin/logs" replace />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Member Portal Route Hierarchy */}
        <Route
          path="/*"
          element={
            <MainLayout
              activeTab={getUserActiveTab()}
              onTabChange={handleUserTabChange}
              isMobileOpen={isMobileMenuOpen}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
              onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
              onNewExpense={() => handleNewExpense()}
              user={user}
              onOpenOtp={handleOpenOtp}
            />
          }
        >
          <Route
            index
            element={
              isAdmin && !sessionStorage.getItem('settlex_switched_to_user') ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <UserDashboardPage
                  onOpenNewExpense={() => handleNewExpense()}
                  onOpenNewGroup={handleNewGroup}
                  refreshKey={dashboardRefreshKey}
                />
              )
            }
          />
          <Route
            path="dashboard"
            element={
              <UserDashboardPage
                onOpenNewExpense={() => handleNewExpense()}
                onOpenNewGroup={handleNewGroup}
                refreshKey={dashboardRefreshKey}
              />
            }
          />
          <Route
            path="groups"
            element={
              <UserGroupsPage
                onOpenNewGroup={handleNewGroup}
                onOpenNewExpense={(targetGroup) =>
                  handleNewExpense(targetGroup?.id || targetGroup?._id)
                }
                refreshKey={dashboardRefreshKey}
              />
            }
          />
          <Route
            path="expenses"
            element={
              <UserExpensesPage
                onOpenNewExpense={handleNewExpense}
                refreshKey={dashboardRefreshKey}
              />
            }
          />
          <Route
            path="settlements"
            element={<UserSettlementsPage refreshKey={dashboardRefreshKey} />}
          />
          <Route
            path="analytics"
            element={<UserAnalyticsPage refreshKey={dashboardRefreshKey} />}
          />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="settings" element={<UserSettingsPage />} />
          <Route
            path="notifications"
            element={
              <UserNotificationsPage
                onNavigateTab={handleUserTabChange}
                onOpenOtp={handleOpenOtp}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>

      {/* Shared Verification & Creation Modals */}
      <OtpVerificationModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        email={pendingVerificationEmail || user?.email}
        onVerify={verifyOtp}
        onResend={resendOtp}
        onSuccess={() => setIsOtpOpen(false)}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setPreselectedGroupId(null);
        }}
        defaultGroupId={preselectedGroupId}
        onExpenseCreated={() => setDashboardRefreshKey((k) => k + 1)}
      />

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={() => setDashboardRefreshKey((k) => k + 1)}
      />
    </>
  );
}

export default AppRoutes;
