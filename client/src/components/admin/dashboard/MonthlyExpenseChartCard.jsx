import React, { useState } from 'react';
import { BarChart3, ChevronDown } from 'lucide-react';

function buildSmoothPath(pts) {
  if (!pts || pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : pts.length - 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function buildAreaPath(pts, baseline = 145) {
  if (!pts || pts.length < 2) return '';
  const linePath = buildSmoothPath(pts);
  const first = pts[0];
  const last = pts[pts.length - 1];
  return `${linePath} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

export function MonthlyExpenseChartCard({ customPoints = null, className = '' }) {
  const [activePoint, setActivePoint] = useState(5);
  const [timeRange] = useState('Last 6 Months');

  const defaultPoints = [
    { month: 'Apr 2026', amount: 0, display: 'Rs. 0', x: 25, y: 145 },
    { month: 'May 2026', amount: 0, display: 'Rs. 0', x: 80, y: 145 },
    { month: 'Jun 2026', amount: 0, display: 'Rs. 0', x: 140, y: 145 },
    { month: 'Jul 2026', amount: 0, display: 'Rs. 0', x: 200, y: 145 },
    { month: 'Aug 2026', amount: 0, display: 'Rs. 0', x: 260, y: 145 },
    { month: 'Sep 2026', amount: 0, display: 'Rs. 0', x: 315, y: 145 },
  ];

  const points =
    Array.isArray(customPoints) && customPoints.length > 0 ? customPoints : defaultPoints;

  const maxVal = Math.max(...points.map((p) => p.amount || 0), 10000);
  const formatTick = (val) => {
    if (val >= 100000) return `${Math.round(val / 1000)}K`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return String(Math.round(val));
  };

  const yTicks = [
    { label: formatTick(maxVal), y: 20 },
    { label: formatTick(maxVal * 0.8), y: 45 },
    { label: formatTick(maxVal * 0.6), y: 70 },
    { label: formatTick(maxVal * 0.4), y: 95 },
    { label: formatTick(maxVal * 0.2), y: 120 },
    { label: '0', y: 145 },
  ];

  const active = points[activePoint] || points[points.length - 1] || points[0];
  const areaPath = buildAreaPath(points, 145);
  const linePath = buildSmoothPath(points);

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-colors h-full ${className}`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Monthly Expense Overview
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Aggregated transaction volume across all groups
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>{timeRange}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="pt-2 relative flex-1 flex flex-col justify-end min-h-[175px]">
        <div className="relative w-full h-44">
          <svg
            viewBox="0 0 340 160"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary-color, #3b82f6)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--primary-color, #3b82f6)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {yTicks.map((t) => (
              <g key={t.label + t.y}>
                <text
                  x="0"
                  y={t.y + 3}
                  className="fill-slate-400 dark:fill-slate-500 text-[9px] font-mono"
                >
                  {t.label}
                </text>
                <line
                  x1="25"
                  y1={t.y}
                  x2="335"
                  y2={t.y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800/80"
                  strokeWidth="1"
                />
              </g>
            ))}

            {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="var(--primary-color, #3b82f6)"
                strokeWidth="2.5"
              />
            )}

            {points.map((p, idx) => (
              <g key={p.month} onClick={() => setActivePoint(idx)} className="cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={activePoint === idx ? '5.5' : '3.5'}
                  fill="var(--primary-color, #3b82f6)"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all"
                />
              </g>
            ))}
          </svg>

          {active && (
            <div
              className="absolute pointer-events-none transition-all duration-200"
              style={{
                left: `${(active.x / 340) * 100}%`,
                top: `${(active.y / 160) * 100 - 8}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-primary/60 shadow-lg text-center whitespace-nowrap text-white">
                <span className="text-[10px] text-slate-300 block leading-tight">
                  {active.month}
                </span>
                <span className="text-xs font-bold text-white block leading-tight mt-0.5">
                  {active.display}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 pt-1.5 pl-6 pr-2">
          {points.map((p, idx) => (
            <button
              key={p.month}
              type="button"
              onClick={() => setActivePoint(idx)}
              className={`hover:text-primary transition-colors cursor-pointer ${
                activePoint === idx ? 'text-primary font-bold' : ''
              }`}
            >
              {p.month}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
