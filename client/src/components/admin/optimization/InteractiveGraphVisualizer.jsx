import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ArrowRightLeft, UserCheck, ShieldCheck } from 'lucide-react';

export function InteractiveGraphVisualizer({
  members = [],
  rawDebts = [],
  optimizedDebts = [],
  netBalances = [],
}) {
  const [activeStage, setActiveStage] = useState('OPTIMIZED');
  const [hoveredNode, setHoveredNode] = useState(null);

  const currentDebts = activeStage === 'RAW' ? rawDebts : optimizedDebts;

  const WIDTH = 520;
  const HEIGHT = 340;
  const CENTER_X = WIDTH / 2;
  const CENTER_Y = HEIGHT / 2;
  const RADIUS = 115;

  const nodePositions = new Map();
  const n = members.length;

  members.forEach((member, i) => {
    const angle = (2 * Math.PI * i) / Math.max(1, n) - Math.PI / 2;
    const x = Math.round(CENTER_X + RADIUS * Math.cos(angle));
    const y = Math.round(CENTER_Y + RADIUS * Math.sin(angle));
    nodePositions.set(member.id, { x, y, member });
  });

  const getBalance = (memberId) => {
    return netBalances.find((b) => b.userId === memberId || b.user?.id === memberId);
  };

  return (
    <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Settlement Money Flow Visualization
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              Live Flow
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize how individual trip expenses translate into minimal direct payments.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveStage('RAW')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeStage === 'RAW'
                ? 'bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Raw Peer Debts</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-bold">
              {rawDebts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveStage('OPTIMIZED')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeStage === 'OPTIMIZED'
                ? 'bg-white dark:bg-[#0f172a] text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Min Cash Flow</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
              {optimizedDebts.length}
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-950" />
          <span>Creditor (Gets money back)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-200 dark:ring-rose-950" />
          <span>Debtor (Owes money)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-400 ring-2 ring-slate-200 dark:ring-slate-800" />
          <span>Settled (Zero balance)</span>
        </div>
      </div>

      <div className="relative w-full h-84 flex items-center justify-center bg-slate-50/40 dark:bg-slate-900/30 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800/60">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full">
          <defs>
            <marker
              id="graphArrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
            </marker>
            <marker
              id="graphArrowHover"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
          </defs>

          {currentDebts.map((debt, idx) => {
            const fromId = debt.from?.id || debt.fromUserId || debt.from;
            const toId = debt.to?.id || debt.toUserId || debt.to;
            const fromPos = nodePositions.get(fromId);
            const toPos = nodePositions.get(toId);
            if (!fromPos || !toPos) return null;

            const isHighlighted =
              hoveredNode && (hoveredNode === fromId || hoveredNode === toId);

            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const normalX = -dy * 0.16;
            const normalY = dx * 0.16;
            const ctrlX = midX + normalX;
            const ctrlY = midY + normalY;

            return (
              <g key={idx} className="transition-all duration-300">
                <path
                  d={`M ${fromPos.x} ${fromPos.y} Q ${ctrlX} ${ctrlY} ${toPos.x} ${toPos.y}`}
                  fill="none"
                  stroke={isHighlighted ? '#10b981' : '#6366f1'}
                  strokeWidth={isHighlighted ? '2.5' : '1.75'}
                  markerEnd={isHighlighted ? 'url(#graphArrowHover)' : 'url(#graphArrow)'}
                  className="opacity-80 transition-all duration-200"
                />

                <rect
                  x={ctrlX - 32}
                  y={ctrlY - 10}
                  width="64"
                  height="20"
                  rx="6"
                  className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-700"
                  strokeWidth="1"
                />
                <text
                  x={ctrlX}
                  y={ctrlY + 4}
                  textAnchor="middle"
                  className="text-[10px] font-bold fill-slate-800 dark:fill-slate-200 select-none pointer-events-none"
                >
                  {debt.amountFormatted}
                </text>
              </g>
            );
          })}

          {members.map((member) => {
            const pos = nodePositions.get(member.id);
            if (!pos) return null;
            const isHovered = hoveredNode === member.id;
            const bal = getBalance(member.id);
            const isCreditor = (bal?.netBalancePaisa || 0) > 0;
            const isDebtor = (bal?.netBalancePaisa || 0) < 0;

            return (
              <g
                key={member.id}
                onMouseEnter={() => setHoveredNode(member.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-transform duration-200"
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="22"
                  className={`transition-all duration-200 ${
                    isHovered
                      ? 'fill-indigo-100/60 dark:fill-indigo-950/60 stroke-indigo-500'
                      : isCreditor
                        ? 'fill-emerald-50 dark:fill-emerald-950/40 stroke-emerald-500'
                        : isDebtor
                          ? 'fill-rose-50 dark:fill-rose-950/40 stroke-rose-500'
                          : 'fill-slate-100 dark:fill-slate-800 stroke-slate-400'
                  }`}
                  strokeWidth={isHovered ? '2.5' : '2'}
                />

                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  className="text-xs font-bold fill-slate-900 dark:fill-white select-none pointer-events-none"
                >
                  {(member.name || 'M')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </text>

                <text
                  x={pos.x}
                  y={pos.y + 34}
                  textAnchor="middle"
                  className="text-[11px] font-bold fill-slate-800 dark:fill-slate-200 select-none pointer-events-none"
                >
                  {member.name}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredNode && (
          <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs shadow-lg">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {members.find((m) => m.id === hoveredNode)?.name}
            </span>
            {getBalance(hoveredNode) && (
              <span
                className={`ml-2 font-extrabold ${
                  (getBalance(hoveredNode).netBalancePaisa || 0) > 0
                    ? 'text-emerald-600'
                    : (getBalance(hoveredNode).netBalancePaisa || 0) < 0
                      ? 'text-rose-600'
                      : 'text-slate-500'
                }`}
              >
                {(getBalance(hoveredNode).netBalancePaisa || 0) > 0 ? '+' : ''}
                {getBalance(hoveredNode).netBalanceFormatted} (
                {(getBalance(hoveredNode).netBalancePaisa || 0) > 0
                  ? 'Creditor - gets money back'
                  : (getBalance(hoveredNode).netBalancePaisa || 0) < 0
                    ? 'Debtor - owes money'
                    : 'Settled'}
                )
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Viva Explanation: {activeStage === 'RAW' ? 'Peer-to-Peer Overhead' : 'Greedy Cash Flow Efficiency'}</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
          {activeStage === 'RAW' ? (
            <span>
              Without algorithmic optimization, every single expense split results in separate debts between pairs of people. In a trip with N members, this can create up to N x (N - 1) transactions, creating unnecessary banking transfers and confusion.
            </span>
          ) : (
            <span>
              With Greedy Cash Flow Minimization, SettleX aggregates everyone's spending into net balances. By greedily matching the person who owes the most with the person who is owed the most, we settle all group debts in at most N - 1 direct payments with zero circular debt.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
