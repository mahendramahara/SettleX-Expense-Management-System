import React from 'react';
import { ShieldAlert, Scale, Receipt, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function ActionableAlertsCard({ user, onNavigateTab, onOpenOtp }) {
  const { isGuest } = useAuth();
  const toast = useToast();

  const alerts = [
    {
      id: 'settle-alert',
      title: 'Pending Settlement Due',
      description: 'You owe Aarav Gurung in Pokhara Trip. Settle early to clear group ledger.',
      actionLabel: 'Settle Now',
      actionTab: 'settlements',
      badge: 'High Priority',
      badgeColor: 'rose',
      icon: Scale,
    },
    {
      id: 'expense-audit',
      title: 'Recent Expense Split',
      description: 'Check itemized paisa split for "Lakeside Dinner" in Pokhara Trip.',
      actionLabel: 'Inspect Details',
      actionTab: 'expenses',
      badge: 'Audit',
      badgeColor: 'blue',
      icon: Receipt,
    },
  ];

  if (!isGuest && user && !user.isVerified) {
    alerts.unshift({
      id: 'verify-alert',
      title: 'Email Confirmation Required',
      description: 'Your account email is unverified. Complete OTP check to unlock full features.',
      actionLabel: 'Verify Now',
      isOtpAction: true,
      badge: 'Action Needed',
      badgeColor: 'amber',
      icon: ShieldAlert,
    });
  }

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Action Items</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Pending Tasks</span>
      </div>

      <div className="space-y-3">
        {alerts.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    item.badgeColor === 'rose'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      : item.badgeColor === 'amber'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {item.badge}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (item.isOtpAction) {
                      if (isGuest) {
                        toast.warning('Please log in to verify your email.');
                        return;
                      }
                      onOpenOtp?.(user?.email || '');
                    } else if (item.actionTab) {
                      onNavigateTab?.(item.actionTab);
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
