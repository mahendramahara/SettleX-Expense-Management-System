import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function MainLayout({
  activeTab,
  onTabChange,
  isMobileOpen,
  onCloseMobile,
  onToggleMobileMenu,
  onNewExpense,
  user,
  onOpenOtp,
  children,
  unreadCount = 0,
}) {
  const { isSwitchedToMember } = useAuth();
  const isUnverified =
    !isSwitchedToMember &&
    !user?.isVerified &&
    !user?.isAdmin &&
    !['superadmin', 'admin', 'moderator'].includes(user?.role);

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-[#080e1a] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        isMobileOpen={isMobileOpen}
        onCloseMobile={onCloseMobile}
        unreadCount={unreadCount}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 w-full max-w-[1600px] mx-auto">
          <Header
            onToggleMobileMenu={onToggleMobileMenu}
            onNewExpense={onNewExpense}
            onNavigateAdmin={() => onTabChange?.('admin')}
            onNavigateTab={onTabChange}
          />

          {isSwitchedToMember && (
            <div className="mb-4 px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/80 dark:bg-blue-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>
                  <strong>Member Preview Active:</strong> Exploring SettleX from a member's view with demo data from <code className="font-mono text-blue-700 dark:text-blue-300">user-demo.json</code>.
                </span>
              </div>
              <button
                type="button"
                onClick={() => onTabChange?.('admin')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0 cursor-pointer shadow-xs"
              >
                Return to Admin Console
              </button>
            </div>
          )}

          {isUnverified && (
            <div className="mb-6 p-4 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Account Verification Required
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Your account is currently unverified. Group creation, expense entries, and debt
                    settlements are paused until your email is verified.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onOpenOtp(user?.email || '')}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-colors shrink-0 cursor-pointer shadow-sm"
              >
                Verify Now
              </button>
            </div>
          )}

          {children || <Outlet />}
        </main>

        <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 dark:text-slate-400">
          <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>SettleX Intelligent Debt Settlement — BCA 8th Semester</div>
            <div>Greedy Cash Flow • Cycle Cancellation Engine</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
