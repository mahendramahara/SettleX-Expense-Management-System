import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { AdminHeader } from '../components/layout/AdminHeader';
import { useAuth } from '../context/AuthContext';

export function AdminLayout({
  activeTab = 'dashboard',
  onTabChange,
  onSwitchToUserPortal,
  onOpenNewGroup,
  onOpenNewExpense,
  children,
}) {
  const { isGuest } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-[#080e1a] text-slate-900 dark:text-slate-100 flex antialiased transition-colors duration-200">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        isMobileOpen={isMobileOpen}
        isCollapsed={isCollapsed}
        onCloseMobile={() => setIsMobileOpen(false)}
        onOpenNewGroup={onOpenNewGroup}
        onOpenNewExpense={onOpenNewExpense}
        unreadCount={unreadCount}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <AdminHeader
          onToggleSidebar={handleToggleSidebar}
          isCollapsed={isCollapsed}
          onSwitchToUserPortal={onSwitchToUserPortal}
          onOpenNewGroup={onOpenNewGroup}
          onOpenNewExpense={onOpenNewExpense}
          onTabChange={onTabChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          unreadCount={unreadCount}
          onUnreadCountChange={setUnreadCount}
        />

        {isGuest && (
          <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/20 px-4 sm:px-6 py-2 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold">Guest Admin Preview Mode:</span>
              <span className="text-amber-700 dark:text-amber-300/90 hidden sm:inline">
                Viewing simulated platform data. Modifications and administrative actions are disabled.
              </span>
            </div>
            <button
              onClick={onSwitchToUserPortal}
              className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer shrink-0"
            >
              Switch to Member View
            </button>
          </div>
        )}

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto">
          <div className="w-full max-w-[1600px] mx-auto transition-all duration-300">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
