import React from 'react';
import { Eye, ArrowRight, FolderKanban, Scale, CheckCircle2, X, Sparkles } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export function SettlementDetailsModal({ settlement, onClose, onSettleNow, canRecord = true }) {
  if (!settlement) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Settlement Obligation Audit
              </h2>
              <p className="text-xs text-slate-400">{settlement.groupName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Amount Hero */}
          <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Calculated Debt Amount
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
              {settlement.amountFormatted}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">
              Status: <span className="font-semibold text-amber-500">Unsettled</span>
            </span>
          </div>

          {/* Transfer Flow */}
          <div className="grid grid-cols-2 gap-3 items-center">
            {/* Debtor */}
            <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/40">
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-2">
                Payer / Debtor
              </span>
              <div className="flex items-center gap-2">
                <Avatar name={settlement.from.name || 'Member'} className="w-7 h-7 text-xs" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {settlement.from.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{settlement.from.email}</p>
                </div>
              </div>
            </div>

            {/* Creditor */}
            <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-2">
                Recipient / Creditor
              </span>
              <div className="flex items-center gap-2">
                <Avatar name={settlement.to.name || 'Member'} className="w-7 h-7 text-xs" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {settlement.to.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{settlement.to.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Algorithmic info */}
          <div className="p-3.5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-0.5">
                Optimized by SettleX Graph Engine
              </span>
              This settlement transaction represents the minimum cash transfer required after
              cancelling multi-party debt cycles within {settlement.groupName}.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            Dismiss
          </button>

          {canRecord && (
            <button
              onClick={() => {
                onClose();
                onSettleNow?.(settlement);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Settle Up This Debt</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
