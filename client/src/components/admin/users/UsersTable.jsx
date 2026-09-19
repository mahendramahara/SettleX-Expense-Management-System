import React from 'react';
import {
  Users,
  Pencil,
  Trash2,
  Ban,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export default function UsersTable({
  users = [],
  isLoading = false,
  pagination = {},
  onPageChange,
  canUpdate = false,
  canSuspend = false,
  canDelete = false,
  onEditUser,
  onSuspendUser,
  onDeleteUser,
}) {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="pb-3 px-3">User Profile</th>
              <th className="pb-3 px-3">Contact</th>
              <th className="pb-3 px-3">Role & Tier</th>
              <th className="pb-3 px-3">Status</th>
              <th className="pb-3 px-3">Joined Date</th>
              <th className="pb-3 px-3 text-right">Privileged Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <RotateCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                  <span>Loading directory records...</span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block text-sm">
                    No users found
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Try adjusting your search criteria or register a new user.
                  </p>
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSuspended = u.isSuspended;
                return (
                  <tr
                    key={u.id || u._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name || 'User'} size="sm" />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white block truncate">
                            {u.name}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{u.email}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {u.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{u.phone}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not provided</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                          {u.role || 'user'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase">
                          {u.tier || 'free'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {isSuspended ? (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40"
                          title={u.suspensionReason ? `Reason: ${u.suspensionReason}` : 'Suspended'}
                        >
                          <Ban className="w-3 h-3" />
                          <span>Suspended</span>
                        </span>
                      ) : u.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                          <AlertCircle className="w-3 h-3" />
                          <span>Unverified</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Recent'}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditUser?.(u)}
                          disabled={!canUpdate}
                          title={canUpdate ? 'Edit User' : 'Missing users:update privilege'}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onSuspendUser?.(u)}
                          disabled={!canSuspend}
                          title={
                            canSuspend
                              ? isSuspended
                                ? 'Reactivate Account'
                                : 'Suspend Account'
                              : 'Missing users:suspend privilege'
                          }
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                            isSuspended
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                              : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                          }`}
                        >
                          {isSuspended ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteUser?.(u)}
                          disabled={!canDelete}
                          title={canDelete ? 'Delete User' : 'Missing users:delete privilege'}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange?.(Math.max(1, (pagination.page || 1) - 1))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                onPageChange?.(Math.min(pagination.totalPages, (pagination.page || 1) + 1))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
