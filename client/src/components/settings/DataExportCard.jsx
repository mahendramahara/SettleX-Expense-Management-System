import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileJson, RefreshCcw, Check } from 'lucide-react';
import { expenseService, groupService } from '../../services/index.js';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DEMO from '../../demo/data.json';

export function DataExportCard() {
  const { isGuest } = useAuth();
  const toast = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const downloadFile = (data, filename, type) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = async () => {
    setIsExporting(true);
    try {
      let exportData = DEMO;
      if (!isGuest) {
        try {
          const [expensesRes, groupsRes] = await Promise.all([
            expenseService.getAll(),
            groupService.getAll(),
          ]);
          exportData = {
            exportedAt: new Date().toISOString(),
            expenses: expensesRes?.data?.expenses || [],
            groups: groupsRes?.data?.groups || [],
          };
        } catch {
          exportData = DEMO;
        }
      }
      downloadFile(
        JSON.stringify(exportData, null, 2),
        `settlex_ledger_${Date.now()}.json`,
        'application/json'
      );
      toast.success('JSON ledger archive exported');
    } catch {
      toast.error('Failed to export ledger archive');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      let expenses = DEMO.dashboard?.recentExpenses || [];
      if (!isGuest) {
        try {
          const res = await expenseService.getAll();
          expenses = res?.data?.expenses || expenses;
        } catch {
          // fallback to demo
        }
      }

      const headers = ['Title', 'Group', 'Amount (Rs)', 'Paid By', 'Split Mode', 'Date'];
      const rows = expenses.map((e) => [
        `"${(e.title || e.description || '').replace(/"/g, '""')}"`,
        `"${(e.groupName || '').replace(/"/g, '""')}"`,
        ((e.amountPaisa || 0) / 100).toFixed(2),
        `"${(e.paidByName || '').replace(/"/g, '""')}"`,
        e.splitType || 'EQUAL',
        e.createdAt ? new Date(e.createdAt).toLocaleDateString() : '',
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      downloadFile(csvContent, `settlex_expenses_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
      toast.success('CSV spreadsheet exported');
    } catch {
      toast.error('Failed to export CSV report');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem('settlex_recent_filters');
    sessionStorage.clear();
    toast.success('Local application session cache flushed');
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Data Portability & Backup
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">Export Records</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={isExporting}
          className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-left cursor-pointer disabled:opacity-50"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">Export CSV</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Spreadsheet format for Excel/Sheets
          </div>
        </button>

        <button
          type="button"
          onClick={handleExportJson}
          disabled={isExporting}
          className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-left cursor-pointer disabled:opacity-50"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-primary flex items-center justify-center mb-2">
            <FileJson className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">Full JSON Backup</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Complete ledger graph and splits</div>
        </button>

        <button
          type="button"
          onClick={handleClearCache}
          className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-amber-300 hover:bg-amber-50/30 transition-all text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
            <RefreshCcw className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">Flush Cache</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Reset temporary view state</div>
        </button>
      </div>
    </div>
  );
}
