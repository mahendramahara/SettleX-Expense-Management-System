import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Shield, Clock, User, Layers } from 'lucide-react';

export default function LogDetailsModal({ log, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !log) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Event Trace: {log.action}
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {log.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Event ID: {log.id}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Actor / Operator
              </span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {log.operator?.name || 'System'}
              </span>
              <span className="text-[11px] text-slate-400">
                {log.operator?.email || log.operator?.role || 'Internal'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Target Entity
              </span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {log.target?.model || 'System'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {log.target?.id || 'Global'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Timestamp
              </span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
              </span>
              <span className="text-[11px] text-slate-400">
                {log.relativeTime}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Execution Status
              </span>
              <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                {log.status || 'SUCCESS'}
              </span>
            </div>
          </div>

          {/* Action Summary */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Operation Summary
            </span>
            <p className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium">
              {log.summary}
            </p>
          </div>

          {/* Raw Payload Inspector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Raw JSON Payload & Context
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#090d16] border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-56">
              {JSON.stringify(log.details || log, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
