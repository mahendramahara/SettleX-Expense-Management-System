import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Receipt,
  Scale,
  BarChart3,
  GitFork,
  Terminal,
  Settings,
  ShieldCheck,
  User,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  Palette,
  Type,
  X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../ui/Logo';

export function AdminSidebar({
  activeTab = 'dashboard',
  onTabChange,
  isMobileOpen = false,
  isCollapsed = false,
  onCloseMobile,
  unreadCount = 0,
}) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  const { theme, toggleTheme, accent, setAccent, accents, activeFont, setActiveFont, fonts } =
    useTheme();
  const [isAlgorithmsOpen, setIsAlgorithmsOpen] = useState(true);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users, badge: 'All' },
    { id: 'admins', label: 'Admins', icon: ShieldCheck, badge: 'Staff' },
    { id: 'groups', label: 'Groups', icon: FolderKanban, badge: '8' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, badge: '56' },
    { id: 'settlements', label: 'Settlements', icon: Scale, badge: '12' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: '5' },
  ];

  const algorithmItems = [
    { id: 'settlement-calculation', label: 'Settlement Calculation' },
    { id: 'anomaly-detection', label: 'Anomaly Detection' },
  ];

  const handleSelect = (id) => {
    onTabChange?.(id);
    onCloseMobile?.();
  };

  return (
    <>
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 bg-white dark:bg-[#0b1328] border-r border-slate-200 dark:border-slate-800/80 z-50 flex flex-col transition-all duration-300 ease-in-out overflow-x-hidden lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        <div
          className={`h-16 px-4 flex items-center border-b border-slate-200 dark:border-slate-800/80 transition-all duration-300 overflow-hidden ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Logo
              size="md"
              showText={!isCollapsed}
              subtitle={isSuperAdmin ? 'SuperAdmin Panel' : 'Admin Panel'}
              onClick={() => handleSelect('dashboard')}
            />
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 lg:hidden cursor-pointer transition-all duration-300 ${
              isCollapsed ? 'opacity-0 max-w-0 p-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 flex flex-col scrollbar-thin">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 overflow-hidden ${
                    isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-accent-main text-white shadow-accent-main'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`flex items-center min-w-0 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                    <Icon className="w-4 h-4 shrink-0 transition-transform duration-300" />
                    <span
                      className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-left ${
                        isCollapsed
                          ? 'max-w-0 opacity-0 -translate-x-2 ml-0'
                          : 'max-w-36 opacity-100 translate-x-0 ml-3'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <span
                      className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out shrink-0 ${
                        isCollapsed
                          ? 'max-w-0 opacity-0 scale-50 ml-0'
                          : 'max-w-16 opacity-100 scale-100 ml-2'
                      }`}
                    >
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsAlgorithmsOpen((prev) => !prev)}
                title={isCollapsed ? 'Algorithms' : undefined}
                className={`w-full flex items-center rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-all duration-200 overflow-hidden ${
                  isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3.5 py-2.5'
                }`}
              >
                <div className={`flex items-center min-w-0 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                  <GitFork className="w-4 h-4 shrink-0 transition-transform duration-300" />
                  <span
                    className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-left ${
                      isCollapsed
                        ? 'max-w-0 opacity-0 -translate-x-2 ml-0'
                        : 'max-w-36 opacity-100 translate-x-0 ml-3'
                    }`}
                  >
                    Algorithms
                  </span>
                </div>
                <span
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out shrink-0 ${
                    isCollapsed ? 'max-w-0 opacity-0 scale-50 ml-0' : 'max-w-6 opacity-100 scale-100 ml-2'
                  }`}
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isAlgorithmsOpen ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  !isCollapsed && isAlgorithmsOpen
                    ? 'max-h-40 opacity-100 mt-1'
                    : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                }`}
              >
                <div className="ml-4 pl-3 border-l border-slate-200 dark:border-slate-800 space-y-1">
                  {algorithmItems.map((sub) => {
                    const isActive =
                      activeTab === sub.id ||
                      (sub.id === 'settlement-calculation' && activeTab === 'debt-optimization');
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSelect(sub.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                          isActive
                            ? 'text-accent-main font-bold bg-accent-subtle'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/30 font-medium'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Profile nav item after Algorithm */}
            <button
              type="button"
              onClick={() => handleSelect('profile')}
              title={isCollapsed ? 'Profile' : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 overflow-hidden ${
                isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-start px-3.5 py-2.5'
              } ${
                activeTab === 'profile'
                  ? 'bg-accent-main text-white shadow-accent-main'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`flex items-center min-w-0 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                <User className="w-4 h-4 shrink-0 transition-transform duration-300" />
                <span
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-left ${
                    isCollapsed
                      ? 'max-w-0 opacity-0 -translate-x-2 ml-0'
                      : 'max-w-36 opacity-100 translate-x-0 ml-3'
                  }`}
                >
                  Profile
                </span>
              </div>
            </button>
          </div>

          {/* Bottom side aligned: Notifications, System Logs, Settings */}
          <div className="mt-auto pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1">
            <button
              type="button"
              onClick={() => handleSelect('notifications')}
              title={isCollapsed ? 'Notifications' : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 overflow-hidden ${
                isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3.5 py-2.5'
              } ${
                activeTab === 'notifications'
                  ? 'bg-accent-main text-white shadow-accent-main'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`flex items-center min-w-0 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                <Bell className="w-4 h-4 shrink-0 transition-transform duration-300" />
                <span
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-left ${
                    isCollapsed
                      ? 'max-w-0 opacity-0 -translate-x-2 ml-0'
                      : 'max-w-36 opacity-100 translate-x-0 ml-3'
                  }`}
                >
                  Notifications
                </span>
              </div>
              {unreadCount > 0 && (
                <span
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out shrink-0 ${
                    isCollapsed
                      ? 'max-w-0 opacity-0 scale-50 ml-0'
                      : 'max-w-16 opacity-100 scale-100 ml-2'
                  }`}
                >
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeTab === 'notifications'
                        ? 'bg-white/20 text-white'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSelect('system-logs')}
              title={isCollapsed ? 'System Logs' : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 overflow-hidden ${
                isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-start px-3.5 py-2.5'
              } ${
                activeTab === 'system-logs'
                  ? 'bg-accent-main text-white shadow-accent-main'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`flex items-center min-w-0 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                <Terminal className="w-4 h-4 shrink-0 transition-transform duration-300" />
                <span
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-left ${
                    isCollapsed
                      ? 'max-w-0 opacity-0 -translate-x-2 ml-0'
                      : 'max-w-36 opacity-100 translate-x-0 ml-3'
                  }`}
                >
                  System Logs
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelect('settings')}
              title={isCollapsed ? 'Settings' : undefined}
              className={`w-full flex items-center rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 overflow-hidden ${
                isCollapsed ? 'justify-center px-0 py-2.5' : 'justify-start px-3.5 py-2.5'
              } ${
                activeTab === 'settings'
                  ? 'bg-accent-main text-white shadow-accent-main'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`flex items-center min-w-0 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                <Settings className="w-4 h-4 shrink-0 transition-transform duration-300" />
                <span
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-left ${
                    isCollapsed
                      ? 'max-w-0 opacity-0 -translate-x-2 ml-0'
                      : 'max-w-36 opacity-100 translate-x-0 ml-3'
                  }`}
                >
                  Settings
                </span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2 overflow-hidden">
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              !isCollapsed && isThemeMenuOpen
                ? 'max-h-64 opacity-100 mb-2'
                : 'max-h-0 opacity-0 mb-0 pointer-events-none'
            }`}
          >
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
                  <Palette className="w-3 h-3 text-accent-main" />
                  <span>Accent Theme</span>
                </div>
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
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={item.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
                  <Type className="w-3 h-3 text-accent-main" />
                  <span>Typography</span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {fonts.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFont(f.id)}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors ${
                        activeFont === f.id
                          ? 'bg-accent-main text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`flex items-center justify-center rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-all duration-300 cursor-pointer overflow-hidden ${
                isCollapsed ? 'w-full py-2.5 px-0' : 'flex-1 py-2 px-3 gap-2'
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-accent-main shrink-0" />
              )}
              <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                  isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-28 opacity-100 ml-1.5'
                }`}
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsThemeMenuOpen((prev) => !prev)}
              className={`rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-all duration-300 cursor-pointer overflow-hidden shrink-0 ${
                isCollapsed ? 'max-w-0 p-0 border-0 opacity-0 pointer-events-none' : 'max-w-10 p-2 opacity-100'
              }`}
              title="Custom Styling & Fonts"
            >
              <Palette className="w-4 h-4 text-accent-main" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
