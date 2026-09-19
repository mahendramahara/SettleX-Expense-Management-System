import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, Info, ShieldCheck, Target, Calculator } from 'lucide-react';

export default function AnomalyAlgorithmInfoCard() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Cross-Circle Statistical Anomaly Detection Methodology
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluates individual spending disproportion across interconnected expense circles
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {isExpanded ? (
            <>
              Hide Theory <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Inspect Methodology <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200 text-xs">
          {/* Card 1: Multi-Circle Overspend Ratio */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-500" />
              1. Overspend Ratio (R)
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Calculated by summing total fronted payments{' '}
              <span className="font-mono font-bold">P_u</span> across all active groups divided by
              the sum of fair-share quotas:
            </p>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 text-center">
              R_u = P_u / &Sigma; ( V_g / N_g )
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Values &gt; 1.50x flag positive spending asymmetry; &gt; 2.50x trigger Critical
              status.
            </p>
          </div>

          {/* Card 2: Population Z-Score */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-purple-500" />
              2. Standard Score (Z-Score)
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Quantifies how many standard deviations a contributor's fronted volume deviates from
              the platform population mean:
            </p>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 font-mono text-[11px] text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-slate-800 text-center">
              Z_u = ( P_u - &mu; ) / &sigma;
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Z &gt; +1.5&sigma; indicates statistically significant divergence from peer norms.
            </p>
          </div>

          {/* Card 3: Dominance Index & Advisory Pipeline */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              3. Automated Advisory Pipeline
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              When a user covers &ge;50% of total volume across multiple circles, special financial
              advisories are synthesized:
            </p>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 text-center">
              Dominance = Count( P_u,g / V_g &ge; 0.50 )
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Provides actionable settlement prompts and liquidity warnings directly to the
              contributor.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
