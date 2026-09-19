import React from 'react';
import { PieChart } from 'lucide-react';

function calculateDonutSegments(categories, circumference) {
  let accumulated = 0;
  return categories.map((cat) => {
    const strokeDasharray = `${(cat.percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulated / 100) * circumference);
    accumulated += cat.percent;
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });
}

export function ExpensesByCategoryCard({
  customCategories = null,
  totalAmountFormatted = 'Rs. 582,400',
  className = '',
}) {
  const defaultCategories = [
    { label: 'Food', percent: 32.4, color: '#3b82f6' },
    { label: 'Accommodation', percent: 22.8, color: '#10b981' },
    { label: 'Transport', percent: 15.6, color: '#06b6d4' },
    { label: 'Entertainment', percent: 10.2, color: '#8b5cf6' },
    { label: 'Shopping', percent: 8.7, color: '#ec4899' },
    { label: 'Utilities', percent: 5.1, color: '#f59e0b' },
    { label: 'Other', percent: 5.2, color: '#64748b' },
  ];

  const categories =
    Array.isArray(customCategories) && customCategories.length > 0
      ? customCategories
      : defaultCategories;

  const radius = 64;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  const segments = calculateDonutSegments(categories, circumference);

  const hasAnyExpenses = categories.some((c) => c.percent > 0);

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-colors h-full ${className}`}
    >
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <PieChart className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Expenses by Category
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Categorical breakdown across all active circles
          </p>
        </div>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {!hasAnyExpenses ? (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-slate-200 dark:text-slate-800"
              />
            ) : (
              segments.map((seg) => (
                <circle
                  key={seg.label}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              ))
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {totalAmountFormatted}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
              Total Expenses
            </span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-1.5">
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center justify-between text-xs py-0.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-slate-700 dark:text-slate-300 text-[11px] font-medium truncate">
                  {cat.label}
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">
                {cat.percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
