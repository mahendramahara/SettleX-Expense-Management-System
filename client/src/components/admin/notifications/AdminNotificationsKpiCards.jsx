import React from 'react';
import { Bell, ShieldAlert, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AdminNotificationsKpiCards({
  summary = {},
  activeCategory,
  onSelectCategory,
}) {
  const cards = [
    {
      id: 'all',
      title: 'Total Active Alerts',
      count: summary.total || 0,
      subtext: `${summary.unread || 0} unread requiring review`,
      icon: Bell,
      color: 'blue',
      highlightUnread: Boolean(summary.unread),
    },
    {
      id: 'security',
      title: 'Security Incidents',
      count: summary.security || 0,
      subtext: summary.critical
        ? `${summary.critical} critical threats`
        : 'All perimeter checks safe',
      icon: ShieldAlert,
      color: summary.critical ? 'rose' : 'purple',
    },
    {
      id: 'financial',
      title: 'Financial Clearings',
      count: summary.financial || 0,
      subtext: 'High-value splits & payouts',
      icon: Scale,
      color: 'emerald',
    },
    {
      id: 'anomaly',
      title: 'Anomaly Triggers',
      count: summary.anomaly || 0,
      subtext: 'Statistical outliers flagged',
      icon: AlertTriangle,
      color: 'amber',
    },
  ];

  const getColorClasses = (color, isSelected) => {
    if (isSelected) {
      return 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50/50 dark:bg-blue-950/20';
    }
    switch (color) {
      case 'rose':
        return 'hover:border-rose-300 dark:hover:border-rose-800';
      case 'purple':
        return 'hover:border-purple-300 dark:hover:border-purple-800';
      case 'emerald':
        return 'hover:border-emerald-300 dark:hover:border-emerald-800';
      case 'amber':
        return 'hover:border-amber-300 dark:hover:border-amber-800';
      default:
        return 'hover:border-blue-300 dark:hover:border-blue-800';
    }
  };

  const getIconBg = (color) => {
    switch (color) {
      case 'rose':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
      case 'purple':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'amber':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeCategory === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectCategory?.(card.id)}
            className={`p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs text-left transition-all cursor-pointer ${getColorClasses(
              card.color,
              isSelected
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${getIconBg(card.color)}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              {card.highlightUnread && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
              )}
            </div>

            <div className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {card.count}
            </div>

            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mt-0.5">
              {card.title}
            </div>

            <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
              {card.subtext}
            </div>
          </button>
        );
      })}
    </div>
  );
}
