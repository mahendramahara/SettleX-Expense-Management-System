import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

export function DeleteExpenseModal({ expense, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Expense Record?</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          Are you sure you want to permanently remove{' '}
          <strong className="text-slate-800 dark:text-slate-200">"{expense?.title}"</strong> (
          {expense?.amountFormatted})? This action will immediately recalculate group debt balances
          and log an administrative audit entry.
        </p>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-opacity cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
