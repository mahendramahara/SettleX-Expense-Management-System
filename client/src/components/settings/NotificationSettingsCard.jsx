import React, { useState } from 'react';
import { Bell, Mail, Smartphone, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function NotificationSettingsCard() {
  const { isGuest } = useAuth();
  const toast = useToast();

  const [emailExpenses, setEmailExpenses] = useState(true);
  const [emailSettlements, setEmailSettlements] = useState(true);
  const [pushReminders, setPushReminders] = useState(false);
  const [groupInvites, setGroupInvites] = useState(true);

  const handleToggle = (setter, currentVal, label) => {
    if (isGuest) {
      toast.warning('Please log in to change notification settings.');
      return;
    }
    setter(!currentVal);
    toast.info(`${label} ${!currentVal ? 'enabled' : 'disabled'}`);
  };

  const toggles = [
    {
      title: 'Shared Expense Entries',
      description: 'Receive notifications when a member logs an expense that includes you',
      state: emailExpenses,
      setter: setEmailExpenses,
      icon: Mail,
    },
    {
      title: 'Settlement Payments',
      description: 'Get notified when someone marks a debt as settled or records a payment',
      state: emailSettlements,
      setter: setEmailSettlements,
      icon: ShieldCheck,
    },
    {
      title: 'Group Invitations',
      description: 'Alerts when you are added to a new friends or roommates expense group',
      state: groupInvites,
      setter: setGroupInvites,
      icon: Bell,
    },
    {
      title: 'Browser Push Notifications',
      description: 'Real-time desktop alerts when transactions affect your balance standing',
      state: pushReminders,
      setter: setPushReminders,
      icon: Smartphone,
    },
  ];

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notification Rules</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Channel Delivery</span>
      </div>

      <div className="space-y-3">
        {toggles.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate sm:whitespace-normal">
                    {item.description}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => item.setter(!item.state)}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
                  item.state ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                    item.state ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
