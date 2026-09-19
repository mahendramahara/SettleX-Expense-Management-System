import React, { useState, useEffect, useMemo } from 'react';
import { Scale, CheckCircle2, AlertCircle, X, ArrowRight } from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export function RecordSettlementModal({ initialData = null, groups = [], onClose, onSubmit }) {
  const [groupId, setGroupId] = useState(initialData?.groupId || groups[0]?.id || '');
  const [fromUserId, setFromUserId] = useState(initialData?.from?.id || '');
  const [toUserId, setToUserId] = useState(initialData?.to?.id || '');
  const [amountRupees, setAmountRupees] = useState(
    initialData?.amountPaisa ? (initialData.amountPaisa / 100).toString() : ''
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedGroup = useMemo(() => {
    return groups.find((g) => g.id === groupId) || null;
  }, [groups, groupId]);

  const groupMembers = useMemo(() => {
    return selectedGroup?.members || [];
  }, [selectedGroup]);

  useEffect(() => {
    if (!fromUserId && groupMembers.length > 0) {
      setFromUserId(groupMembers[0].id);
    }
    if (!toUserId && groupMembers.length > 1) {
      setToUserId(groupMembers[1].id);
    }
  }, [groupMembers, fromUserId, toUserId]);

  const fromMember = useMemo(() => {
    return groupMembers.find((m) => m.id === fromUserId) || null;
  }, [groupMembers, fromUserId]);

  const toMember = useMemo(() => {
    return groupMembers.find((m) => m.id === toUserId) || null;
  }, [groupMembers, toUserId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!groupId) {
      setErrorMsg('Please select a target group circle');
      return;
    }
    if (!fromUserId || !toUserId) {
      setErrorMsg('Debtor and creditor members are required');
      return;
    }
    if (fromUserId === toUserId) {
      setErrorMsg('Payer and recipient cannot be the same member');
      return;
    }
    const num = parseFloat(amountRupees);
    if (isNaN(num) || num <= 0) {
      setErrorMsg('Settlement amount must be positive');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        groupId,
        fromUserId,
        toUserId,
        amountPaisa: Math.round(num * 100),
        notes: notes.trim(),
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record settlement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Record Debt Settlement
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-xl text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Group Circle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Group Circle *
            </label>
            <select
              value={groupId}
              onChange={(e) => {
                setGroupId(e.target.value);
                setFromUserId('');
                setToUserId('');
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.memberCount || g.members?.length || 0} members)
                </option>
              ))}
            </select>
          </div>

          {/* From & To User Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payer / Debtor (Settling) *
              </label>
              <select
                value={fromUserId}
                onChange={(e) => setFromUserId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
              >
                {groupMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Recipient / Creditor (Receiving) *
              </label>
              <select
                value={toUserId}
                onChange={(e) => setToUserId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
              >
                {groupMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount in Rupees */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Settlement Amount (NPR / Rs.) *
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 2500"
              value={amountRupees}
              onChange={(e) => setAmountRupees(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Notes / Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Reference / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via eSewa / Cash clearance"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {/* Preview Badge */}
          {fromMember && toMember && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-500">Transaction Flow:</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <span>{fromMember.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                <span>{toMember.name}</span>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Confirm & Settle Debt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
