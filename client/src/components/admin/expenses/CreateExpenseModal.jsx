import React, { useState, useEffect, useMemo } from 'react';
import { Receipt, X, AlertCircle } from 'lucide-react';

export function CreateExpenseModal({ groups = [], onClose, onSubmit }) {
  const [groupId, setGroupId] = useState(groups[0]?.id || '');
  const [title, setTitle] = useState('');
  const [amountRupees, setAmountRupees] = useState('');
  const [paidById, setPaidById] = useState('');
  const [splitType, setSplitType] = useState('EQUAL');

  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [exactSplits, setExactSplits] = useState({});
  const [percentageSplits, setPercentageSplits] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedGroup = useMemo(() => {
    return groups.find((g) => g.id === groupId) || null;
  }, [groups, groupId]);

  const groupMembers = useMemo(() => {
    return selectedGroup?.members || [];
  }, [selectedGroup]);

  useEffect(() => {
    if (groupMembers.length > 0) {
      setPaidById(groupMembers[0].id);
      setSelectedParticipants(groupMembers.map((m) => m.id));

      const initialExact = {};
      const initialPct = {};
      const equalPct = (100 / groupMembers.length).toFixed(2);
      groupMembers.forEach((m) => {
        initialExact[m.id] = '';
        initialPct[m.id] = equalPct;
      });
      setExactSplits(initialExact);
      setPercentageSplits(initialPct);
    } else {
      setPaidById('');
      setSelectedParticipants([]);
    }
  }, [groupMembers]);

  const parsedAmountPaisa = useMemo(() => {
    const num = parseFloat(amountRupees);
    return isNaN(num) || num <= 0 ? 0 : Math.round(num * 100);
  }, [amountRupees]);

  const exactSumRupees = useMemo(() => {
    return Object.values(exactSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [exactSplits]);

  const percentageSum = useMemo(() => {
    return Object.values(percentageSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [percentageSplits]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!groupId) {
      setErrorMsg('Please select a target group circle');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please specify an expense description or note');
      return;
    }
    if (parsedAmountPaisa <= 0) {
      setErrorMsg('Expense amount must be greater than zero');
      return;
    }
    if (!paidById) {
      setErrorMsg('Please specify which member paid this bill');
      return;
    }

    let payloadSplits = [];
    if (splitType === 'EQUAL') {
      if (selectedParticipants.length === 0) {
        setErrorMsg('At least one member must participate in equal split');
        return;
      }
    } else if (splitType === 'EXACT') {
      const targetRupees = parsedAmountPaisa / 100;
      if (Math.abs(exactSumRupees - targetRupees) > 0.01) {
        setErrorMsg(
          `Sum of member shares (Rs. ${exactSumRupees}) must equal total amount (Rs. ${targetRupees})`
        );
        return;
      }
      payloadSplits = Object.entries(exactSplits).map(([uId, amt]) => ({
        userId: uId,
        amountPaisa: Math.round((parseFloat(amt) || 0) * 100),
      }));
    } else if (splitType === 'PERCENTAGE') {
      if (Math.round(percentageSum) !== 100) {
        setErrorMsg(`Sum of split percentages (${percentageSum.toFixed(1)}%) must equal 100%`);
        return;
      }
      payloadSplits = Object.entries(percentageSplits).map(([uId, pct]) => ({
        userId: uId,
        percentage: parseFloat(pct) || 0,
        amountPaisa: Math.round((parsedAmountPaisa * (parseFloat(pct) || 0)) / 100),
      }));
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        groupId,
        title: title.trim(),
        amountPaisa: parsedAmountPaisa,
        paidById,
        splitType,
        participantIds: selectedParticipants,
        splits: payloadSplits,
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleParticipant = (id) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const calculatedSharePerPerson = useMemo(() => {
    if (splitType !== 'EQUAL' || selectedParticipants.length === 0 || parsedAmountPaisa <= 0) {
      return 'Rs. 0';
    }
    const share = Math.round(parsedAmountPaisa / selectedParticipants.length);
    return `Rs. ${(share / 100).toLocaleString('en-IN')}`;
  }, [splitType, selectedParticipants, parsedAmountPaisa]);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Receipt className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Record Platform Expense
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded-xl text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Group Circle Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Group Circle *
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer font-medium"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.memberCount || g.members?.length || 0} members)
                </option>
              ))}
            </select>
          </div>

          {/* Title & Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Expense Description / Note *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bhatbhateni Groceries, Resort Stay"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount (NPR / Rs.) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="1500"
                value={amountRupees}
                onChange={(e) => setAmountRupees(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Paid By Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Paid By (Member Who Settled Bill) *
            </label>
            <select
              value={paidById}
              onChange={(e) => setPaidById(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer font-medium"
            >
              {groupMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          {/* Split Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Split Methodology
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'EQUAL', label: 'Equally Split' },
                { id: 'EXACT', label: 'Exact Shares' },
                { id: 'PERCENTAGE', label: 'Percentage' },
              ].map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setSplitType(tab.id)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    splitType === tab.id
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Split Distribution Settings */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Member Split Allocation</span>
              {splitType === 'EQUAL' && (
                <span className="text-primary font-bold">{calculatedSharePerPerson} / member</span>
              )}
              {splitType === 'EXACT' && (
                <span
                  className={`font-semibold ${
                    Math.abs(exactSumRupees - parsedAmountPaisa / 100) < 0.01
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  Allocated: Rs. {exactSumRupees} / Rs. {parsedAmountPaisa / 100}
                </span>
              )}
              {splitType === 'PERCENTAGE' && (
                <span
                  className={`font-semibold ${
                    Math.round(percentageSum) === 100
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  Total: {percentageSum.toFixed(1)}% / 100%
                </span>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {groupMembers.map((member) => {
                if (splitType === 'EQUAL') {
                  const isChecked = selectedParticipants.includes(member.id);
                  return (
                    <label
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleParticipant(member.id)}
                          className="rounded text-primary focus:ring-primary cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {member.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{member.email}</span>
                    </label>
                  );
                }

                if (splitType === 'EXACT') {
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{member.email}</p>
                      </div>
                      <div className="w-32 relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          Rs.
                        </span>
                        <input
                          type="number"
                          step="any"
                          value={exactSplits[member.id] || ''}
                          onChange={(e) =>
                            setExactSplits((prev) => ({ ...prev, [member.id]: e.target.value }))
                          }
                          placeholder="0"
                          className="w-full pl-8 pr-2 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-right font-medium"
                        />
                      </div>
                    </div>
                  );
                }

                if (splitType === 'PERCENTAGE') {
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-3 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{member.email}</p>
                      </div>
                      <div className="w-24 relative">
                        <input
                          type="number"
                          step="any"
                          value={percentageSplits[member.id] || ''}
                          onChange={(e) =>
                            setPercentageSplits((prev) => ({
                              ...prev,
                              [member.id]: e.target.value,
                            }))
                          }
                          placeholder="0"
                          className="w-full pr-6 pl-2 py-1 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-right font-medium"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          %
                        </span>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-primary hover:opacity-90 rounded-xl shadow-xs transition-opacity cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
