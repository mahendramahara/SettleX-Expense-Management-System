import React from 'react';
import { ShieldCheck, Check, Lock } from 'lucide-react';

export default function AdminPrivilegesCard({ profile = {} }) {
  const isSuperAdmin = profile?.role === 'superadmin';

  const allPrivileges = [
    {
      key: 'users:read',
      label: 'Inspect Global User Ledgers',
      desc: 'Read and query user directories',
    },
    {
      key: 'users:manage',
      label: 'Modify & Suspend Accounts',
      desc: 'Manage access and account restrictions',
    },
    {
      key: 'groups:read',
      label: 'Audit Expense Circles',
      desc: 'Examine group structures and balances',
    },
    {
      key: 'settlements:audit',
      label: 'Financial Settlement Review',
      desc: 'Approve and monitor debt settlements',
    },
    {
      key: 'algorithms:benchmark',
      label: 'Algorithmic Optimization',
      desc: 'Execute graph cycle reductions',
    },
    {
      key: 'anomalies:supervise',
      label: 'Anomaly & Fraud Heuristics',
      desc: 'Issue automated overspending advisories',
    },
    {
      key: 'admins:manage',
      label: 'Staff & Role Delegation',
      desc: 'Grant role permissions to moderators',
      superAdminOnly: true,
    },
    {
      key: 'system:settings',
      label: 'Platform Kernel Governance',
      desc: 'Modify base currencies and maintenance mode',
      superAdminOnly: true,
    },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            Administrative RBAC Clearance & Privileges
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
            Granular access scopes enforced by security middleware for this role
          </p>
        </div>
      </div>

      {/* Privileges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {allPrivileges.map((priv) => {
          const isGranted = isSuperAdmin || !priv.superAdminOnly;
          return (
            <div
              key={priv.key}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                isGranted
                  ? 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80'
                  : 'bg-slate-50/30 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800/40 opacity-55'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  isGranted
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400'
                    : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                }`}
              >
                {isGranted ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs truncate leading-tight">
                  {priv.label}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate mt-0.5 leading-tight">
                  {priv.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
