import React from 'react';
import { Layers, Percent, CircleDot } from 'lucide-react';

export function SplitStrategyBreakdown({ expenses = [] }) {
  const stats = {
    EQUAL: { count: 0, amountPaisa: 0 },
    EXACT: { count: 0, amountPaisa: 0 },
    PERCENTAGE: { count: 0, amountPaisa: 0 },
  };

  expenses.forEach((e) => {
    const type = (e.splitType || 'EQUAL').toUpperCase();
    if (stats[type]) {
      stats[type].count += 1;
      stats[type].amountPaisa += e.amountPaisa || 0;
    } else {
      stats.EQUAL.count += 1;
      stats.EQUAL.amountPaisa += e.amountPaisa || 0;
    }
  });

  const totalCount = expenses.length || 1;
  const formatRs = (paisa) =>
    ((paisa || 0) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const cards = [
    {
      key: 'EQUAL',
      title: 'Equal Split',
      description: 'Evenly divided with integer paisa remainder assignment',
      icon: CircleDot,
      count: stats.EQUAL.count,
      amountPaisa: stats.EQUAL.amountPaisa,
      percent: Math.round((stats.EQUAL.count / totalCount) * 100),
      color: 'blue',
    },
    {
      key: 'EXACT',
      title: 'Exact Amount',
      description: 'Individual amounts explicitly specified in NPR',
      icon: Layers,
      count: stats.EXACT.count,
      amountPaisa: stats.EXACT.amountPaisa,
      percent: Math.round((stats.EXACT.count / totalCount) * 100),
      color: 'violet',
    },
    {
      key: 'PERCENTAGE',
      title: 'Percentage Share',
      description: 'Normalized ratio shares summing strictly to 100%',
      icon: Percent,
      count: stats.PERCENTAGE.count,
      amountPaisa: stats.PERCENTAGE.amountPaisa,
      percent: Math.round((stats.PERCENTAGE.count / totalCount) * 100),
      color: 'emerald',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Split Strategy Adoption
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Algorithm Utilization</span>
      </div>

      <div className="space-y-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.key}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {c.title}
                    </div>
                    <div className="text-[10px] text-slate-400">{c.description}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {c.count} ({c.percent}%)
                  </div>
                  <div className="text-[10px] text-slate-400">Rs. {formatRs(c.amountPaisa)}</div>
                </div>
              </div>

              <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  style={{ width: `${c.percent}%` }}
                  className="h-full rounded-full bg-primary transition-all duration-300"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
