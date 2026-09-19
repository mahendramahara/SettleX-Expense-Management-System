import React from 'react';
import {
  User,
  Mail,
  Phone,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Globe,
} from 'lucide-react';

export function ProfileOverviewCard({ user }) {
  const infoItems = [
    {
      label: 'Full Name',
      value: user?.name || 'Not provided',
      icon: User,
    },
    {
      label: 'Email Address',
      value: user?.email || 'Not provided',
      icon: Mail,
      badge: user?.isVerified ? 'Verified' : 'Unverified',
      badgeColor: user?.isVerified ? 'emerald' : 'amber',
    },
    {
      label: 'Phone Number',
      value: user?.phoneNumber || 'Not provided',
      icon: Phone,
    },
    {
      label: 'Primary Currency',
      value: user?.currencyPreference || 'NPR (Nepalese Rupee)',
      icon: DollarSign,
    },
    {
      label: 'Account Tier',
      value: (user?.tier || 'Student').toUpperCase(),
      icon: ShieldCheck,
    },
    {
      label: 'Authentication Method',
      value: user?.authProvider === 'google' ? 'Google OAuth 2.0' : 'Email & Encrypted Password',
      icon: KeyRound,
    },
  ];

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personal Information</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Account Details</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {infoItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {item.label}
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate mt-0.5">
                  {item.value}
                </div>
                {item.badge && (
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor === 'emerald'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
