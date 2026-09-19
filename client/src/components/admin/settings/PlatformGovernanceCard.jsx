import React from 'react';
import { Sliders, Cpu, Coins, Check, GitFork } from 'lucide-react';

export default function PlatformGovernanceCard({ settings = {}, onChange, canEdit = true }) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Platform & Accounting Parameters
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            System identity, baseline ledger currency, and settlement engine routing
          </p>
        </div>
      </div>

      <div className="space-y-3.5 text-xs">
        {/* Platform Name */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
            Platform Branding Title
          </label>
          <input
            type="text"
            value={settings.platformName || ''}
            onChange={(e) => onChange({ platformName: e.target.value })}
            disabled={!canEdit}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
          />
        </div>

        {/* Currency & Symbol Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Primary Ledger Currency
            </label>
            <select
              value={settings.primaryCurrency || 'NPR'}
              onChange={(e) => {
                const cur = e.target.value;
                const sym = cur === 'NPR' ? 'Rs.' : cur === 'INR' ? '₹' : '$';
                onChange({ primaryCurrency: cur, currencySymbol: sym });
              }}
              disabled={!canEdit}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 cursor-pointer"
            >
              <option value="NPR">NPR - Nepalese Rupee (Rs.)</option>
              <option value="INR">INR - Indian Rupee (₹)</option>
              <option value="USD">USD - US Dollar ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
              Currency Symbol Display
            </label>
            <input
              type="text"
              value={settings.currencySymbol || 'Rs.'}
              onChange={(e) => onChange({ currencySymbol: e.target.value })}
              disabled={!canEdit}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 font-bold font-mono"
            />
          </div>
        </div>

        {/* Settlement Calculation Engine */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
            Default Settlement Calculation Engine
          </label>
          <select
            value={settings.defaultOptimizationEngine || 'greedy_net_elimination'}
            onChange={(e) => onChange({ defaultOptimizationEngine: e.target.value })}
            disabled={!canEdit}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 cursor-pointer"
          >
            <option value="greedy_net_elimination">
              Greedy Net Balance Matching (O(V log V) - Global Minimal Transfers)
            </option>
            <option value="cycle_minimization">
              Depth-First Cycle Cancellation (Tarjan/DFS - Structural Minimization)
            </option>
          </select>
        </div>

        {/* Auto-Debt Simplification Switch */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div>
            <span className="font-bold text-slate-900 dark:text-white block">
              Auto-Simplify Group Balances
            </span>
            <span className="text-[11px] text-slate-400 block">
              Automatically calculate net minimal transfers after every recorded expense
            </span>
          </div>
          <button
            type="button"
            onClick={() => onChange({ autoSimplifyDebts: !settings.autoSimplifyDebts })}
            disabled={!canEdit}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer disabled:opacity-50 ${
              settings.autoSimplifyDebts ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform transform shadow-sm ${
                settings.autoSimplifyDebts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
