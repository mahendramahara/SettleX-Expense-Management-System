import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  Command,
  Sun,
  Moon,
  Palette,
  LogOut,
  ArrowRightLeft,
  ChevronDown,
  User,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FontSwitcher } from '../ui/FontSwitcher';
import { AdminNotificationBox } from './AdminNotificationBox';

export function AdminHeader({
  onToggleSidebar,
  isCollapsed = false,
  onSwitchToUserPortal,
  onOpenNewGroup,
  onOpenNewExpense,
  onTabChange,
  searchQuery = '',
  onSearchChange,
  unreadCount: propUnreadCount,
  onUnreadCountChange,
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, accent, setAccent, accents, activeFont, setActiveFont, fonts } =
    useTheme();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [internalUnreadCount, setInternalUnreadCount] = useState(0);

  const unreadCount = propUnreadCount !== undefined ? propUnreadCount : internalUnreadCount;
  const handleUnreadCountChange = onUnreadCountChange || setInternalUnreadCount;

  const paletteRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(e) {
      if (paletteRef.current && !paletteRef.current.contains(e.target)) {
        setIsPaletteOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsPaletteOpen(false);
        setIsProfileMenuOpen(false);
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const adminName = user?.name || 'Mahendra Singh Mahara';
  const adminEmail = user?.email || 'mahendra@settlex.admin';
  const adminRole =
    user?.role === 'superadmin'
      ? 'Root SuperAdmin'
      : user?.role === 'admin'
        ? 'Administrator'
        : user?.role || 'Administrator';

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0b1328] border-b border-slate-200 dark:border-slate-800/80 sticky top-0 z-30 flex items-center justify-between gap-4 transition-colors">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800/80 transition-colors cursor-pointer flex items-center justify-center"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search users, transactions, groups, audit logs..."
            className="w-full pl-10 pr-12 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:border-accent-main focus:ring-1 focus:ring-accent-main transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-200/60 dark:bg-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative" ref={paletteRef}>
          <button
            type="button"
            onClick={() => {
              setIsPaletteOpen((prev) => !prev);
              setIsProfileMenuOpen(false);
              setIsNotificationsOpen(false);
            }}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            title="Theme, Accents & Typography"
          >
            <Palette className="w-4 h-4 text-accent-main" />
          </button>

          {isPaletteOpen && (
            <div className="absolute right-0 mt-2 w-64 p-3 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_32px_-4px_rgba(15,23,42,0.12),0_4px_12px_-2px_rgba(15,23,42,0.04)] dark:shadow-2xl z-50 space-y-3 transition-all duration-200 ease-out transform origin-top-right animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Appearance & Theme
                </span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3 h-3 text-amber-400" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3 h-3 text-accent-main" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                  Accent Color
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {accents.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAccent(item.id)}
                      className={`h-6 rounded-md flex items-center justify-center transition-all ${
                        item.bgClass
                      } ${
                        accent === item.id
                          ? 'ring-2 ring-accent-main scale-105 shadow-sm'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                      title={item.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                  Font Family
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {fonts.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFont(f.id)}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                        activeFont === f.id
                          ? 'bg-accent-main text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <FontSwitcher className="hidden sm:block" />

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-accent-main" />
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotificationsOpen((prev) => !prev);
              setIsPaletteOpen(false);
              setIsProfileMenuOpen(false);
            }}
            className={`relative p-2 rounded-xl border transition-colors cursor-pointer ${
              isNotificationsOpen
                ? 'bg-accent-subtle border-accent-main text-accent-main shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800'
            }`}
            title="Notifications & Audit Feed"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-xs leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AdminNotificationBox
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            onNavigateTab={onTabChange}
            onUnreadCountChange={handleUnreadCountChange}
          />
        </div>

        <button
          type="button"
          onClick={onOpenNewExpense}
          className="p-2 rounded-xl bg-accent-main hover:bg-accent-hover text-white shadow-accent-main transition-all cursor-pointer"
          title="Quick Add Expense"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileMenuOpen((prev) => !prev);
              setIsPaletteOpen(false);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                {adminName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">
                {adminRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_32px_-4px_rgba(15,23,42,0.12),0_4px_12px_-2px_rgba(15,23,42,0.04)] dark:shadow-2xl z-50 space-y-1 transition-all duration-200 ease-out transform origin-top-right animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {adminName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {adminEmail}
                </div>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-accent-subtle text-accent-main">
                  {adminRole}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onTabChange?.('profile');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer font-medium"
              >
                <User className="w-3.5 h-3.5 text-accent-main" />
                <span>My Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onTabChange?.('settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer font-medium"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500" />
                <span>System Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onSwitchToUserPortal?.();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-accent-main hover:bg-accent-subtle transition-colors cursor-pointer font-semibold"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Switch to User View</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
