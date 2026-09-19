import React, { useState } from 'react';
import { Bell, Receipt, Scale, Users, ShieldAlert, CheckCheck, Trash2, Filter } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export function NotificationsList({ notifications = [], onMarkAllRead, onDismiss }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'expense':
        return <Receipt className="w-4 h-4 text-primary" />;
      case 'settlement':
        return <Scale className="w-4 h-4 text-violet-500" />;
      case 'group':
        return <Users className="w-4 h-4 text-emerald-500" />;
      case 'security':
      default:
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  const categories = [
    { id: 'all', label: 'All Alerts' },
    { id: 'expense', label: 'Expenses' },
    { id: 'settlement', label: 'Settlements' },
    { id: 'group', label: 'Groups' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Activity Feed ({filtered.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((c) => {
          const isActive = activeFilter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveFilter(c.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400">
          No notifications found in this category.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              className={`py-3.5 flex items-start justify-between gap-3.5 transition-colors ${
                !notif.read ? 'bg-primary/5 dark:bg-primary/10 -mx-5 px-5 rounded-xl' : ''
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 shrink-0">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {notif.description}
                  </p>
                </div>
              </div>

              {onDismiss && (
                <button
                  type="button"
                  onClick={() => onDismiss(notif.id)}
                  title="Dismiss notification"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
