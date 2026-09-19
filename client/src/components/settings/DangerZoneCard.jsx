import React, { useState } from 'react';
import { AlertTriangle, Trash2, RotateCcw } from 'lucide-react';
import { userService } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function DangerZoneCard() {
  const { isGuest, logout } = useAuth();
  const toast = useToast();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await userService.deleteAccount();
      if (res?.success) {
        toast.success('Your account has been deleted successfully');
        logout();
      } else {
        toast.error(res?.message || 'Failed to delete account');
      }
    } catch (err) {
      toast.error(err?.message || 'Error deleting account');
    } finally {
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-950 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400">Danger Zone</h3>
        </div>
        <span className="text-xs text-rose-400 font-medium">Irreversible Operations</span>
      </div>

      <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">
            Delete SettleX Account
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Permanently remove your account credentials, profile details, and authentication tokens.
          </div>
        </div>

        {isConfirming ? (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsConfirming(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (isGuest) {
                toast.warning('Please log in to delete your account.');
                return;
              }
              setIsConfirming(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        )}
      </div>
    </div>
  );
}
