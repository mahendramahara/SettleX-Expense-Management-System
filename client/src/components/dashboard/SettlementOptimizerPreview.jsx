import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, GitFork, RefreshCw, Zap, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function SettlementOptimizerPreview() {
  const [isOptimized, setIsOptimized] = useState(true);

  const rawTransactions = [
    { from: 'Rohan Shrestha', to: 'Aarav Gurung', amount: 1500 },
    { from: 'Aarav Gurung', to: 'Demo User', amount: 1500 },
    { from: 'Pooja Thapa', to: 'Rohan Shrestha', amount: 2000 },
    { from: 'Rohan Shrestha', to: 'Demo User', amount: 1000 },
    { from: 'Nikita Karki', to: 'Aarav Gurung', amount: 1200 },
    { from: 'Aarav Gurung', to: 'Pooja Thapa', amount: 800 },
  ];

  const optimizedTransactions = [
    { from: 'Rohan Shrestha', to: 'Demo User', amount: 2500 },
    { from: 'Nikita Karki', to: 'Pooja Thapa', amount: 1200 },
  ];

  const currentList = isOptimized ? optimizedTransactions : rawTransactions;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Intelligent Debt Settlement Optimizer
            </h3>
            <Badge variant="primary" size="sm">
              Greedy Cash Flow
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Graph cycle cancellation eliminates circular paths and minimizes total payment
            transfers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isOptimized ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setIsOptimized(!isOptimized)}
            icon={Zap}
          >
            {isOptimized ? 'View Raw Debts (6)' : 'Apply Greedy Optimization (2)'}
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Original Transactions
          </div>
          <div className="mt-1 text-xl font-black text-slate-700 dark:text-slate-300">6 Debts</div>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Optimized Transfers
          </div>
          <div className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">
            2 Transfers
          </div>
        </div>

        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Transaction Reduction
          </div>
          <div className="mt-1 text-xl font-black text-blue-600 dark:text-blue-400">
            66.7% Fewer
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {isOptimized ? 'Optimized Settlement Instructions' : 'Raw Bilateral Debt Graph'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentList.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-rose-600 dark:text-rose-400">{item.from}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-emerald-600 dark:text-emerald-400">{item.to}</span>
              </div>

              <div className="text-sm font-black text-slate-900 dark:text-white">
                Rs. {item.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
