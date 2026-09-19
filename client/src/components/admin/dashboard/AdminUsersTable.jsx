import React from 'react';
import { ShieldCheck, ShieldAlert, Ban, CheckCircle, Search } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export function AdminUsersTable({ users = [], searchTerm = '', onSearchChange, onToggleSuspend }) {
  const filtered = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            User Accounts Management ({filtered.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit platform members, roles, permissions, and status
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full pl-10 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <th className="pb-3 px-3">User</th>
              <th className="pb-3 px-3">Role</th>
              <th className="pb-3 px-3">Tier</th>
              <th className="pb-3 px-3">Verification</th>
              <th className="pb-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {filtered.map((user) => (
              <tr
                key={user.id || user._id}
                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={user.name || 'User'} size="sm" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                      <div className="text-[11px] text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                    {user.role || 'user'}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
                    {user.tier || 'student'}
                  </span>
                </td>
                <td className="py-3 px-3">
                  {user.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Unverified
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-right">
                  {onToggleSuspend && (
                    <button
                      type="button"
                      onClick={() => onToggleSuspend(user)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        user.isSuspended
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 hover:bg-rose-100'
                      }`}
                    >
                      {user.isSuspended ? 'Reactivate' : 'Suspend'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
