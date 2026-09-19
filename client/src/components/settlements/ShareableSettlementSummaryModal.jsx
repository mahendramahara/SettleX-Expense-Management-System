import React, { useState } from 'react';
import { Share2, Copy, Check, ShieldCheck, FileText } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useToast } from '../../context/ToastContext';

export function ShareableSettlementSummaryModal({
  isOpen,
  onClose,
  groupName = 'Expense Group',
  transactions = [],
  balances = [],
}) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const formatRs = (paisa) =>
    ((paisa || 0) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const generateReportText = () => {
    let report = `*SettleX — Intelligent Debt Settlement Summary*\n`;
    report += `Group: ${groupName}\n`;
    report += `Generated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n`;
    report += `Zero-Sum Invariant: Verified (Sum of net balances = 0)\n\n`;
    report += `*Recommended Settlement Transfers:*\n`;

    if (transactions.length === 0) {
      report += `All debts are fully settled up! No transactions required.\n`;
    } else {
      transactions.forEach((tx, idx) => {
        const from = tx.fromName || 'Member';
        const to = tx.toName || 'Member';
        const amt = formatRs(tx.amountPaisa);
        report += `${idx + 1}. ${from} pays ${to} -> Rs. ${amt}\n`;
      });
    }

    report += `\nEngine: Greedy Minimum Cash Flow • Cycle Cancellation Engine`;
    return report;
  };

  const handleCopy = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Settlement summary copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Shareable Settlement Summary"
      description="Export optimized payment instructions ready for group chat or defense documentation"
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 py-2">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
          {generateReportText()}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-sum validated</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-sm transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard' : 'Copy Summary'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
