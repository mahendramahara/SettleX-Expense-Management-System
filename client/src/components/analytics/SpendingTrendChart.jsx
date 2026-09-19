import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

export function SpendingTrendChart({ expenses = [] }) {
  const buckets = new Map();

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  );

  sortedExpenses.forEach((e) => {
    const d = e.createdAt ? new Date(e.createdAt) : new Date();
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    buckets.set(key, (buckets.get(key) || 0) + (e.amountPaisa || 0));
  });

  const dataPoints = Array.from(buckets.entries())
    .slice(-7)
    .map(([label, amountPaisa]) => ({
      label,
      amountPaisa,
    }));

  const maxPaisa = Math.max(...dataPoints.map((d) => d.amountPaisa), 1);

  const formatRs = (paisa) =>
    ((paisa || 0) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Expenditure Velocity
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Timeline Trend</span>
      </div>

      {dataPoints.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">
          Not enough historical records to plot velocity.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="h-44 flex items-end justify-between gap-2 pt-6 px-2">
            {dataPoints.map((pt, idx) => {
              const heightPercent = Math.max(12, Math.round((pt.amountPaisa / maxPaisa) * 100));

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap">
                    Rs. {formatRs(pt.amountPaisa)}
                  </div>

                  <div className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-primary group-hover:bg-primary-hover rounded-t-lg transition-all duration-300 shadow-xs"
                    />
                  </div>

                  <span className="text-[10px] font-semibold text-slate-400 truncate w-full text-center">
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Aggregated by daily transaction timestamps</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Peak: Rs. {formatRs(maxPaisa)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
