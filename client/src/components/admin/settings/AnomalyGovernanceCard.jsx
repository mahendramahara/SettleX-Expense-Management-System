import React from 'react';
import { AlertTriangle, TrendingUp, ShieldAlert, SlidersHorizontal, Info } from 'lucide-react';

export default function AnomalyGovernanceCard({ settings = {}, onChange, canEdit = true }) {
  const anomalyRules = settings.anomalyRules || {
    defaultThreshold: 1.5,
    highExpenseAlertPaisa: 5000000,
    autoFlagDominantSpenders: true,
  };

  const handleRuleChange = (patch) => {
    onChange({
      anomalyRules: {
        ...anomalyRules,
        ...patch,
      },
    });
  };

  // Convert paisa to rupees for clean human input
  const highExpenseRupees = Math.round((anomalyRules.highExpenseAlertPaisa || 5000000) / 100);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Anomaly & Risk Rule Parameters
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Outlier detection sensitivity, high-value expense triggers, and spender alerts
          </p>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        {/* Outlier Threshold */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Circle Outlier Detection Multiplier
            </label>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
              {anomalyRules.defaultThreshold || 1.5}x Circle Mean
            </span>
          </div>
          <select
            value={anomalyRules.defaultThreshold || 1.5}
            onChange={(e) => handleRuleChange({ defaultThreshold: Number(e.target.value) })}
            disabled={!canEdit}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 cursor-pointer"
          >
            <option value="1.25">1.25x - Strict (Flags minor overspending deviations early)</option>
            <option value="1.5">1.50x - Balanced (Industry standard deviation ratio)</option>
            <option value="1.75">1.75x - Lenient (Moderate tolerance across social circles)</option>
            <option value="2.0">2.00x - Relaxed (Flags only extreme statistical outliers)</option>
          </select>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Triggers behavioral notices when a member's group expenditure exceeds peer circle
            averages by this multiplier.
          </p>
        </div>

        {/* High-Value Expense Alert */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              High-Value Expense Notification Threshold
            </label>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              Rs. {highExpenseRupees.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400 font-mono">
              Rs.
            </span>
            <input
              type="number"
              min="1000"
              step="1000"
              value={highExpenseRupees}
              onChange={(e) => {
                const rs = Math.max(0, Number(e.target.value) || 0);
                handleRuleChange({ highExpenseAlertPaisa: rs * 100 });
              }}
              disabled={!canEdit}
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 font-mono font-bold"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Expenses exceeding this amount automatically receive priority review status in the risk
            monitor.
          </p>
        </div>

        {/* Dominant Spender Auto-Flagging */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="pr-4">
            <span className="font-bold text-slate-900 dark:text-white block">
              Auto-Flag Dominant Spenders
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Identifies users funding over 65% of all group liabilities across multiple settlement
              cycles.
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={anomalyRules.autoFlagDominantSpenders !== false}
              onChange={(e) => handleRuleChange({ autoFlagDominantSpenders: e.target.checked })}
              disabled={!canEdit}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
          </label>
        </div>

        {/* Risk Governance Advisory Notice */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed">
            Rule updates take effect on subsequent expense creation and scheduled batch audit scans.
            Existing settlement transactions are preserved without retroaction.
          </p>
        </div>
      </div>
    </div>
  );
}
