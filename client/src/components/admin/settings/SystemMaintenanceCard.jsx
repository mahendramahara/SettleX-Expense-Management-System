import React, { useState } from 'react';
import {
  Wrench,
  Server,
  RefreshCw,
  Database,
  AlertOctagon,
  Download,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { settingsService } from '../../../services/settings.service';

export default function SystemMaintenanceCard({
  settings = {},
  onChange,
  canEdit = true,
  onNotify,
}) {
  const [runningAction, setRunningAction] = useState(null);

  const handleTriggerAction = async (actionType, actionLabel) => {
    try {
      setRunningAction(actionType);
      const res = await settingsService.triggerMaintenance(actionType);
      if (res && res.success) {
        if (onNotify) {
          onNotify({
            type: 'success',
            message: res.message || `${actionLabel} completed successfully.`,
          });
        }
      } else {
        throw new Error(res?.message || 'Maintenance action failed.');
      }
    } catch (err) {
      if (onNotify) {
        onNotify({
          type: 'error',
          message: err.message || `Failed to execute ${actionLabel}.`,
        });
      }
    } finally {
      setRunningAction(null);
    }
  };

  const handleSeedDatabase = async () => {
    try {
      setRunningAction('SEED_DATABASE');
      const res = await settingsService.seedDatabase();
      if (res && res.success) {
        if (onNotify) {
          onNotify({
            type: 'success',
            message: res.message || 'Database seeded successfully with groups and expenses.',
          });
        }
      } else {
        throw new Error(res?.message || 'Database seeding failed.');
      }
    } catch (err) {
      if (onNotify) {
        onNotify({
          type: 'error',
          message: err.message || 'Failed to seed database.',
        });
      }
    } finally {
      setRunningAction(null);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <Wrench className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            System Maintenance & Operational Hygiene
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Emergency maintenance mode, debt graph re-indexing, cache flushing, and database seeding
          </p>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        {/* Maintenance Mode Toggle */}
        <div
          className={`p-3.5 rounded-xl border transition-colors ${
            settings.maintenanceMode
              ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
              : 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">
                  System Maintenance Mode
                </span>
                {settings.maintenanceMode && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300">
                    Active
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Restricts regular user access and displays a global maintenance banner during
                critical migrations.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={Boolean(settings.maintenanceMode)}
                onChange={(e) => onChange({ maintenanceMode: e.target.checked })}
                disabled={!canEdit}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Maintenance Notice Input (Shown if maintenance mode enabled) */}
          {settings.maintenanceMode && (
            <div className="mt-3 pt-3 border-t border-rose-200 dark:border-rose-900/40">
              <label className="block text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider mb-1">
                Public Maintenance Notice
              </label>
              <input
                type="text"
                value={settings.maintenanceNotice || ''}
                onChange={(e) => onChange({ maintenanceNotice: e.target.value })}
                disabled={!canEdit}
                placeholder="Scheduled database optimization in progress. New submissions paused."
                className="w-full px-3 py-2 text-xs rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          )}
        </div>

        {/* Operational Maintenance Actions */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
            One-Click System Actions
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Flush Cache */}
            <button
              type="button"
              disabled={!canEdit || runningAction !== null}
              onClick={() => handleTriggerAction('CLEAR_CACHE', 'Cache Purge')}
              className="flex flex-col items-start justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition text-left group disabled:opacity-50 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                {runningAction === 'CLEAR_CACHE' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Flush Memory Cache
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Evicts stale aggregation keys
                </span>
              </div>
            </button>

            {/* Reindex Debt Graphs */}
            <button
              type="button"
              disabled={!canEdit || runningAction !== null}
              onClick={() => handleTriggerAction('REINDEX_DEBT_GRAPHS', 'Graph Reindexing')}
              className="flex flex-col items-start justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition text-left group disabled:opacity-50 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                {runningAction === 'REINDEX_DEBT_GRAPHS' ? (
                  <Database className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Database className="w-3.5 h-3.5" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Re-index Debt Graphs
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Syncs peer net balances
                </span>
              </div>
            </button>

            {/* Seed Database */}
            <button
              type="button"
              disabled={!canEdit || runningAction !== null}
              onClick={handleSeedDatabase}
              className="flex flex-col items-start justify-between p-3 rounded-xl border border-primary/30 dark:border-primary/40 bg-primary/5 dark:bg-primary/10 hover:border-primary/60 transition text-left group disabled:opacity-50 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                {runningAction === 'SEED_DATABASE' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                ) : (
                  <Database className="w-3.5 h-3.5 text-primary" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Seed Database Data
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Seeds groups & trip expenses
                </span>
              </div>
            </button>

            {/* Snapshot Database */}
            <button
              type="button"
              disabled={!canEdit || runningAction !== null}
              onClick={() => handleTriggerAction('DOWNLOAD_SNAPSHOT', 'System Snapshot')}
              className="flex flex-col items-start justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition text-left group disabled:opacity-50 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                {runningAction === 'DOWNLOAD_SNAPSHOT' ? (
                  <Download className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                  Generate Snapshot
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Prepares audit manifest
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
