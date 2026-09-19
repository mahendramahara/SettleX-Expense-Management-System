import React, { useState, useEffect, useCallback } from 'react';
import { RotateCw, Scale } from 'lucide-react';
import { groupService, analyticsService } from '../../services/index.js';
import { useToast } from '../../context/ToastContext';

import { DatabaseGroupSelector } from '../../components/admin/optimization/DatabaseGroupSelector';
import { OptimizationKpiCards } from '../../components/admin/optimization/OptimizationKpiCards';
import { InteractiveGraphVisualizer } from '../../components/admin/optimization/InteractiveGraphVisualizer';
import { InteractiveDebtSandbox } from '../../components/admin/optimization/InteractiveDebtSandbox';
import { AlgorithmStepByStepTracer } from '../../components/admin/optimization/AlgorithmStepByStepTracer';

export function AdminDebtOptimizationPage() {
  const toast = useToast();

  const [benchmarkData, setBenchmarkData] = useState(null);
  const [sandboxResults, setSandboxResults] = useState(null);
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSelectGroup = useCallback(async (groupId) => {
    if (!groupId) return;
    const targetId = String(groupId);
    setSelectedGroup(targetId);
    try {
      setIsExecuting(true);
      const res = await analyticsService.runAlgorithmSandbox({
        scenario: 'live',
        groupId: targetId,
      });
      const data = res?.data || res;
      if (data) {
        setSandboxResults(data);
      }
    } catch (err) {
      console.error('Failed to calculate group settlements:', err);
    } finally {
      setIsExecuting(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        setIsLoading(true);
        const [groupsRes, benchRes] = await Promise.all([
          groupService.getAll({ limit: 150 }),
          analyticsService.getAlgorithmBenchmark(),
        ]);
        if (!isMounted) return;

        const benchData = benchRes?.data || benchRes;
        if (benchData) setBenchmarkData(benchData);

        const groupData = groupsRes?.data || groupsRes;
        if (groupData && Array.isArray(groupData.groups) && groupData.groups.length > 0) {
          setAllGroups(groupData.groups);
          const firstId = String(groupData.groups[0].id || groupData.groups[0]._id);
          setSelectedGroup(firstId);

          const sandboxRes = await analyticsService.runAlgorithmSandbox({
            scenario: 'live',
            groupId: firstId,
          });
          if (isMounted && sandboxRes) {
            setSandboxResults(sandboxRes?.data || sandboxRes);
          }
        }
      } catch (err) {
        console.error('Failed to initialize debt optimization page:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [benchRes] = await Promise.all([
        analyticsService.getAlgorithmBenchmark(),
        handleSelectGroup(selectedGroup),
      ]);
      const benchData = benchRes?.data || benchRes;
      if (benchData) setBenchmarkData(benchData);
      toast.info('Settlement calculations and database balances refreshed');
    } catch (err) {
      console.error('Failed to refresh balances:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
              <Scale className="w-3 h-3" />
              Minimum Cash Flow Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
              Live Database Linked
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Settlement Calculation & Debt Minimization
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track group trip expenses, individual contributions, who paid the most versus least, and settle all debts using Greedy Cash Flow Minimization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Recalculate Balances"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            <span className="hidden sm:inline">Refresh Live Balances</span>
          </button>
        </div>
      </div>

      {/* 1. Group Selector Component on TOP of visualizer */}
      <DatabaseGroupSelector
        allGroups={allGroups}
        selectedGroup={selectedGroup}
        onSelectGroup={handleSelectGroup}
        isExecuting={isExecuting}
      />

      {/* 2. Algorithm KPIs & Upper-bound summary */}
      <OptimizationKpiCards
        kpis={benchmarkData?.kpis}
        liveSummary={sandboxResults?.summary}
      />

      {/* 3. Interactive Graph Visualizer */}
      <InteractiveGraphVisualizer
        members={sandboxResults?.members || []}
        rawDebts={sandboxResults?.initialDebts || []}
        optimizedDebts={sandboxResults?.greedyOptimized || []}
        netBalances={sandboxResults?.netBalances || []}
      />

      {/* 4. Most Payer, Least Payer, Net Balances, and Direct Transfers BELOW visualizer */}
      <InteractiveDebtSandbox
        allGroups={allGroups}
        selectedGroup={selectedGroup}
        onSelectGroup={handleSelectGroup}
        onRunScenario={(sc, gid) => handleSelectGroup(gid || selectedGroup)}
        isExecuting={isExecuting}
        sandboxResults={sandboxResults}
      />

      {/* 5. Algorithmic Execution Pipeline Flow */}
      <AlgorithmStepByStepTracer />
    </div>
  );
}
export default AdminDebtOptimizationPage;
