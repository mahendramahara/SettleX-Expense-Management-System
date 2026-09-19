import React from 'react';
import {
  X,
  Send,
  AlertTriangle,
  ShieldAlert,
  Users,
  Layers,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

export default function AnomalyInspectorModal({ anomaly, isOpen, onClose, onDraftAdvisory }) {
  if (!isOpen || !anomaly) return null;

  const u = anomaly.user || {};
  const initials = (u.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{u.name}</h3>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                    anomaly.severity === 'CRITICAL'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                      : anomaly.severity === 'ELEVATED'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                        : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50'
                  }`}
                >
                  {anomaly.severity} Variance
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {u.email} &bull; Cross-Circle Statistical Outlier Profile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Outlier Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                Total Fronted Capital
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {anomaly.totalPaidFormatted}
              </div>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                +{anomaly.overspendFormatted} beyond fair share
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                Peer Circle Fair Benchmark
              </span>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {anomaly.expectedFairShareFormatted}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Mean member target across {anomaly.totalGroupsCount} groups
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                Statistical Z-Score
              </span>
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                +{anomaly.zScore} &sigma;
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {anomaly.overspendRatio}x normal population rate
              </span>
            </div>
          </div>

          {/* Primary Factors */}
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-semibold text-xs uppercase tracking-wider mb-2">
              <AlertTriangle className="w-4 h-4" />
              Algorithm Diagnostic Drivers
            </div>
            <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-300/90 list-disc list-inside">
              {(anomaly.primaryFactors || []).map((factor, idx) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
          </div>

          {/* Group Breakdown Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Circle-By-Circle Contribution Matrix
              </h4>
              <span className="text-xs text-slate-400">
                {anomaly.groupBreakdown?.length || 0} Connected Group(s)
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Circle Name</th>
                    <th className="px-3 py-3">Members</th>
                    <th className="px-3 py-3">Circle Total</th>
                    <th className="px-3 py-3">User Paid</th>
                    <th className="px-3 py-3">Share %</th>
                    <th className="px-3 py-3 text-right">Dominance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {(anomaly.groupBreakdown || []).map((gb, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {gb.groupName}
                      </td>
                      <td className="px-3 py-3">{gb.memberCount} members</td>
                      <td className="px-3 py-3">{gb.groupTotalFormatted}</td>
                      <td className="px-3 py-3 font-medium text-slate-900 dark:text-white">
                        {gb.userPaidFormatted}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {gb.sharePercent}%
                          </span>
                          <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${Math.min(100, gb.sharePercent)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        {gb.isDominant ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                            Primary Payer (&ge;50%)
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Standard</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close Diagnostics
          </button>

          <button
            onClick={() => {
              onClose();
              onDraftAdvisory(anomaly);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Draft Advisory Notice to {u.name}
          </button>
        </div>
      </div>
    </div>
  );
}
