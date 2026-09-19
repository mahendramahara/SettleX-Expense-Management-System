import React, { useState } from 'react';
import { GitFork, ArrowRight, Zap, RefreshCw, Layers } from 'lucide-react';

export function DebtGraphVisualizer({
  optimizedTransactions = [],
  simplifiedEdges = [],
  onRunCycleCancellation,
  isSimplifying,
}) {
  const [activeView, setActiveView] = useState('greedy');

  const activeEdges = activeView === 'greedy' ? optimizedTransactions : simplifiedEdges;

  const formatRs = (paisa) =>
    ((paisa || 0) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Graph Optimization Engine
          </h3>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveView('greedy')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'greedy'
                ? 'bg-white dark:bg-slate-900 text-primary shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Greedy Cash Flow ({optimizedTransactions.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('cycle');
              if (simplifiedEdges.length === 0) {
                onRunCycleCancellation?.();
              }
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'cycle'
                ? 'bg-white dark:bg-slate-900 text-primary shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Cycle Cancellation ({simplifiedEdges.length})
          </button>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            {activeView === 'greedy'
              ? 'Greedy Net Cash Flow matches maximal debtors with maximal creditors to reach zero sum in O(V log V) steps.'
              : 'DFS Cycle Cancellation detects closed debt loops (A -> B -> C -> A) and subtracts bottle-neck values.'}
          </span>
        </div>

        {activeView === 'cycle' && onRunCycleCancellation && (
          <button
            type="button"
            onClick={onRunCycleCancellation}
            disabled={isSimplifying}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimplifying ? 'animate-spin' : ''}`} />
            Re-run Cycle Engine
          </button>
        )}
      </div>

      {activeEdges.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          All group debts are fully balanced and settled. No pending transfers detected.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activeEdges.map((edge, idx) => {
            const sender =
              edge.fromName ||
              edge.fromUserName ||
              (typeof edge.from === 'object' ? edge.from?.name : edge.from) ||
              'Debtor';
            const recipient =
              edge.toName ||
              edge.toUserName ||
              (typeof edge.to === 'object' ? edge.to?.name : edge.to) ||
              'Creditor';

            return (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    {sender}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    {recipient}
                  </span>
                </div>

                <div className="font-extrabold text-primary shrink-0">
                  Rs. {formatRs(edge.amountPaisa)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
