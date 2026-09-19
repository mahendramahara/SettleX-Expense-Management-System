import React, { useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

export function VolumeTrendChartCard({ trendData = [], range = '6m', onRangeChange }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Generate SVG path for spline area and stroke
  const points = trendData.map((d) => ({ x: d.x, y: d.y }));
  let linePath = '';
  let areaPath = '';

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      linePath += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    areaPath = `${linePath} L ${lastX} 160 L ${firstX} 160 Z`;
  }

  const peakPoint = trendData.reduce(
    (max, curr) => (curr.amount > max.amount ? curr : max),
    trendData[0] || { amount: 0, amountFormatted: 'Rs. 0', month: '' }
  );

  return (
    <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Financial Flow Velocity
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gross expenditure trends and transaction volumes over time.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
          <button
            onClick={() => onRangeChange?.('6m')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              range === '6m'
                ? 'bg-white dark:bg-[#0f172a] text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => onRangeChange?.('12m')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              range === '12m'
                ? 'bg-white dark:bg-[#0f172a] text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            12 Months
          </button>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full h-56 flex-1">
        <svg viewBox="0 0 360 170" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="adminAnalyticsAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="adminAnalyticsStrokeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          <line
            x1="20"
            y1="35"
            x2="340"
            y2="35"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800/80"
            strokeDasharray="3 3"
          />
          <line
            x1="20"
            y1="85"
            x2="340"
            y2="85"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800/80"
            strokeDasharray="3 3"
          />
          <line
            x1="20"
            y1="135"
            x2="340"
            y2="135"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800/80"
            strokeDasharray="3 3"
          />
          <line
            x1="20"
            y1="160"
            x2="340"
            y2="160"
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
          />

          {/* Area Fill */}
          {areaPath && <path d={areaPath} fill="url(#adminAnalyticsAreaGrad)" />}

          {/* Main Spline Curve */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#adminAnalyticsStrokeGrad)"
              strokeWidth="2.75"
              strokeLinecap="round"
            />
          )}

          {/* Interactive Data Points */}
          {trendData.map((d, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={d.x}
                  cy={d.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#8b5cf6' : '#6366f1'}
                  stroke="white"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredIndex !== null && trendData[hoveredIndex] && (
          <div
            className="absolute -top-3 pointer-events-none -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xl border border-slate-700 dark:border-slate-200 transition-all z-20 whitespace-nowrap"
            style={{ left: `${(trendData[hoveredIndex].x / 360) * 100}%` }}
          >
            <p className="font-bold">{trendData[hoveredIndex].amountFormatted}</p>
            <span className="text-[10px] opacity-80 block">
              {trendData[hoveredIndex].month} ({trendData[hoveredIndex].count} bills)
            </span>
          </div>
        )}
      </div>

      {/* Month Markers */}
      <div className="flex justify-between items-center px-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-medium text-slate-400">
        {trendData.map((d, idx) => (
          <span key={idx} className="text-center">
            {d.month}
          </span>
        ))}
      </div>

      {/* Bottom Telemetry Strip */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
          <span>Timeline View: {range.toUpperCase()} Interval</span>
        </div>
        {peakPoint && (
          <div className="text-slate-600 dark:text-slate-400">
            Peak Month:{' '}
            <strong className="text-slate-900 dark:text-white font-bold">{peakPoint.month}</strong>{' '}
            ({peakPoint.amountFormatted})
          </div>
        )}
      </div>
    </div>
  );
}
