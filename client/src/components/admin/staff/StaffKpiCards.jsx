import React from 'react';
import { ShieldCheck, Shield, UserCheck, ShieldAlert } from 'lucide-react';

export default function StaffKpiCards({ staff = [] }) {
  const total = staff.length;
  const superadmins = staff.filter((s) => s.role === 'superadmin').length;
  const active = staff.filter((s) => s.isActive !== false).length;
  const moderators = staff.filter((s) => s.role === 'moderator').length;

  const cards = [
    {
      label: 'Total Staff Accounts',
      value: total,
      subtext: 'Registered operators',
      icon: ShieldCheck,
      bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Root SuperAdmins',
      value: superadmins,
      subtext: 'Unrestricted clearance',
      icon: Shield,
      bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Active Operators',
      value: active,
      subtext: 'Live dashboard access',
      icon: UserCheck,
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Moderator Staff',
      value: moderators,
      subtext: 'Restricted scopes',
      icon: ShieldAlert,
      bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.bg}`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                {card.label}
              </span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {card.value}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">{card.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
