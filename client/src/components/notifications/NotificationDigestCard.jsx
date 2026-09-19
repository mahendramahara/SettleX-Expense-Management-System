import React, { useState } from 'react';
import { ShieldCheck, BellOff, Volume2, Mail, Smartphone, Sliders } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function NotificationDigestCard({ unreadCount = 0, onClearRead }) {
  const toast = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [digestFreq, setDigestFreq] = useState('realtime');

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(!isMuted ? 'Notifications muted for 24 hours' : 'Notification alerts unmuted');
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Delivery & Digest Rules
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Quick Controls</span>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {isMuted ? <BellOff className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Do Not Disturb</div>
            <div className="text-[10px] text-slate-400">
              {isMuted ? 'Muted until tomorrow morning' : 'Sound & banner alerts active'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleMute}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            isMuted
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
          }`}
        >
          {isMuted ? 'Muted' : 'Mute 24h'}
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          Dispatch Frequency
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'realtime', label: 'Real-time' },
            { id: 'daily', label: 'Daily Brief' },
            { id: 'weekly', label: 'Weekly' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setDigestFreq(f.id);
                toast.info(`Alert frequency set to ${f.label}`);
              }}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                digestFreq === f.id
                  ? 'border-primary bg-primary/10 text-primary shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">
          {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
        </span>
        {onClearRead && (
          <button
            type="button"
            onClick={onClearRead}
            className="text-primary hover:underline font-bold cursor-pointer"
          >
            Clear read items
          </button>
        )}
      </div>
    </div>
  );
}
