import React, { useState, useMemo } from 'react';
import {
  RotateCw,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Scale,
  PlusCircle,
  Wallet,
  Receipt,
} from 'lucide-react';
import { Avatar } from '../../ui/Avatar';

export function InteractiveDebtSandbox({
  allGroups = [],
  selectedGroup,
  onSelectGroup,
  onRunScenario,
  isExecuting = false,
  sandboxResults = null,
}) {
  const [simPaidBy, setSimPaidBy] = useState('');
  const [simAmount, setSimAmount] = useState('3000');
  const [simTitle, setSimTitle] = useState('Snacks & Travel');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationDiff, setSimulationDiff] = useState(null);

  const members = sandboxResults?.members || [];
  const netBalances = sandboxResults?.netBalances || [];
  const greedyOptimized = sandboxResults?.greedyOptimized || [];
  const topCreditor = sandboxResults?.topCreditor;
  const topDebtor = sandboxResults?.topDebtor;
  const breakdown = sandboxResults?.breakdown;
  const topPayer = sandboxResults?.topPayer || breakdown?.topPayer;
  const lowestPayer = sandboxResults?.lowestPayer || breakdown?.lowestPayer;

  const breakdownMemberMap = useMemo(() => {
    const map = new Map();
    if (breakdown?.members) {
      breakdown.members.forEach((m) => map.set(String(m.userId), m));
    }
    return map;
  }, [breakdown]);

  const currentSelectedGroupObj = allGroups.find(
    (g) => String(g.id || g._id) === String(selectedGroup)
  );

  const handleGroupSelect = (gId) => {
    onSelectGroup?.(gId);
    setSimulationDiff(null);
    onRunScenario?.('live', gId);
  };

  const handleSimulate = () => {
    if (!members.length) return;
    setIsSimulating(true);
    const amountNum = parseFloat(simAmount) || 0;
    const amountPaisa = Math.round(amountNum * 100);
    const payerId = simPaidBy || members[0]?.id;
    const sharePaisa = Math.round(amountPaisa / members.length);

    const simulatedBalances = netBalances.map((b) => {
      const isPayer = b.userId === payerId;
      const netDelta = (isPayer ? amountPaisa : 0) - sharePaisa;
      const newNet = (b.netBalancePaisa || 0) + netDelta;
      return {
        ...b,
        netBalancePaisa: newNet,
        netBalanceFormatted: `Rs. ${(Math.abs(newNet) / 100).toLocaleString('en-IN')}`,
        type: newNet > 0 ? 'Creditor' : newNet < 0 ? 'Debtor' : 'Settled',
      };
    });

    const creditors = [];
    const debtors = [];
    for (const item of simulatedBalances) {
      if (item.netBalancePaisa > 0) {
        creditors.push({ userId: item.userId, amount: item.netBalancePaisa });
      } else if (item.netBalancePaisa < 0) {
        debtors.push({ userId: item.userId, amount: -item.netBalancePaisa });
      }
    }

    const memberMap = new Map();
    members.forEach((m) => memberMap.set(m.id, m));

    const simulatedTx = [];
    while (debtors.length > 0 && creditors.length > 0) {
      debtors.sort((a, b) => b.amount - a.amount);
      creditors.sort((a, b) => b.amount - a.amount);
      const debtor = debtors[0];
      const creditor = creditors[0];
      const settleAmount = Math.min(debtor.amount, creditor.amount);

      const fromUser = memberMap.get(debtor.userId) || { name: debtor.userId };
      const toUser = memberMap.get(creditor.userId) || { name: creditor.userId };

      simulatedTx.push({
        from: fromUser,
        to: toUser,
        amountPaisa: settleAmount,
        amountFormatted: `Rs. ${(settleAmount / 100).toLocaleString('en-IN')}`,
      });

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;
      if (debtor.amount === 0) debtors.shift();
      if (creditor.amount === 0) creditors.shift();
    }

    setSimulationDiff({
      expenseTitle: simTitle,
      payerName: memberMap.get(payerId)?.name || 'Payer',
      addedAmount: `Rs. ${amountNum.toLocaleString('en-IN')}`,
      newTransactions: simulatedTx,
    });
    setIsSimulating(false);
  };

  return (
    <div className="bg-white dark:bg-[#0f172a]/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-xs backdrop-blur-md flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Settlement Breakdown & Cash Flow Optimization
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
              {currentSelectedGroupObj?.name || 'Active Group'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Individual spending contributions, fair shares, and greedy minimal cash flow settlement transfers.
          </p>
        </div>

        <button
          onClick={() => onRunScenario?.('live', selectedGroup)}
          disabled={isExecuting || !selectedGroup}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 active:scale-[0.98] rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isExecuting ? 'animate-spin' : ''}`} />
          <span>{isExecuting ? 'Recalculating...' : 'Recalculate Balances'}</span>
        </button>
      </div>

      {breakdown && breakdown.totalSpentPaisa > 0 && (
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Group Expenses</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {breakdown.totalSpentFormatted}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Fair Share / Member</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {breakdown.fairSharePerMemberFormatted}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Group Size</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {breakdown.memberCount} Members Settling
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
              Top Payer (Paid Most Out of Pocket)
            </span>
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {topPayer?.name || topCreditor?.name || 'None'}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {topPayer?.totalPaidFormatted ? `Spent ${topPayer.totalPaidFormatted} on group` : 'Owed money back from group'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-rose-200/80 dark:border-rose-800/60 bg-rose-50/40 dark:bg-rose-950/20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] uppercase font-bold text-rose-700 dark:text-rose-400 block">
              Lowest Payer (Paid Least)
            </span>
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {lowestPayer?.name || topDebtor?.name || 'None'}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {lowestPayer?.totalPaidFormatted ? `Spent ${lowestPayer.totalPaidFormatted}` : 'Owes payments to settle balance'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          Individual Net Balances ({netBalances.length} Members in {currentSelectedGroupObj?.name || 'Group'})
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {netBalances.map((item, idx) => {
            const isCreditor = item.netBalancePaisa > 0;
            const isDebtor = item.netBalancePaisa < 0;
            const memberInfo = breakdownMemberMap.get(String(item.userId || item.id));
            return (
              <div
                key={idx}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar name={item.name || item.userId} className="w-7 h-7 text-xs" />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {memberInfo?.totalPaidFormatted
                        ? `Paid ${memberInfo.totalPaidFormatted}`
                        : isCreditor ? 'Gets back' : isDebtor ? 'Owes group' : 'Settled up'}
                    </span>
                  </div>
                </div>
                <div
                  className={`text-xs font-extrabold shrink-0 ${
                    isCreditor
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : isDebtor
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500'
                  }`}
                >
                  {isCreditor ? '+' : isDebtor ? '-' : ''}
                  {item.netBalanceFormatted}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Calculated Direct Settlements ({greedyOptimized.length} Payments Required)
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Min Cash Flow Path
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {greedyOptimized.length === 0 ? (
            <div className="col-span-2 p-5 text-center text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              All members in this group are completely balanced! Zero payments required.
            </div>
          ) : (
            greedyOptimized.map((t, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar name={t.from?.name || 'P'} className="w-7 h-7 text-xs" />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                      {t.from?.name}
                    </span>
                    <span className="text-[10px] text-rose-500 font-medium">Debtor</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary shrink-0 mx-1" />
                  <Avatar name={t.to?.name || 'R'} className="w-7 h-7 text-xs" />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                      {t.to?.name}
                    </span>
                    <span className="text-[10px] text-emerald-500 font-medium">Creditor</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0">
                  {t.amountFormatted}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-1.5">
          <PlusCircle className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            What-If Simulator: Add Real Group Expense & Recalculate Live
          </h4>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Simulate what happens if a member in this group pays a new expense and watch how the minimal settlement paths adapt immediately.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            type="text"
            value={simTitle}
            onChange={(e) => setSimTitle(e.target.value)}
            placeholder="Expense title"
            className="py-1.5 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
          />
          <select
            value={simPaidBy}
            onChange={(e) => setSimPaidBy(e.target.value)}
            className="py-1.5 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white cursor-pointer font-medium"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                Paid by {m.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={simAmount}
            onChange={(e) => setSimAmount(e.target.value)}
            placeholder="Amount in Rs."
            className="py-1.5 px-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
          />
          <button
            type="button"
            onClick={handleSimulate}
            disabled={isSimulating || !members.length}
            className="px-3 py-1.5 text-xs font-bold bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Simulate Impact
          </button>
        </div>

        {simulationDiff && (
          <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-primary/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>Simulation: {simulationDiff.payerName} paid {simulationDiff.addedAmount} for {simulationDiff.expenseTitle}</span>
              <span className="text-primary font-mono">{simulationDiff.newTransactions.length} New Transfers</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {simulationDiff.newTransactions.map((tx, i) => (
                <div key={i} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {tx.from?.name} → {tx.to?.name}
                  </span>
                  <span className="font-bold text-primary">{tx.amountFormatted}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
