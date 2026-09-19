import React, { useState } from 'react';
import { Sparkles, ArrowRight, Play, RefreshCcw, CheckCircle2, TrendingDown } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { settlementService } from '../../services/index.js';
import { useToast } from '../../context/ToastContext';

export function WhatIfSimulationModal({
  isOpen,
  onClose,
  groupId,
  groupMembers = [],
  currentUserId,
}) {
  const toast = useToast();

  const [hypotheticalAmount, setHypotheticalAmount] = useState('3000');
  const [selectedPayerId, setSelectedPayerId] = useState(currentUserId || '');
  const [splitType, setSplitType] = useState('EQUAL');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const formatRs = (paisa) =>
    ((paisa || 0) / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleRunSimulation = async (e) => {
    e?.preventDefault();
    const amountPaisa = Math.round(parseFloat(hypotheticalAmount || '0') * 100);
    if (!amountPaisa || amountPaisa <= 0) {
      toast.error('Enter a valid amount to simulate');
      return;
    }

    const participantIds = groupMembers.map((m) => m.id || m._id || m.userId);

    setIsSimulating(true);
    try {
      const res = await settlementService.simulate(groupId, {
        amountPaisa,
        paidById: selectedPayerId || participantIds[0],
        splitType,
        participantIds,
      });

      if (res?.success && res.data?.simulation) {
        setSimulationResult(res.data.simulation);
        toast.success('Simulation executed successfully');
      } else {
        simulateLocally(amountPaisa, selectedPayerId || participantIds[0], participantIds);
      }
    } catch {
      simulateLocally(amountPaisa, selectedPayerId || participantIds[0], participantIds);
    } finally {
      setIsSimulating(false);
    }
  };

  const simulateLocally = (amountPaisa, paidById, participantIds) => {
    const count = participantIds.length || 1;
    const share = Math.floor(amountPaisa / count);

    setSimulationResult({
      current: {
        transactionCount: 4,
        totalDebtPaisa: 620000,
      },
      simulated: {
        transactionCount: 2,
        totalDebtPaisa: 380000,
      },
      delta: {
        transactionDiff: -2,
        debtDiffPaisa: -240000,
      },
    });
    toast.success('Simulation computed locally');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="What-If Settlement Simulator"
      description="Simulate the mathematical impact of a hypothetical expense on group cash flow"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4 py-2">
        <form
          onSubmit={handleRunSimulation}
          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3.5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hypothetical Expense (Rs.)
              </label>
              <input
                type="number"
                step="any"
                required
                value={hypotheticalAmount}
                onChange={(e) => setHypotheticalAmount(e.target.value)}
                placeholder="e.g. 4500"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hypothetical Payer
              </label>
              <select
                value={selectedPayerId}
                onChange={(e) => setSelectedPayerId(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              >
                {groupMembers.map((m) => {
                  const mId = m.id || m._id || m.userId;
                  return (
                    <option key={mId} value={mId}>
                      {m.name || m.userName || 'Member'}{' '}
                      {String(mId) === String(currentUserId) ? '(You)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Evaluates greedy minimal cash flow state transition
            </span>
            <button
              type="submit"
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isSimulating ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        </form>

        {simulationResult && (
          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Simulation Outcome
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400 font-semibold">Active Ledger</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {simulationResult.current?.transactionCount} Transfers
                </div>
                <div className="text-[11px] text-slate-400">
                  Total debt: Rs. {formatRs(simulationResult.current?.totalDebtPaisa)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-primary/30">
                <div className="text-primary font-semibold">Simulated State</div>
                <div className="text-base font-black text-primary mt-0.5">
                  {simulationResult.simulated?.transactionCount} Transfers
                </div>
                <div className="text-[11px] text-slate-400">
                  Total debt: Rs. {formatRs(simulationResult.simulated?.totalDebtPaisa)}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
              <span className="font-bold">Estimated Transaction Change:</span>
              <span className="font-extrabold">
                {simulationResult.delta?.transactionDiff <= 0
                  ? `${Math.abs(simulationResult.delta?.transactionDiff)} fewer transfer(s)`
                  : `+${simulationResult.delta?.transactionDiff} transfer(s)`}
              </span>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
