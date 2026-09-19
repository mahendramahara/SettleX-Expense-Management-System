import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  UserPlus,
  Search,
  X,
  Loader2,
  Users,
  Receipt,
  CreditCard,
  Scale,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { LazyImage } from '../ui/LazyImage';
import { userService, groupService } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

function MemberSearchInput({ groupId, existingMemberIds, onMemberAdded, isGuest, onGuestAction }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [message, setMessage] = useState(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const runSearch = useCallback(
    async (q) => {
      if (q.trim().length < 2) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await userService.search(q.trim());
        const users = res?.data?.users || [];
        setResults(users.filter((u) => !existingMemberIds.includes(u.id)));
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [existingMemberIds]
  );

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => runSearch(query), 300);
    } else {
      setResults([]);
    }
    return () => clearTimeout(debounceRef.current);
  }, [query, runSearch]);

  const handleAdd = async (user) => {
    if (isGuest) {
      onGuestAction?.();
      return;
    }
    setAddingId(user.id);
    setMessage(null);
    try {
      await groupService.addMember(groupId, { userId: user.id });
      setMessage({ type: 'success', text: `${user.name} added` });
      setResults((prev) => prev.filter((u) => u.id !== user.id));
      setQuery('');
      onMemberAdded?.();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add' });
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-8 pr-7 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {isSearching && (
        <div className="flex items-center gap-1.5 px-1 text-[11px] text-slate-400">
          <Loader2 className="w-3 h-3 animate-spin" />
          Searching...
        </div>
      )}

      {results.length > 0 && (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
            >
              <div className="flex items-center gap-2">
                <Avatar name={user.name} size="xs" />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400">{user.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAdd(user)}
                disabled={addingId === user.id}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60 cursor-pointer"
              >
                {addingId === user.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <UserPlus className="w-3 h-3" />
                )}
                Add
              </button>
            </div>
          ))}
        </div>
      )}

      {query.trim().length >= 2 && !isSearching && results.length === 0 && (
        <div className="text-center py-3 text-[11px] text-slate-400">No matching users found</div>
      )}

      {message && (
        <div
          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}

export function GroupDetailModal({ isOpen, onClose, group, onOpenAddExpense }) {
  const [activeTab, setActiveTab] = useState('balances');
  const [groupDetails, setGroupDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isGuest } = useAuth();
  const toast = useToast();

  const handleGuestAction = () => {
    toast.warning('Please log in to perform this action.');
  };

  const fetchDetails = useCallback(async () => {
    if (!group?.id) return;
    if (group.id.startsWith('demo-')) {
      setGroupDetails(group);
      return;
    }
    setIsLoading(true);
    try {
      const res = await groupService.getById(group.id);
      setGroupDetails(res?.data?.group || group);
    } catch {
      setGroupDetails(group);
    } finally {
      setIsLoading(false);
    }
  }, [group]);

  useEffect(() => {
    if (isOpen && group) {
      setActiveTab('balances');
      fetchDetails();
    }
    if (!isOpen) {
      setGroupDetails(null);
    }
  }, [isOpen, group, fetchDetails]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !group) return null;

  const current = groupDetails || group;
  const memberBalances = current.memberBalances || [];
  const settlements = current.settlements || [];
  const expenses = current.expenses || [];
  const members = current.members || [];
  const existingMemberIds = members.map((m) => (m._id || m.id || m).toString());

  const totalSpendNpr = ((current.totalSpendPaisa || 0) / 100).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });

  const TABS = [
    { key: 'balances', label: 'Balances', icon: Scale, count: memberBalances.length },
    { key: 'settlements', label: 'Settle', icon: CreditCard, count: settlements.length },
    { key: 'expenses', label: 'Expenses', icon: Receipt, count: expenses.length },
    { key: 'members', label: 'Members', icon: Users, count: members.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-in fade-in zoom-in-95 duration-150 flex overflow-hidden"
        style={{ maxHeight: 'min(88vh, 640px)' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-sm"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="w-56 sm:w-64 shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 overflow-hidden">
          <div className="relative aspect-[4/3] overflow-hidden shrink-0">
            <LazyImage
              src={current.imageUrl}
              alt={current.name || current.title}
              aspectRatio="aspect-[4/3]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h2 className="text-sm font-black text-white leading-tight line-clamp-2">
                {current.name || current.title}
              </h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {current.description && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                {current.description}
              </p>
            )}

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                  Total Spend
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                  Rs. {totalSpendNpr}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                  Your Balance
                </div>
                <div className="mt-0.5">
                  {current.balanceType === 'owe' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                      <TrendingDown className="w-3.5 h-3.5" />
                      {current.balanceAmount}
                    </span>
                  )}
                  {current.balanceType === 'owed' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {current.balanceAmount}
                    </span>
                  )}
                  {(!current.balanceType || current.balanceType === 'settled') && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Settled up
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    {members.length || current.membersCount || 0}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">Members</div>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-sm font-black text-slate-900 dark:text-white">
                    {expenses.length || current.expensesCount || 0}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">Expenses</div>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full text-xs"
              icon={Plus}
              onClick={() => {
                if (isGuest) {
                  handleGuestAction();
                  return;
                }
                onClose();
                onOpenAddExpense?.(current);
              }}
            >
              Add Expense
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 shrink-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 py-3 px-2 text-[11px] font-bold whitespace-nowrap border-b-2 transition-colors cursor-pointer mr-2 ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        activeTab === tab.key
                          ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            )}

            {!isLoading && activeTab === 'balances' && (
              <div className="space-y-1.5">
                {memberBalances.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400">
                    No balance data yet.
                  </div>
                ) : (
                  memberBalances.map((m) => {
                    const isPositive = m.netBalancePaisa > 0;
                    const isNegative = m.netBalancePaisa < 0;
                    const amt = (Math.abs(m.netBalancePaisa) / 100).toLocaleString('en-IN', {
                      maximumFractionDigits: 0,
                    });
                    return (
                      <div
                        key={m.userId}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar name={m.name} size="sm" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {m.name}
                            </div>
                            <div className="text-[10px] text-slate-400">{m.email}</div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {isPositive && (
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              +Rs. {amt}
                            </span>
                          )}
                          {isNegative && (
                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                              -Rs. {amt}
                            </span>
                          )}
                          {!isPositive && !isNegative && (
                            <span className="text-xs font-semibold text-slate-400">Settled</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {!isLoading && activeTab === 'settlements' && (
              <div className="space-y-1.5">
                {settlements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-xs text-slate-400 gap-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    All settled up.
                  </div>
                ) : (
                  settlements.map((s, idx) => {
                    const amt = ((s.amountPaisa || 0) / 100).toLocaleString('en-IN', {
                      maximumFractionDigits: 0,
                    });
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar name={s.fromName || 'Debtor'} size="xs" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {s.fromName}
                          </span>
                          <ArrowRight className="w-3 h-3 text-blue-500 shrink-0" />
                          <Avatar name={s.toName || 'Creditor'} size="xs" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {s.toName}
                          </span>
                        </div>
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 shrink-0 ml-2">
                          Rs. {amt}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {!isLoading && activeTab === 'expenses' && (
              <div className="space-y-1.5">
                {expenses.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400">No expenses yet.</div>
                ) : (
                  expenses.map((exp) => {
                    const amt = ((exp.amountPaisa || 0) / 100).toLocaleString('en-IN', {
                      maximumFractionDigits: 0,
                    });
                    const dateStr = exp.createdAt
                      ? new Date(exp.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '';
                    return (
                      <div
                        key={exp.id || exp._id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {exp.description}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{exp.paidByName || 'Member'}</span>
                            {exp.splitType && (
                              <>
                                <span>•</span>
                                <span className="uppercase">{exp.splitType}</span>
                              </>
                            )}
                            {dateStr && (
                              <>
                                <span>•</span>
                                <span>{dateStr}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-900 dark:text-white shrink-0 ml-2">
                          Rs. {amt}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {!isLoading && activeTab === 'members' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  {members.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">No members yet.</div>
                  ) : (
                    members.map((m) => {
                      const mId = (m._id || m.id || m).toString();
                      const mName = m.name || 'Member';
                      return (
                        <div
                          key={mId}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                        >
                          <Avatar name={mName} size="sm" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {mName}
                            </div>
                            {m.email && (
                              <div className="text-[10px] text-slate-400 truncate">{m.email}</div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {!group.id?.startsWith('demo-') && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                      Add Member
                    </div>
                    <MemberSearchInput
                      groupId={current.id}
                      existingMemberIds={existingMemberIds}
                      onMemberAdded={fetchDetails}
                      isGuest={isGuest}
                      onGuestAction={handleGuestAction}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
