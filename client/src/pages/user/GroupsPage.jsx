import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Plus, Search, Scale, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { GroupCard } from '../../components/groups/GroupCard';
import { GroupCardSkeleton } from '../../components/groups/GroupCardSkeleton';
import { GroupDetailModal } from '../../components/groups/GroupDetailModal';
import { groupService } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DEMO } from '../../demo/index.js';

export function GroupsPage({ onOpenNewGroup, onOpenNewExpense, refreshKey }) {
  const { isGuest } = useAuth();
  const toast = useToast();
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState(null);

  const loadGroups = useCallback(async () => {
    if (isGuest) {
      setGroups(DEMO.groups);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await groupService.getAll();
      const fetched = res?.data?.groups || res?.groups || [];
      setGroups(fetched);
    } catch {
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups, refreshKey]);

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const nameMatch =
        (g.name || g.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!nameMatch) return false;

      if (filterType === 'owe') return g.balanceType === 'owe';
      if (filterType === 'owed') return g.balanceType === 'owed';
      if (filterType === 'settled') return !g.balanceType || g.balanceType === 'settled';
      return true;
    });
  }, [groups, searchQuery, filterType]);

  const totalGroups = groups.length;
  const totalSpendPaisa = groups.reduce((sum, g) => sum + (g.totalSpendPaisa || 0), 0);
  const totalSpendNpr = (totalSpendPaisa / 100).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  });

  const totalOwePaisa = groups.reduce(
    (sum, g) => sum + (g.balanceType === 'owe' ? Math.abs(g.userBalancePaisa || 0) : 0),
    0
  );
  const totalOwedPaisa = groups.reduce(
    (sum, g) => sum + (g.balanceType === 'owed' ? g.userBalancePaisa || 0 : 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Expense Groups
            </h1>
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              {totalGroups} Active
            </span>
            {isGuest && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                <Sparkles className="w-3 h-3" />
                Demo
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isGuest
              ? 'Sample groups loaded for demonstration. Sign up to create your own circles.'
              : 'Manage your shared circles, track split balances, and view debt minimizations.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isGuest && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadGroups}
              icon={RefreshCw}
              title="Refresh Groups"
              disabled={isLoading}
            />
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (isGuest) {
                toast.warning(
                  'Demo Mode',
                  'Sign up for a free account to create your own expense groups.'
                );
                return;
              }
              onOpenNewGroup?.();
            }}
            icon={Plus}
          >
            Create Group
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Circles
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {totalGroups}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Collaborative groups joined</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Spending
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            Rs. {totalSpendNpr}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Recorded across all groups</div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Net Outstanding
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black">
            {totalOwedPaisa >= totalOwePaisa ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                +Rs.{' '}
                {((totalOwedPaisa - totalOwePaisa) / 100).toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                })}
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400">
                -Rs.{' '}
                {((totalOwePaisa - totalOwedPaisa) / 100).toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                })}
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Your current balance position</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups by name..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'owe', label: 'You Owe' },
            { id: 'owed', label: "You're Owed" },
            { id: 'settled', label: 'Settled' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GroupCardSkeleton />
          <GroupCardSkeleton />
          <GroupCardSkeleton />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white/40 dark:bg-slate-900/40">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 mx-auto flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {searchQuery ? 'No matching groups found' : 'No groups found'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'Try modifying your search keywords or filter tab.'
              : 'Create your first expense circle to start splitting bills and tracking debts.'}
          </p>
          <Button variant="primary" size="sm" onClick={onOpenNewGroup} icon={Plus} className="mt-4">
            Create First Group
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredGroups.map((grp) => (
            <GroupCard
              key={grp.id || grp._id}
              group={grp}
              onSelect={(g) => setSelectedGroup(g)}
              onAddExpense={(g) => onOpenNewExpense?.(g)}
            />
          ))}
        </div>
      )}

      <GroupDetailModal
        isOpen={Boolean(selectedGroup)}
        onClose={() => setSelectedGroup(null)}
        group={selectedGroup}
        onOpenAddExpense={(grp) => onOpenNewExpense?.(grp)}
      />
    </div>
  );
}
