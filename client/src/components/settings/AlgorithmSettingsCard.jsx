import React, { useState } from 'react';
import { GitFork, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function AlgorithmSettingsCard() {
  const { isGuest } = useAuth();
  const toast = useToast();

  const [algorithmMode, setAlgorithmMode] = useState('greedy');
  const [autoCancelCycles, setAutoCancelCycles] = useState(true);
  const [enforceZeroSum, setEnforceZeroSum] = useState(true);

  const handleSave = () => {
    if (isGuest) {
      toast.warning('Please log in to save algorithm settings.');
      return;
    }
    toast.success('Algorithm routing preferences saved');
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Settlement Engine & Graph Theory
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">BCA Final Project Engine</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Settlement Optimization Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAlgorithmMode('greedy')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                algorithmMode === 'greedy'
                  ? 'border-primary bg-primary/10 text-primary shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold flex items-center justify-between">
                <span>Greedy Cash Flow</span>
                {algorithmMode === 'greedy' && <CheckCircle2 className="w-4 h-4" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Minimizes number of transactions to at most V-1 transfers using greedy heap matching.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setAlgorithmMode('cycle')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                algorithmMode === 'cycle'
                  ? 'border-primary bg-primary/10 text-primary shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold flex items-center justify-between">
                <span>DFS Cycle Reduction</span>
                {algorithmMode === 'cycle' && <CheckCircle2 className="w-4 h-4" />}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Detects circular debt loops (A → B → C → A) and cancels bottle-neck flow values.
              </p>
            </button>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Auto-Execute Cycle Cancellation
            </div>
            <div className="text-[11px] text-slate-400">
              Run cycle elimination automatically when inspecting group settlement tabs
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAutoCancelCycles(!autoCancelCycles)}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer ${
              autoCancelCycles ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                autoCancelCycles ? 'left-5.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Integer Paisa Invariant Enforcer</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                Active
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Forces all ledger math to store integer paisa (100 Paisa = 1 NPR), preventing float drift
            </div>
          </div>

          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </div>

        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-sm transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Apply Algorithm Settings
          </button>
        </div>
      </div>
    </div>
  );
}
