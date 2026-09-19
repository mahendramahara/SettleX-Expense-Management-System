import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, Wallet, Landmark, Banknote } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';

export function RecordPaymentModal({
  isOpen,
  onClose,
  transaction,
  onConfirmPayment,
  isSubmitting,
}) {
  const [paymentMethod, setPaymentMethod] = useState('eSewa');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNotes('');
      setPaymentMethod('eSewa');
    }
  }, [isOpen]);

  if (!transaction) return null;

  const fromName = transaction.fromName || 'Debtor';
  const toName = transaction.toName || 'Creditor';
  const amountRs = ((transaction.amountPaisa || 0) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmPayment?.({
      fromUserId: transaction.fromUserId || transaction.from,
      toUserId: transaction.toUserId || transaction.to,
      amountPaisa: transaction.amountPaisa,
      paymentMethod,
      notes,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Settlement Payment"
      description="Mark this debt transaction as paid and update group ledger"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="text-center">
              <Avatar name={fromName} size="md" className="mx-auto" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                {fromName}
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-primary" />

            <div className="text-center">
              <Avatar name={toName} size="md" className="mx-auto" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                {toName}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
            <div className="text-xs text-slate-400 font-semibold uppercase">Settlement Sum</div>
            <div className="text-2xl font-black text-primary tracking-tight">Rs. {amountRs}</div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Payment Channel
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'eSewa', label: 'eSewa Digital', icon: Wallet },
              { id: 'Khalti', label: 'Khalti Wallet', icon: Wallet },
              { id: 'Bank Transfer', label: 'Bank Transfer', icon: Landmark },
              { id: 'Cash', label: 'Cash in Hand', icon: Banknote },
            ].map((method) => {
              const Icon = method.icon;
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Notes / Reference ID (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. eSewa Txn #482910 or cash settled at cafe"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSubmitting ? 'Recording...' : 'Confirm Settlement'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
