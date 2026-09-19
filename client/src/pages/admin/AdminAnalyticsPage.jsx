import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, RotateCw, FolderKanban, Filter, X, Calendar } from 'lucide-react';
import { analyticsService } from '../../services/analytics.service';
import { groupService } from '../../services/group.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Import modular analytics subcomponents
import { AnalyticsKpiStrip } from '../../components/admin/analytics/AnalyticsKpiStrip';
import { VolumeTrendChartCard } from '../../components/admin/analytics/VolumeTrendChartCard';
import { CategoryExpenditureCard } from '../../components/admin/analytics/CategoryExpenditureCard';
import { SplitStrategyCard } from '../../components/admin/analytics/SplitStrategyCard';
import { TopTransactorsCard } from '../../components/admin/analytics/TopTransactorsCard';
import { DebtOptimizationMetricsCard } from '../../components/admin/analytics/DebtOptimizationMetricsCard';
import DEMO from '../../demo/data.json';

export function AdminAnalyticsPage() {
  const { user: currentAdmin, isGuest } = useAuth();
  const toast = useToast();

  const [analyticsData, setAnalyticsData] = useState(null);
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [range, setRange] = useState('6m');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load groups for dropdown filter
  const loadGroups = useCallback(async () => {
    if (isGuest) {
      setAllGroups(DEMO.admin?.groups || DEMO.groups || []);
      return;
    }
    try {
      const res = await groupService.getAll({ limit: 150 });
      const data = res?.data || res;
      if (data && Array.isArray(data.groups)) {
        setAllGroups(data.groups);
      }
    } catch {
      // Non-critical reference failure
    }
  }, [isGuest]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Load analytics telemetry
  const fetchAnalytics = useCallback(async () => {
    if (isGuest) {
      setAnalyticsData(DEMO.admin?.analytics || null);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await analyticsService.getAnalytics({
        range,
        groupId: selectedGroup,
      });

      const data = res?.data || res;
      if (data) {
        setAnalyticsData(data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch platform analytics');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isGuest, range, selectedGroup, toast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchAnalytics(), loadGroups()]);
    toast.info('Analytics metrics synchronized');
  };

  const watchedGroup = allGroups.find((g) => g.id === selectedGroup);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60">
              Intelligence Telemetry
            </span>
            {watchedGroup && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1">
                <FolderKanban className="w-3 h-3" />
                Filtered: {watchedGroup.name}
                <button
                  onClick={() => setSelectedGroup('')}
                  className="hover:text-emerald-950 dark:hover:text-white cursor-pointer ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Platform Analytics & Trends
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            High-level financial throughput, categorical breakdown, and algorithmic optimization
            performance.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Group Watcher Filter */}
          <div className="relative min-w-[200px]">
            <FolderKanban className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none cursor-pointer"
            >
              <option value="">Scope: All Groups</option>
              {allGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Sync Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Analytics"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-500' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>

      {isLoading && !analyticsData ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
          <RotateCw className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Compiling analytical reports and spline telemetry...
          </p>
        </div>
      ) : (
        <>
          {/* Executive KPI Cards */}
          <AnalyticsKpiStrip kpis={analyticsData?.kpis} />

          {/* Flow Trend & Category Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <VolumeTrendChartCard
                trendData={analyticsData?.monthlyTrend || []}
                range={range}
                onRangeChange={setRange}
              />
            </div>
            <div className="lg:col-span-5">
              <CategoryExpenditureCard categories={analyticsData?.categoryBreakdown || []} />
            </div>
          </div>

          {/* Split Strategy Adoption & Engine Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <SplitStrategyCard strategies={analyticsData?.splitStrategyDistribution || []} />
            </div>
            <div className="lg:col-span-7">
              <DebtOptimizationMetricsCard kpis={analyticsData?.kpis} />
            </div>
          </div>

          {/* Top Transactors & Circles Leaderboards */}
          <TopTransactorsCard
            topUsers={analyticsData?.topUsers || []}
            topCircles={analyticsData?.topCircles || []}
            onSelectCircle={(cId) => setSelectedGroup(cId)}
          />
        </>
      )}
    </div>
  );
}
