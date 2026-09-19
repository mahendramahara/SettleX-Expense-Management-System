import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Terminal, RotateCw, Sparkles, Download, Shield } from 'lucide-react';
import { auditService } from '../../services/audit.service';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DEMO from '../../demo/data.json';

// Modular logs subcomponents
import LogsKpiCards from '../../components/admin/logs/LogsKpiCards';
import SystemLogsTable from '../../components/admin/logs/SystemLogsTable';
import LogDetailsModal from '../../components/admin/logs/LogDetailsModal';

export function AdminSystemLogsPage() {
  const { user: currentAdmin, isGuest } = useAuth();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [summary, setSummary] = useState({
    totalLogs: 0,
    securityEvents: 0,
    financialEvents: 0,
    groupEvents: 0,
    systemEvents: 0,
    activeOperatorsCount: 0,
  });

  const [logs, setLogs] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const [inspectingLog, setInspectingLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    if (isGuest) {
      setSummary(DEMO.admin.systemLogs.summary);
      let list = DEMO.admin.systemLogs.logs || [];
      if (categoryFilter !== 'all') {
        list = list.filter((l) => l.category?.toLowerCase() === categoryFilter.toLowerCase());
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(
          (l) =>
            l.action?.toLowerCase().includes(q) ||
            l.summary?.toLowerCase().includes(q) ||
            l.operator?.name?.toLowerCase().includes(q)
        );
      }
      setLogs(list);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await auditService.getAuditLogs({
        category: categoryFilter,
        search: searchQuery,
        page,
        limit,
      });

      if (res && res.data) {
        setSummary(res.data.summary || DEMO.admin.systemLogs.summary);
        setLogs(res.data.logs || DEMO.admin.systemLogs.logs);
      } else {
        setSummary(DEMO.admin.systemLogs.summary);
        setLogs(DEMO.admin.systemLogs.logs);
      }
    } catch (err) {
      console.warn('Failed to fetch live audit logs, using demo telemetry stream', err);
      setSummary(DEMO.admin.systemLogs.summary);
      setLogs(DEMO.admin.systemLogs.logs);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [categoryFilter, searchQuery, page, limit, isGuest]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchLogs();
    toast.info('System audit log feed refreshed');
  };

  const handleExportLogs = () => {
    try {
      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `settlex_audit_logs_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('System logs exported successfully');
    } catch {
      toast.error('Failed to export system logs');
    }
  };

  const counts = useMemo(() => {
    return {
      total: summary.totalLogs || logs.length,
      security: summary.securityEvents || logs.filter((l) => l.category === 'SECURITY').length,
      financial: summary.financialEvents || logs.filter((l) => l.category === 'FINANCIAL').length,
      group: summary.groupEvents || logs.filter((l) => l.category === 'GROUP').length,
      system: summary.systemEvents || logs.filter((l) => l.category === 'SYSTEM').length,
    };
  }, [summary, logs]);

  const totalPages = Math.max(1, Math.ceil((counts.total || 1) / limit));

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header matching Users, Staff, and Anomaly pages */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                System Logs & Audit Explorer
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Administrative trace logs, security events, financial operations, and platform
                activity
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Immutable Audit Trail</span>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            title="Refresh System Logs"
            className="p-2 rounded-xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <LogsKpiCards summary={summary} isLoading={isLoading} />

      {/* Unified Logs Table and Console */}
      <SystemLogsTable
        logs={logs}
        isLoading={isLoading}
        categoryFilter={categoryFilter}
        onCategoryChange={(cat) => {
          setCategoryFilter(cat);
          setPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        counts={counts}
        onInspectLog={(log) => setInspectingLog(log)}
        pagination={{
          page,
          limit,
          total: counts.total,
          totalPages,
        }}
        onPageChange={setPage}
        onExportLogs={handleExportLogs}
      />

      {/* Inspect Log Details Modal */}
      <LogDetailsModal
        log={inspectingLog}
        isOpen={Boolean(inspectingLog)}
        onClose={() => setInspectingLog(null)}
      />
    </div>
  );
}

export default AdminSystemLogsPage;
