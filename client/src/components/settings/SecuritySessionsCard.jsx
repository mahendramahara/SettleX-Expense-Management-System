import React from 'react';
import { Laptop, ShieldCheck, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function SecuritySessionsCard() {
  const { user } = useAuth();

  const userAgent = navigator.userAgent;
  const isWindows = userAgent.includes('Windows');
  const isMac = userAgent.includes('Mac');
  const osName = isWindows ? 'Windows' : isMac ? 'macOS' : 'Linux';

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Laptop className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Active Device & Security Session
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Authentication Audit</span>
      </div>

      <div className="space-y-3">
        <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{osName} Desktop Browser</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                  Current Active
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Last activity: Just now • Secured via JWT bearer token
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="text-[11px] font-bold text-slate-400 uppercase">
              Verification Status
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
              {user?.isVerified ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Email Confirmed</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pending Email Verification</span>
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Account Provider</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 capitalize flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-primary" />
              <span>
                {user?.authProvider === 'google' ? 'Google OAuth 2.0' : 'SettleX Local DB'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
