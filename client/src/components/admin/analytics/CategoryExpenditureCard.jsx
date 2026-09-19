import React from 'react';
import { PieChart, Layers } from 'lucide-react';

export function CategoryExpenditureCard({ categories = [] }) {
  return (
    <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md flex flex-col">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Category Breakdown</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Spending distribution across spending classifications.
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
          <PieChart className="w-4 h-4 text-indigo-500" />
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {categories.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No categorized expenses recorded yet.
          </div>
        ) : (
          categories.map((cat, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {cat.label}
                  </span>
                  <span className="text-[11px] text-slate-400">({cat.count} bills)</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <span>{cat.amountFormatted}</span>
                  <span className="text-xs text-slate-400 font-medium">({cat.percentage}%)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(2, cat.percentage))}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
