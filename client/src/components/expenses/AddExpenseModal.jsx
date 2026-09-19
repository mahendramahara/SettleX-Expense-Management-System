import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Receipt,
  Users,
  Layers,
  AlertCircle,
  PlusCircle,
  Percent,
  CircleDot,
  Check,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { groupService, expenseService } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DEMO } from '../../demo/index.js';

const QUICK_PRESETS = [
  'Groceries at Bhatbhateni',
  'Thakali Dinner',
  'Lakeside Hotel',
  'Fiber Internet & Utilities',
  'Taxi & Transport',
  'Cafe & Snacks',
];

function extractStringId(val) {
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object' && !(val instanceof Event) && !val.nativeEvent) {
    if (typeof val.id === 'string') return val.id;
    if (typeof val._id === 'string') return val._id;
  }
  return '';
}

export function AddExpenseModal({ isOpen, onClose, onExpenseCreated, defaultGroupId = null }) {
  const { user, isGuest } = useAuth();
  const toast = useToast();
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(() => extractStringId(defaultGroupId));
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState('EQUAL');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [exactSplits, setExactSplits] = useState({});
  const [percentageSplits, setPercentageSplits] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingGroups, setIsFetchingGroups] = useState(false);
  const [error, setError] = useState('');

  const currentUserId = (user?._id || user?.id || 'current-user').toString();
  const currentUserName = user?.name || user?.email || 'You';

  const [paidById, setPaidById] = useState(currentUserId);

  const selectedGroup = useMemo(() => {
    const validId = extractStringId(selectedGroupId);
    return groups.find((g) => (g.id || g._id) === validId) || groups[0] || null;
  }, [groups, selectedGroupId]);

  const groupMembers = useMemo(() => {
    if (!selectedGroup) {
      return [
        {
          id: currentUserId,
          _id: currentUserId,
          name: currentUserName,
          email: user?.email || '',
          isCurrentUser: true,
        },
      ];
    }

    const rawMembers = selectedGroup.members || [];
    const normalized = rawMembers.map((m) => {
      if (typeof m === 'string') {
        const isCurrent = m === currentUserId;
        return {
          id: m,
          _id: m,
          name: isCurrent ? currentUserName : `Member ${m.slice(-4)}`,
          email: '',
          isCurrentUser: isCurrent,
        };
      }
      const mId = (m.id || m._id || '').toString();
      const isCurrent =
        mId === currentUserId ||
        (m.name && m.name === user?.name) ||
        (m.email && m.email === user?.email);

      return {
        ...m,
        id: isCurrent ? currentUserId : mId,
        _id: isCurrent ? currentUserId : mId,
        name: m.name || m.email || 'Member',
        email: m.email || '',
        isCurrentUser: isCurrent,
      };
    });

    const hasCurrent = normalized.some((m) => m.id === currentUserId || m.isCurrentUser);
    if (!hasCurrent) {
      return [
        {
          id: currentUserId,
          _id: currentUserId,
          name: currentUserName,
          email: user?.email || '',
          isCurrentUser: true,
        },
        ...normalized,
      ];
    }

    return normalized;
  }, [selectedGroup, currentUserId, currentUserName, user]);

  const initializeParticipants = useCallback(
    (group) => {
      if (!group) return;
      const raw = group.members || [];
      const ids = raw.map((m) => {
        if (typeof m === 'string') return m;
        const mId = (m.id || m._id || '').toString();
        const isCurrent =
          mId === currentUserId ||
          (m.name && m.name === user?.name) ||
          (m.email && m.email === user?.email);
        return isCurrent ? currentUserId : mId;
      });

      if (!ids.includes(currentUserId)) {
        ids.unshift(currentUserId);
      }
      setSelectedParticipants(ids.filter(Boolean));
    },
    [currentUserId, user]
  );

  const loadUserGroups = useCallback(async () => {
    setIsFetchingGroups(true);
    try {
      let loaded = [];
      if (isGuest) {
        loaded = DEMO.groups || [];
      } else {
        const res = await groupService.getAll();
        loaded = res?.data?.groups || res?.groups || [];
        if (loaded.length === 0 && DEMO.groups) {
          loaded = DEMO.groups;
        }
      }
      setGroups(loaded);

      const targetId = extractStringId(selectedGroupId);
      const targetGroup =
        (targetId && loaded.find((g) => extractStringId(g.id || g._id) === targetId)) || loaded[0];

      if (targetGroup) {
        const gid = extractStringId(targetGroup.id || targetGroup._id);
        setSelectedGroupId(gid);
        initializeParticipants(targetGroup);
      }
    } catch {
      if (DEMO.groups) {
        setGroups(DEMO.groups);
        const targetId = extractStringId(selectedGroupId);
        const targetGroup =
          (targetId && DEMO.groups.find((g) => extractStringId(g.id || g._id) === targetId)) ||
          DEMO.groups[0];
        if (targetGroup) {
          setSelectedGroupId(extractStringId(targetGroup.id || targetGroup._id));
          initializeParticipants(targetGroup);
        }
      } else {
        setError('Unable to load your groups. Please ensure backend is running.');
      }
    } finally {
      setIsFetchingGroups(false);
    }
  }, [isGuest, selectedGroupId, initializeParticipants]);

  useEffect(() => {
    if (isOpen) {
      setError('');
      const cleanId = extractStringId(defaultGroupId);
      if (cleanId) {
        setSelectedGroupId(cleanId);
      }
      loadUserGroups();
    }
  }, [isOpen, defaultGroupId, loadUserGroups]);

  useEffect(() => {
    if (groupMembers.length > 0) {
      const currentMember = groupMembers.find((m) => m.isCurrentUser || m.id === currentUserId);
      const defaultId = currentMember ? currentMember.id : groupMembers[0].id;
      if (!paidById || !groupMembers.some((m) => m.id === paidById)) {
        setPaidById(defaultId);
      }
    }
  }, [groupMembers, currentUserId, paidById]);

  useEffect(() => {
    const cleanId = extractStringId(defaultGroupId);
    if (cleanId) {
      setSelectedGroupId(cleanId);
    }
  }, [defaultGroupId]);

  const handleGroupChange = (e) => {
    const nextGroupId = String(e.target.value || '');
    setSelectedGroupId(nextGroupId);
    const chosen = groups.find((g) => extractStringId(g.id || g._id) === nextGroupId);
    if (chosen) {
      initializeParticipants(chosen);
    }
  };

  const toggleParticipant = (memberId) => {
    setSelectedParticipants((prev) => {
      if (prev.includes(memberId)) {
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  const parsedAmount = parseFloat(amount) || 0;
  const equalShare =
    selectedParticipants.length > 0
      ? (parsedAmount / selectedParticipants.length).toFixed(2)
      : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalGroupId =
      extractStringId(selectedGroupId) ||
      extractStringId(selectedGroup?.id) ||
      extractStringId(selectedGroup?._id);

    if (!finalGroupId) {
      setError('Please select a group for this expense.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a descriptive expense title.');
      return;
    }
    if (parsedAmount <= 0) {
      setError('Please enter a valid expense amount greater than Rs. 0.');
      return;
    }
    if (selectedParticipants.length === 0) {
      setError('Please select at least one participant.');
      return;
    }

    if (isGuest) {
      toast.warning(
        'Demo Mode Active',
        'Please log in to create expenses. Modifications are disabled in demo preview mode.'
      );
      return;
    }

    const amountPaisa = Math.round(parsedAmount * 100);
    const payload = {
      groupId: finalGroupId,
      title: title.trim(),
      amountPaisa,
      paidById: extractStringId(paidById) || currentUserId,
      splitType,
      participantIds: selectedParticipants.map((p) => extractStringId(p)).filter(Boolean),
    };

    if (splitType === 'EXACT') {
      const splitsArray = selectedParticipants.map((pId) => ({
        userId: extractStringId(pId),
        amountPaisa: Math.round((parseFloat(exactSplits[pId]) || 0) * 100),
      }));
      const totalExactPaisa = splitsArray.reduce((acc, s) => acc + s.amountPaisa, 0);
      if (totalExactPaisa !== amountPaisa) {
        setError(
          `Sum of exact splits (Rs. ${(totalExactPaisa / 100).toFixed(2)}) must equal total expense (Rs. ${parsedAmount.toFixed(2)}).`
        );
        return;
      }
      payload.splits = splitsArray;
    } else if (splitType === 'PERCENTAGE') {
      const splitsArray = selectedParticipants.map((pId) => ({
        userId: extractStringId(pId),
        percentage: parseFloat(percentageSplits[pId]) || 0,
      }));
      const totalPct = splitsArray.reduce((acc, s) => acc + s.percentage, 0);
      if (Math.abs(totalPct - 100) > 0.01) {
        setError(`Split percentages must sum to 100%. Current sum: ${totalPct.toFixed(1)}%`);
        return;
      }
      payload.splits = splitsArray;
    }

    setIsLoading(true);
    setError('');

    try {
      await expenseService.create(payload);
      onExpenseCreated?.();
      onClose();
      resetForm();
    } catch (err) {
      setError(err.message || 'Failed to record expense. Please verify all inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setExactSplits({});
    setPercentageSplits({});
    setError('');
  };

  const paidByMember = groupMembers.find((m) => m.id === paidById);
  const paidByName = paidByMember
    ? `${paidByMember.name}${paidByMember.isCurrentUser ? ' (You)' : ''}`
    : 'You';

  const exactAllocated = useMemo(() => {
    return selectedParticipants.reduce((sum, pId) => sum + (parseFloat(exactSplits[pId]) || 0), 0);
  }, [selectedParticipants, exactSplits]);

  const percentageAllocated = useMemo(() => {
    return selectedParticipants.reduce(
      (sum, pId) => sum + (parseFloat(percentageSplits[pId]) || 0),
      0
    );
  }, [selectedParticipants, percentageSplits]);

  const handleSelectAll = () => {
    setSelectedParticipants(groupMembers.map((m) => m.id));
  };

  const handleDeselectAll = () => {
    const currentMember = groupMembers.find((m) => m.isCurrentUser || m.id === currentUserId);
    const defaultId = currentMember ? currentMember.id : groupMembers[0]?.id;
    setSelectedParticipants(defaultId ? [defaultId] : []);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Expense"
      description="Record a shared expense and recalculate group balances with integer paisa precision."
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 pt-1">
        {error && (
          <div className="flex items-center gap-2 p-2.5 mb-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pb-3">
          <div className="md:col-span-6 space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Select Group
              </label>
              <select
                value={extractStringId(selectedGroupId)}
                onChange={handleGroupChange}
                disabled={isFetchingGroups || groups.length === 0}
                className="w-full h-10 px-3 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
              >
                {groups.length === 0 ? (
                  <option value="">No groups found — create one first</option>
                ) : (
                  groups.map((grp) => {
                    const gId = extractStringId(grp.id || grp._id);
                    return (
                      <option key={gId} value={gId}>
                        {grp.name} ({grp.membersCount || grp.members?.length || 0} members)
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Expense Title
              </label>
              <Input
                id="expense-title-input"
                type="text"
                placeholder="e.g. Thakali Kitchen Lunch"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                prefixIcon={Receipt}
                required
              />

              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTitle(preset)}
                    className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Amount (Rs.)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rs.
                  </span>
                  <input
                    id="expense-amount-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Paid By
                </label>
                <select
                  value={paidById}
                  onChange={(e) => setPaidById(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
                >
                  {groupMembers.map((m) => {
                    const mId = m.id || m._id;
                    const isCurrent = m.isCurrentUser || mId === currentUserId;
                    return (
                      <option key={mId} value={mId}>
                        {m.name || m.email} {isCurrent ? '(You)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Split Strategy
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'EQUAL', label: 'Equal', icon: CircleDot },
                  { type: 'EXACT', label: 'Exact', icon: Layers },
                  { type: 'PERCENTAGE', label: 'Percent', icon: Percent },
                ].map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSplitType(type)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                      splitType === type
                        ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-6 flex flex-col min-h-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-3 md:pt-0 md:pl-5 space-y-2">
            <div className="flex items-center justify-between pb-1 shrink-0">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Participants ({selectedParticipants.length})
                </label>
                {splitType === 'EQUAL' && parsedAmount > 0 && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Rs. {equalShare}/ea
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-primary cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  All
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-primary cursor-pointer px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>

            {splitType === 'EXACT' && (
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800/80 font-medium shrink-0">
                <span className="text-slate-600 dark:text-slate-400">Allocated:</span>
                <span
                  className={
                    Math.abs(exactAllocated - parsedAmount) < 0.01
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-rose-600 dark:text-rose-400 font-bold'
                  }
                >
                  Rs. {exactAllocated.toFixed(2)} / Rs. {parsedAmount.toFixed(2)}
                </span>
              </div>
            )}

            {splitType === 'PERCENTAGE' && (
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800/80 font-medium shrink-0">
                <span className="text-slate-600 dark:text-slate-400">Total Percent:</span>
                <span
                  className={
                    Math.abs(percentageAllocated - 100) < 0.01
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-rose-600 dark:text-rose-400 font-bold'
                  }
                >
                  {percentageAllocated.toFixed(1)}% / 100%
                </span>
              </div>
            )}

            <div className="space-y-1.5 max-h-56 sm:max-h-64 overflow-y-auto pr-1 flex-1">
              {groupMembers.map((member) => {
                const mId = member.id || member._id;
                const isSelected = selectedParticipants.includes(mId);

                return (
                  <div
                    key={mId}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
                      isSelected
                        ? 'border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60'
                        : 'border-slate-200/50 dark:border-slate-800/30 opacity-50'
                    }`}
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 pr-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleParticipant(mId)}
                        className="rounded text-primary focus:ring-primary h-4 w-4 shrink-0"
                      />
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                        {(member.name || member.email || 'U')[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {member.name || member.email}
                        {member.isCurrentUser || mId === currentUserId ? ' (You)' : ''}
                      </span>
                    </label>

                    {isSelected && splitType === 'EXACT' && (
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[11px] text-slate-400">Rs.</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={exactSplits[mId] || ''}
                          onChange={(e) =>
                            setExactSplits({ ...exactSplits, [mId]: e.target.value })
                          }
                          className="w-20 h-7 px-2 text-xs text-right font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    )}

                    {isSelected && splitType === 'PERCENTAGE' && (
                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          value={percentageSplits[mId] || ''}
                          onChange={(e) =>
                            setPercentageSplits({ ...percentageSplits, [mId]: e.target.value })
                          }
                          className="w-16 h-7 px-2 text-xs text-right font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <span className="text-[11px] text-slate-400">%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-xs">
            {parsedAmount > 0 ? (
              <span>
                Total{' '}
                <strong className="text-slate-900 dark:text-white">
                  Rs. {parsedAmount.toFixed(2)}
                </strong>{' '}
                paid by <strong className="text-slate-900 dark:text-white">{paidByName}</strong>
              </span>
            ) : (
              <span>Enter amount & details</span>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              icon={PlusCircle}
            >
              Record Expense
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
