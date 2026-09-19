import React, { useState, useMemo } from 'react';
import { FolderKanban, Search, X, Users, RotateCw, Sparkles } from 'lucide-react';

export function DatabaseGroupSelector({
  allGroups = [],
  selectedGroup,
  onSelectGroup,
  isExecuting = false,
}) {
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  const filteredGroups = useMemo(() => {
    if (!groupSearchQuery.trim()) {
      return allGroups.slice(0, 6);
    }
    const q = groupSearchQuery.toLowerCase().trim();
    return allGroups.filter(
      (g) =>
        g.name?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q)
    );
  }, [allGroups, groupSearchQuery]);

  return (
    <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Database Group Selection
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              Live Database
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select an expense group to compute net balances, discover top payers, and visualize cash flow minimization.
          </p>
        </div>

        <button
          onClick={() => onSelectGroup?.(selectedGroup)}
          disabled={isExecuting || !selectedGroup}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 active:scale-[0.98] rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
          <span>{isExecuting ? 'Computing...' : 'Recalculate Selected'}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <FolderKanban className="w-3.5 h-3.5 text-primary" />
          <span>
            Select Group from Database ({allGroups.length} Groups Available
            {groupSearchQuery.trim() ? ` • ${filteredGroups.length} matching` : ''}
            )
          </span>
        </label>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={groupSearchQuery}
            onChange={(e) => setGroupSearchQuery(e.target.value)}
            placeholder="Search group by name..."
            className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
          />
          {groupSearchQuery.trim() && (
            <button
              type="button"
              onClick={() => setGroupSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          No groups found matching "{groupSearchQuery}".
          <button
            type="button"
            onClick={() => setGroupSearchQuery('')}
            className="ml-2 font-bold text-primary hover:underline cursor-pointer"
          >
            Clear filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredGroups.map((g) => {
            const gId = String(g.id || g._id);
            const isSelected = gId === String(selectedGroup);
            return (
              <button
                key={gId}
                type="button"
                onClick={() => onSelectGroup?.(gId)}
                className={`p-3.5 text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-primary/5 border-primary shadow-xs ring-2 ring-primary/20'
                    : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {g.name}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary text-white">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    {g.members?.length || 0} Members
                  </span>
                  <span className="truncate max-w-[140px] text-right">
                    {g.description || 'Expense Group'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DatabaseGroupSelector;
