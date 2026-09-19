import React, { useState } from 'react';
import { Ban, CheckCircle2 } from 'lucide-react';

export default function SuspendConfirmModal({ user, onClose, onConfirm }) {
  const isSuspended = user.isSuspended;
  const [reason, setReason] = useState(user.suspensionReason || 'Terms of Service Violation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onConfirm(reason);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0e172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isSuspended
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              }`}
            >
              {isSuspended ? <CheckCircle2 className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isSuspended ? 'Reactivate Account' : 'Suspend Account'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Target: <strong className="text-slate-800 dark:text-slate-200">{user.name}</strong>{' '}
                ({user.email})
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {isSuspended
              ? 'Reactivating this account will restore full user login, group access, and transaction capabilities immediately.'
              : 'Suspending this account will revoke platform access and prevent all financial settlements until manually restored.'}
          </p>

          {!isSuspended && (
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Suspension Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer mb-2"
              >
                <option value="Terms of Service Violation">Terms of Service Violation</option>
                <option value="Suspicious Financial Activity">Suspicious Financial Activity</option>
                <option value="Payment Default in Group Settlement">
                  Payment Default in Group Settlement
                </option>
                <option value="Administrative Review">Administrative Review</option>
                <option value="Spam / Abuse Report">Spam / Abuse Report</option>
              </select>
            </div>
          )}

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
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-opacity cursor-pointer disabled:opacity-50 ${
                isSuspended
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isSubmitting
                ? 'Processing...'
                : isSuspended
                  ? 'Confirm Reactivate'
                  : 'Confirm Suspension'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
