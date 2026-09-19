import React, { useState, useEffect } from 'react';
import { X, RotateCw, Users } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';
import { userService } from '../../../services/user.service';

export function UserConnectedGroupsModal({ user, onClose }) {
  const [connectedGroups, setConnectedGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        setIsLoading(true);
        const res = await userService.getUserConnectedGroups(user.id);
        const list = res?.data?.groups || res?.groups || [];
        setConnectedGroups(Array.isArray(list) ? list : []);
      } catch {
        setConnectedGroups([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.id) {
      fetchUserGroups();
    }
  }, [user]);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0e172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || 'User'} size="md" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {user?.name} - Connected Circles
              </h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">
              <RotateCw className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
              <span>Analyzing user connectivity across circles...</span>
            </div>
          ) : connectedGroups.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <span className="font-bold text-slate-700 dark:text-slate-300 block text-sm">
                No connected circles found
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                This user is not currently a member of any platform groups.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Connected to{' '}
                <strong className="text-slate-900 dark:text-white">{connectedGroups.length}</strong>{' '}
                circles:
              </div>

              {connectedGroups.map((grp) => {
                const stats = grp.userStats || {};
                const isPositive = (stats.netBalancePaisa || 0) >= 0;

                return (
                  <div
                    key={grp.id}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                            {grp.name}
                          </h4>
                          {grp.isCreator && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                              Creator
                            </span>
                          )}
                        </div>
                        {grp.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {grp.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                        {grp.memberCount} members
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-white dark:bg-[#0e172a] border border-slate-200/70 dark:border-slate-800/70 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Total Paid Out</span>
                        <span className="font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                          {stats.totalPaidFormatted || 'Rs. 0'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Share Owed</span>
                        <span className="font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                          {stats.totalOwedFormatted || 'Rs. 0'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Net Balance</span>
                        <span
                          className={`font-bold mt-0.5 block truncate ${
                            isPositive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {stats.netBalanceFormatted || 'Rs. 0'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
