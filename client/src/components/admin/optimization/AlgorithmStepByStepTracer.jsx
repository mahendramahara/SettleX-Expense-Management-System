import React from 'react';
import { Layers, GitFork, Scale, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

export function AlgorithmStepByStepTracer() {
  const steps = [
    {
      step: '01',
      title: 'Expense Aggregation',
      icon: Layers,
      desc: 'All group trip expenses and individual splits are aggregated from the database.',
      formula: 'Total Paid(u) and Total Share(u)',
    },
    {
      step: '02',
      title: 'Net Balance Calculation',
      icon: Scale,
      desc: 'Computes each member net financial position. Conservation ensures the sum of all nets equals zero.',
      formula: 'Net(u) = Total Paid - Fair Share',
    },
    {
      step: '03',
      title: 'Partition into Heaps',
      icon: GitFork,
      desc: 'Members are partitioned into Creditors (Net > 0) and Debtors (Net < 0) and sorted by magnitude.',
      formula: 'Creditors (descending) & Debtors (descending)',
    },
    {
      step: '04',
      title: 'Greedy Cash Matching',
      icon: ArrowRightLeft,
      desc: 'Match max debtor with max creditor, transferring min(|Debtor|, Creditor) until one reaches zero.',
      formula: 'Transfer = min(|Debtor.net|, Creditor.net)',
    },
    {
      step: '05',
      title: 'Optimal Settlement Path',
      icon: CheckCircle2,
      desc: 'Guarantees the entire group is 100% settled in at most N - 1 direct payments with zero circular debts.',
      formula: 'Total Transfers <= Members - 1',
    },
  ];

  return (
    <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md">
      <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          5-Step Settlement Algorithm Execution Flow
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Step-by-step algorithmic pipeline executed inside the SettleX Debt Minimization Engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/60 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary">
                  {item.step}
                </span>
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <span className="font-mono text-[10px] text-slate-400 block truncate">
                  {item.formula}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
