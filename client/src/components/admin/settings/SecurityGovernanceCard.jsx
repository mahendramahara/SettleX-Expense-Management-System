import React from 'react';
import { ShieldCheck, Lock, Clock, UserCheck, ShieldAlert } from 'lucide-react';

export default function SecurityGovernanceCard({ security = {}, onChange, canEdit = true }) {
  const updateSecurity = (field, value) => {
    onChange({
      security: {
        ...security,
        [field]: value,
      },
    });
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Security & Authentication Policies
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Enforce staff credential mandates, session lifetimes, and brute-force defenses
          </p>
        </div>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Enforce 2FA Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">
              Enforce Two-Factor Authentication (2FA)
            </span>
            <span className="text-[11px] text-slate-400 block">
              Require time-based one-time password challenge on staff logins
            </span>
          </div>
          <button
            type="button"
            onClick={() => updateSecurity('enforceTwoFactor', !security.enforceTwoFactor)}
            disabled={!canEdit}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer disabled:opacity-50 ${
              security.enforceTwoFactor ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform transform shadow-sm ${
                security.enforceTwoFactor ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Allow Public Registration Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">
              Allow Open User Registration
            </span>
            <span className="text-[11px] text-slate-400 block">
              Permit public signups without prior administrative invite
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              updateSecurity('allowPublicRegistration', !security.allowPublicRegistration)
            }
            disabled={!canEdit}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer disabled:opacity-50 ${
              security.allowPublicRegistration ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform transform shadow-sm ${
                security.allowPublicRegistration ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Session Lifetime
            </label>
            <select
              value={security.sessionTimeoutHours || 24}
              onChange={(e) => updateSecurity('sessionTimeoutHours', Number(e.target.value))}
              disabled={!canEdit}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 cursor-pointer"
            >
              <option value={1}>1 Hour (High Security)</option>
              <option value={8}>8 Hours (Workday)</option>
              <option value={24}>24 Hours (Standard)</option>
              <option value={168}>7 Days (Extended)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Max Failed Logins
            </label>
            <select
              value={security.maxFailedAttempts || 5}
              onChange={(e) => updateSecurity('maxFailedAttempts', Number(e.target.value))}
              disabled={!canEdit}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 cursor-pointer"
            >
              <option value={3}>3 Attempts (Strict)</option>
              <option value={5}>5 Attempts (Balanced)</option>
              <option value={10}>10 Attempts (Relaxed)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Audit Log Retention
            </label>
            <select
              value={security.auditLogRetentionDays || 90}
              onChange={(e) => updateSecurity('auditLogRetentionDays', Number(e.target.value))}
              disabled={!canEdit}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 cursor-pointer"
            >
              <option value={30}>30 Days</option>
              <option value={90}>90 Days (Recommended)</option>
              <option value={365}>365 Days (Annual)</option>
              <option value={0}>Indefinite Retention</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
