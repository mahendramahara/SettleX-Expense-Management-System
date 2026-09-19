import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShieldAlert, RotateCw, Sparkles, Filter, AlertTriangle } from 'lucide-react';
import { analyticsService } from '../../services/analytics.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DEMO from '../../demo/data.json';

// Modular anomaly subcomponents
import AnomalyKpiCards from '../../components/admin/anomaly/AnomalyKpiCards';
import AnomalyDetectionTable from '../../components/admin/anomaly/AnomalyDetectionTable';
import AnomalyInspectorModal from '../../components/admin/anomaly/AnomalyInspectorModal';
import SendAdvisoryModal from '../../components/admin/anomaly/SendAdvisoryModal';
import AnomalyAlgorithmInfoCard from '../../components/admin/anomaly/AnomalyAlgorithmInfoCard';

export function AdminAnomalyDetectionPage() {
  const { user: currentAdmin, isGuest } = useAuth();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingAdvisory, setIsSendingAdvisory] = useState(false);

  const [summary, setSummary] = useState({
    totalAnalyzed: 0,
    anomaliesCount: 0,
    severeCount: 0,
    elevatedCount: 0,
    moderateCount: 0,
    totalDisproportionPaisa: 0,
    totalDisproportionFormatted: 'Rs. 0',
    averageDeviationPercent: 0,
    totalAdvisoriesDispatched: 0,
  });

  const [anomalies, setAnomalies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [threshold, setThreshold] = useState('1.5');

  // Modal States
  const [inspectingAnomaly, setInspectingAnomaly] = useState(null);
  const [advisoryTargetAnomaly, setAdvisoryTargetAnomaly] = useState(null);

  // Load real anomalies from backend or demo
  const fetchAnomalies = useCallback(async () => {
    if (isGuest) {
      const demoAnomalies = DEMO.admin?.anomalies || { summary: {}, anomalies: [] };
      setSummary(demoAnomalies.summary || {
        totalAnalyzed: 0,
        anomaliesCount: 0,
        severeCount: 0,
        elevatedCount: 0,
        moderateCount: 0,
        totalDisproportionPaisa: 0,
        totalDisproportionFormatted: 'Rs. 0',
        averageDeviationPercent: 0,
        totalAdvisoriesDispatched: 0,
      });
      let list = demoAnomalies.anomalies || [];
      if (severityFilter !== 'all') {
        list = list.filter((a) => a.severity?.toLowerCase() === severityFilter.toLowerCase());
      }
      setAnomalies(list);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await analyticsService.getAnomalies({
        threshold,
        severity: severityFilter,
      });

      if (res && res.data) {
        setSummary(res.data.summary || {
          totalAnalyzed: 0,
          anomaliesCount: 0,
          severeCount: 0,
          elevatedCount: 0,
          moderateCount: 0,
          totalDisproportionPaisa: 0,
          totalDisproportionFormatted: 'Rs. 0',
          averageDeviationPercent: 0,
          totalAdvisoriesDispatched: 0,
        });
        setAnomalies(res.data.anomalies || []);
      }
    } catch (err) {
      console.warn('Failed to fetch live anomalies from server', err);
      toast.error(err?.message || 'Could not load anomalies from database');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isGuest, threshold, severityFilter, toast]);

  useEffect(() => {
    fetchAnomalies();
  }, [fetchAnomalies]);

  // On-demand deep algorithmic scan triggered by admin
  const handleRunScan = async () => {
    if (isGuest) {
      setIsRefreshing(true);
      setTimeout(() => {
        setIsRefreshing(false);
        toast.info('Simulated heuristic scan completed on demo dataset.');
      }, 500);
      return;
    }

    try {
      setIsRefreshing(true);
      const res = await analyticsService.runAnomalyScan({ threshold, severity: severityFilter });
      if (res && res.data) {
        setSummary(res.data.summary || summary);
        setAnomalies(res.data.anomalies || []);
        toast.success(res.message || 'System-wide algorithmic scan completed successfully');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to execute system anomaly scan');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAnomalies();
    toast.info('Anomaly detection engine refreshed');
  };

  const handleStatusChange = async (id, status) => {
    if (isGuest) {
      setAnomalies((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
      toast.info(`Anomaly marked as ${status} (Demo Mode)`);
      return;
    }

    try {
      await analyticsService.updateAnomalyStatus(id, { status });
      setAnomalies((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
      toast.success(`Anomaly marked as ${status}`);
    } catch (err) {
      toast.error(err?.message || 'Failed to update anomaly status');
    }
  };

  const handleDispatchAdvisory = async (advisoryPayload) => {
    if (isGuest) {
      setAdvisoryTargetAnomaly(null);
      toast.info('Spending advisory dispatch simulated in guest preview mode.');
      return;
    }

    try {
      setIsSendingAdvisory(true);
      const res = await analyticsService.dispatchAdvisory({
        ...advisoryPayload,
        anomalyId: advisoryTargetAnomaly?.id,
      });
      const data = res?.data || res;
      const recipient = data?.recipientEmail || advisoryTargetAnomaly?.user?.email || '';
      const emailNote = recipient ? ` and alert email dispatched to ${recipient}` : '';
      toast.success(
        `Spending advisory${emailNote} sent successfully to ${advisoryTargetAnomaly?.user?.name || 'user'}`
      );
      setAdvisoryTargetAnomaly(null);
      // Update local count and status to ADVISED
      setAnomalies((prev) =>
        prev.map((item) =>
          item.id === advisoryTargetAnomaly?.id
            ? { ...item, advisoriesSentCount: (item.advisoriesSentCount || 0) + 1, status: 'ADVISED' }
            : item
        )
      );
      setSummary((prev) => ({
        ...prev,
        totalAdvisoriesDispatched: (prev.totalAdvisoriesDispatched || 0) + 1,
      }));
    } catch (err) {
      toast.error(err?.message || 'Failed to dispatch advisory');
    } finally {
      setIsSendingAdvisory(false);
    }
  };

  const [page, setPage] = useState(1);
  const limit = 10;

  // Filter anomalies based on search text
  const filteredAnomalies = useMemo(() => {
    let result = anomalies;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((a) => {
        const name = (a.user?.name || '').toLowerCase();
        const email = (a.user?.email || '').toLowerCase();
        const groups = (a.groupBreakdown || [])
          .map((g) => (g.groupName || '').toLowerCase())
          .join(' ');
        return name.includes(q) || email.includes(q) || groups.includes(q);
      });
    }
    return result;
  }, [anomalies, searchQuery]);

  const counts = useMemo(() => {
    return {
      total: anomalies.length,
      critical: anomalies.filter((a) => a.severity === 'CRITICAL').length,
      elevated: anomalies.filter((a) => a.severity === 'ELEVATED').length,
      moderate: anomalies.filter((a) => a.severity === 'MODERATE').length,
    };
  }, [anomalies]);

  const totalPages = Math.max(1, Math.ceil(filteredAnomalies.length / limit));
  const paginatedAnomalies = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredAnomalies.slice(start, start + limit);
  }, [filteredAnomalies, page, limit]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header matching Users and Staff */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Anomaly Detection
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cross-circle asymmetric spending heuristics, statistical variance, and advisory
                dispatch
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRunScan}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Execute deep statistical scan across all groups and persist findings"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRefreshing ? 'Scanning Database...' : 'Run Algorithmic Scan'}</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            title="Reload from Database"
            className="p-2 rounded-xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <AnomalyKpiCards summary={summary} isLoading={isLoading} />

      {/* Algorithm Methodology Card */}
      <AnomalyAlgorithmInfoCard />

      {/* Unified Table Card matching Users and Staff */}
      <AnomalyDetectionTable
        anomalies={paginatedAnomalies}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(1);
        }}
        severityFilter={severityFilter}
        onSeverityChange={(val) => {
          setSeverityFilter(val);
          setPage(1);
        }}
        threshold={threshold}
        onThresholdChange={setThreshold}
        counts={counts}
        onInspect={(anomaly) => setInspectingAnomaly(anomaly)}
        onOpenAdvisory={(anomaly) => setAdvisoryTargetAnomaly(anomaly)}
        onUpdateStatus={handleStatusChange}
        pagination={{
          page,
          limit,
          total: filteredAnomalies.length,
          totalPages,
        }}
        onPageChange={setPage}
      />

      {/* Inspector Modal */}
      <AnomalyInspectorModal
        anomaly={inspectingAnomaly}
        isOpen={Boolean(inspectingAnomaly)}
        onClose={() => setInspectingAnomaly(null)}
        onDraftAdvisory={(anomaly) => setAdvisoryTargetAnomaly(anomaly)}
      />

      {/* Send Advisory Modal */}
      <SendAdvisoryModal
        anomaly={advisoryTargetAnomaly}
        isOpen={Boolean(advisoryTargetAnomaly)}
        onClose={() => setAdvisoryTargetAnomaly(null)}
        onSendAdvisory={handleDispatchAdvisory}
        isSending={isSendingAdvisory}
      />
    </div>
  );
}

export default AdminAnomalyDetectionPage;
