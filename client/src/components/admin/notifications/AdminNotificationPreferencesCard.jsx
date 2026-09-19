import React, { useState } from 'react';
import { Sliders, Volume2, BellOff, ShieldCheck, Trash2, RotateCcw, Sparkles } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export default function AdminNotificationPreferencesCard({ unreadCount = 0, onClearRead }) {
  const toast = useToast();
  const [isDndActive, setIsDndActive] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [highRiskInstant, setHighRiskInstant] = useState(true);

  const toggleDnd = () => {
    setIsDndActive((prev) => {
      const next = !prev;
      toast.info(
        next
          ? 'Do Not Disturb active: Audio & banner alerts suppressed.'
          : 'Do Not Disturb disabled: Real-time alerts resumed.'
      );
      return next;
    });
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Delivery & Sound Preferences
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Configure telemetry triggers, sound chimes, and cleanup rules
          </p>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        {/* Do Not Disturb Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="pr-3">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              {isDndActive ? (
                <BellOff className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-blue-500" />
              )}
              <span>Do Not Disturb</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              {isDndActive ? 'Desktop popups muted' : 'Real-time chimes active'}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleDnd}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDndActive
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {isDndActive ? 'Muted' : 'Mute'}
          </button>
        </div>

        {/* High Risk Alerts */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="pr-3">
            <span className="font-bold text-slate-900 dark:text-white block">
              High-Risk Instant Push
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Immediate alert on auth attacks or severe ledger deviations
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={highRiskInstant}
              onChange={(e) => {
                setHighRiskInstant(e.target.checked);
                toast.info(`High-risk instant alerts ${e.target.checked ? 'enabled' : 'disabled'}`);
              }}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Cleanup Read Notifications */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">
            {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
          </span>

          {onClearRead && (
            <button
              type="button"
              onClick={onClearRead}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Read Items</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
