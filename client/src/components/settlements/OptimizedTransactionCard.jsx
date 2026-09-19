import React from 'react';
import { ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

export function OptimizedTransactionCard({ transaction, currentUserId, onRecordPayment }) {
  const fromId = transaction.fromUserId || transaction.from;
  const toId = transaction.toUserId || transaction.to;

  const isFromMe = String(fromId) === String(currentUserId);
  const isToMe = String(toId) === String(currentUserId);

  const fromName = transaction.fromName || 'Member';
  const toName = transaction.toName || 'Member';

  const amountRs = ((transaction.amountPaisa || 0) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={fromName} size="sm" />
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {fromName}
            </div>
            <div className="text-[10px] text-slate-400">{isFromMe ? 'You (Payer)' : 'Debtor'}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
          <ArrowRight className="w-3.5 h-3.5 text-primary" />
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <Avatar name={toName} size="sm" />
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {toName}
            </div>
            <div className="text-[10px] text-slate-400">
              {isToMe ? 'You (Recipient)' : 'Creditor'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60">
        <div className="text-left sm:text-right">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Transfer
          </div>
          <div className="text-sm sm:text-base font-extrabold text-primary tracking-tight">
            Rs. {amountRs}
          </div>
        </div>

        {onRecordPayment && (
          <button
            type="button"
            onClick={() => onRecordPayment(transaction)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Settle
          </button>
        )}
      </div>
    </div>
  );
}
