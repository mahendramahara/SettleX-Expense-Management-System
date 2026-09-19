import React from 'react';
import { RotateCw, CheckCircle2, Ban } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export default function StaffTable({
  staff = [],
  isLoading = false,
  currentAdminId,
  isSuperAdmin = false,
  onRoleChange,
  onEditPermissions,
  onToggleStatus,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <th className="pb-3 px-3">Administrator</th>
            <th className="pb-3 px-3">Role Tier</th>
            <th className="pb-3 px-3">Assigned Permissions</th>
            <th className="pb-3 px-3">Status</th>
            <th className="pb-3 px-3 text-right">Privilege Controls</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
          {isLoading ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-400">
                <RotateCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                <span>Loading staff members...</span>
              </td>
            </tr>
          ) : staff.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-300 block text-sm">
                  No staff accounts found
                </span>
              </td>
            </tr>
          ) : (
            staff.map((member) => {
              const isCurrent = member.id === currentAdminId;
              const perms = member.permissions || [];
              const isRoot = member.role === 'superadmin';

              return (
                <tr
                  key={member.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name || 'Admin'} size="sm" />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                              You
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    {isSuperAdmin && !isRoot ? (
                      <select
                        value={member.role}
                        onChange={(e) => onRoleChange?.(member.id, e.target.value)}
                        className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold capitalize text-slate-800 dark:text-slate-200 cursor-pointer focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="admin">Admin</option>
                        <option value="moderator">Moderator</option>
                        <option value="superadmin">SuperAdmin</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          isRoot
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                            : member.role === 'admin'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {member.role}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {isRoot || perms.includes('*') ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                          * (Root Access)
                        </span>
                      ) : perms.length === 0 ? (
                        <span className="text-[11px] text-slate-400">None</span>
                      ) : (
                        perms.slice(0, 3).map((p) => (
                          <span
                            key={p}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {p}
                          </span>
                        ))
                      )}
                      {!isRoot && perms.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                          +{perms.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    {member.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                        <Ban className="w-3 h-3" />
                        <span>Disabled</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    {isSuperAdmin && !isRoot ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditPermissions?.(member)}
                          title="Edit Permissions"
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          Permissions
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleStatus?.(member)}
                          title={member.isActive ? 'Deactivate' : 'Activate'}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            member.isActive
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 hover:bg-emerald-100'
                          }`}
                        >
                          {member.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Protected</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
