import React, { useState, useEffect } from 'react';
import { X, Send, Mail, ShieldAlert, Sparkles, CheckCircle2, MessageSquare } from 'lucide-react';

export default function SendAdvisoryModal({
  anomaly,
  isOpen,
  onClose,
  onSendAdvisory,
  isSending = false,
}) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [anomalyType, setAnomalyType] = useState('CROSS_GROUP_HIGH_SPENDER');

  useEffect(() => {
    if (anomaly) {
      setSubject(
        anomaly.advisorySubject ||
          `SettleX Financial Advisory: Disproportionate Cross-Group Spending Alert`
      );
      setMessage(anomaly.advisoryDraft || '');
      setAnomalyType(
        anomaly.dominantCount >= 2
          ? 'CROSS_GROUP_DOMINANT_PAYER'
          : anomaly.overspendRatio >= 2.0
            ? 'CROSS_GROUP_HIGH_SPENDER'
            : 'ASYMMETRIC_CONTRIBUTOR'
      );
    }
  }, [anomaly]);

  if (!isOpen || !anomaly) return null;

  const u = anomaly.user || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    onSendAdvisory({
      userId: u.id || u._id,
      subject: subject.trim(),
      message: message.trim(),
      anomalyType,
      metrics: {
        totalPaidFormatted: anomaly.totalPaidFormatted,
        overspendFormatted: anomaly.overspendFormatted,
        overspendRatio: anomaly.overspendRatio,
        dominantCount: anomaly.dominantCount,
        zScore: anomaly.zScore,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Dispatch Spending Advisory Notice
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                To:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{u.name}</span> (
                {u.email})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Quick Context Summary */}
            <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Total Fronted: </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {anomaly.totalPaidFormatted}
                </span>
                <span className="text-slate-400 mx-2">&bull;</span>
                <span className="text-slate-500 dark:text-slate-400">Excess vs Peer Mean: </span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  +{anomaly.overspendFormatted} ({anomaly.overspendRatio}x)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                {anomaly.severity}
              </span>
            </div>

            {/* Advisory Type Classification */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Advisory Category
              </label>
              <select
                value={anomalyType}
                onChange={(e) => setAnomalyType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CROSS_GROUP_HIGH_SPENDER">
                  Cross-Group High Spender (General Disproportion)
                </option>
                <option value="CROSS_GROUP_DOMINANT_PAYER">
                  Cross-Group Dominant Payer (&ge;50% volume in multiple circles)
                </option>
                <option value="ASYMMETRIC_CONTRIBUTOR">
                  Asymmetric Contributor (Liquidity Risk & Unsettled Balances)
                </option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Notice Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Advisory Body Content
                </label>
                <span className="text-[11px] text-slate-400">
                  Pre-filled with AI diagnostic breakdown
                </span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={9}
                required
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            {/* Email Dispatch Notice */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs">
              <Mail className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <strong>Email Delivery:</strong> SettleX Mail Engine will automatically dispatch an official advisory email alert to{' '}
                <span className="font-semibold underline">{u.email}</span> upon submission.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSending || !subject.trim() || !message.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending Advisory & Email...
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5" />
                  Send Advisory & Email Alert
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
