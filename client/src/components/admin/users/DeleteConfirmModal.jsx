import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({ user, onClose, onConfirm }) {
  const [confirmText, setConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onConfirm();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0e172a] rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">
                Permanently Delete User
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Target: <strong className="text-slate-800 dark:text-slate-200">{user.name}</strong>
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
            Warning: This action will permanently erase the user account, associated authentication
            credentials, and audit logs. This cannot be undone.
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Type <span className="font-mono font-bold text-rose-600">{user.email}</span> to
              confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Confirm email address..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={
                isSubmitting || confirmText.trim().toLowerCase() !== user.email.toLowerCase()
              }
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Deleting...' : 'Permanently Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
