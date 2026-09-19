import React from 'react';
import { Activity, Server, Database, Cpu, Layers } from 'lucide-react';

const SYSTEM_ICONS = {
  'sys-api': Server,
  'sys-db': Database,
  'sys-ml': Cpu,
  'sys-jobs': Layers,
};

export function SystemHealthCard({ systems: customSystems = null, className = '' }) {
  const defaultSystems = [
    {
      id: 'sys-api',
      name: 'API Server',
      status: 'Online',
      meta: 'Uptime 99.98%',
    },
    {
      id: 'sys-db',
      name: 'Database',
      status: 'Online',
      meta: 'Response 12ms',
    },
    {
      id: 'sys-ml',
      name: 'ML Service',
      status: 'Online',
      meta: 'Model Loaded',
    },
    {
      id: 'sys-jobs',
      name: 'Background Jobs',
      status: 'Online',
      meta: 'Queue 0',
    },
  ];

  const systems =
    Array.isArray(customSystems) && customSystems.length > 0 ? customSystems : defaultSystems;

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-colors h-full ${className}`}
    >
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Activity className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            System Health
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Microservice infrastructure status
          </p>
        </div>
      </div>

      <div className="pt-3 divide-y divide-slate-100 dark:divide-slate-800/40 space-y-2 flex-1 flex flex-col justify-between">
        {systems.map((sys) => {
          const Icon = sys.icon || SYSTEM_ICONS[sys.id] || Server;
          return (
            <div key={sys.id} className="pt-2 first:pt-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                    {sys.name}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 block leading-tight mt-0.5 font-mono">
                    {sys.meta}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                <span>{sys.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
