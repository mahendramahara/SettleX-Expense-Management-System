import React from 'react';
import {
  Home,
  Users,
  Receipt,
  Scale,
  BarChart3,
  User,
  Bell,
  Settings,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';
import { Avatar } from '../ui/Avatar';

export function Sidebar({ activeTab = 'home', onTabChange, isMobileOpen, onCloseMobile, unreadCount = 0 }) {
  const { user, logout, isGuest, isSwitchedToMember } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'settlements', label: 'Settlements', icon: Scale },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const isAdminUser =
    isSwitchedToMember ||
    (
      !isGuest &&
      (
        user?.role === 'superadmin' ||
        user?.role === 'admin' ||
        user?.role === 'staff' ||
        user?.role === 'moderator' ||
        Boolean(user?.isAdmin)
      )
    );

  if (isAdminUser) {
    navItems.push({
      id: 'admin',
      label: isSwitchedToMember ? 'Return to Admin' : 'Admin Console',
      icon: Shield,
    });
  }

  const bottomNavItems = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount) : null,
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#0a192f] text-slate-900 dark:text-slate-200 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800/80 transition-colors duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
            <Logo
              size="md"
              onClick={() => {
                onTabChange?.('home');
                onCloseMobile?.();
              }}
            />
          </div>

          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange?.(item.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-accent-main text-white shadow-accent-main'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
          <div className="space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange?.(item.id);
                    onCloseMobile?.();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-accent-main text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-main text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                onTabChange?.('profile');
                onCloseMobile?.();
              }}
              className="flex items-center gap-3 min-w-0 flex-1 text-left hover:opacity-85 transition-opacity cursor-pointer"
            >
              <Avatar name={user?.name || 'Demo User'} size="sm" />
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.name || 'Demo User'}
                  </span>
                  {isGuest && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-slate-500/10 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-500/30 shrink-0">
                      {isSwitchedToMember ? 'Member' : 'Demo'}
                    </span>
                  )}
                  {isAdminUser && !isGuest && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0">
                      {user?.role === 'superadmin' ? 'Root' : 'Admin'}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'demo@settlex.app'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
