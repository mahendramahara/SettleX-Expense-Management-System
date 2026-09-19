import React from 'react';
import { Bell, Menu, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { FontSwitcher } from '../ui/FontSwitcher';
import { Button } from '../ui/Button';
import { getTimeGreeting } from '../../utils/greeting';

export function Header({ onToggleMobileMenu, onNewExpense, onNavigateAdmin, onNavigateTab }) {
  const { user, isAdmin, isSwitchedToMember, isGuest } = useAuth();
  const displayName = isGuest || user?.isGuest
    ? (user?.name || 'Demo User')
    : (user?.name ? user.name.split(' ')[0] : 'there');

  const showAdminLink = Boolean(
    isAdmin ||
    isSwitchedToMember ||
    user?.isAdmin ||
    user?.realAdmin
  );

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 lg:hidden cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {getTimeGreeting()}, {displayName}
              </h1>
              {showAdminLink && (
                <button
                  type="button"
                  onClick={onNavigateAdmin}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-main hover:bg-accent-hover text-white transition-colors cursor-pointer shadow-accent-main"
                  title="Open Admin Console"
                >
                  {isSwitchedToMember ? 'Return to Admin Console' : 'Admin Console'}
                </button>
              )}
              <span className="inline-block animate-pulse text-amber-500">
                <Sparkles className="w-5 h-5" />
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isSwitchedToMember
                ? 'Member preview mode active — exploring simulated group transactions and personal debts.'
                : "Here's what's happening with your groups."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end md:self-auto">
        <FontSwitcher />
        <ThemeSwitcher />

        <button
          type="button"
          onClick={() => onNavigateTab?.('notifications')}
          title="Notifications"
          className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
        </button>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onNewExpense?.()}
          icon={Plus}
          className="hidden sm:inline-flex"
        >
          New Expense
        </Button>
      </div>
    </header>
  );
}
