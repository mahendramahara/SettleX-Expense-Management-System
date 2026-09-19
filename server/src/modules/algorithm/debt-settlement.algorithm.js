export class DebtSettlementAlgorithm {
  static extractId(entity) {
    if (!entity) return '';
    if (typeof entity === 'object') {
      if (entity._id) return entity._id.toString();
      if (entity.id) return entity.id.toString();
    }
    return entity.toString();
  }

  static calculateNetBalances(expenses) {
    const balances = new Map();
    const paidMap = new Map();
    const shareMap = new Map();

    for (const expense of expenses) {
      const payerId = this.extractId(expense.paidById);
      const expenseAmount = expense.amountPaisa || 0;
      balances.set(payerId, (balances.get(payerId) || 0) + expenseAmount);
      paidMap.set(payerId, (paidMap.get(payerId) || 0) + expenseAmount);

      const splits = Array.isArray(expense.splits) ? expense.splits : [];
      for (const split of splits) {
        const participantId = this.extractId(split.userId);
        const splitAmount = split.amountPaisa || 0;
        balances.set(participantId, (balances.get(participantId) || 0) - splitAmount);
        shareMap.set(participantId, (shareMap.get(participantId) || 0) + splitAmount);
      }
    }

    return Array.from(balances.entries()).map(([userId, netBalancePaisa]) => ({
      userId,
      netBalancePaisa,
      totalPaidPaisa: paidMap.get(userId) || 0,
      totalSharePaisa: shareMap.get(userId) || 0,
    }));
  }

  static calculateGroupBreakdown(expenses, members = []) {
    const memberMap = new Map();
    members.forEach((m) => {
      const id = this.extractId(m);
      memberMap.set(id, {
        id,
        name: m.name || m.userName || 'Member',
        email: m.email || '',
      });
    });

    const totalSpentPaisa = expenses.reduce((sum, e) => sum + (e.amountPaisa || 0), 0);
    const balances = this.calculateNetBalances(expenses);

    balances.forEach((b) => {
      if (!memberMap.has(b.userId)) {
        memberMap.set(b.userId, { id: b.userId, name: 'Member', email: '' });
      }
    });

    const memberBreakdown = Array.from(memberMap.values()).map((m) => {
      const balanceData = balances.find((b) => b.userId === m.id) || {
        netBalancePaisa: 0,
        totalPaidPaisa: 0,
        totalSharePaisa: 0,
      };
      const net = balanceData.netBalancePaisa || 0;
      const paid = balanceData.totalPaidPaisa || 0;
      const share = balanceData.totalSharePaisa || 0;
      const paidPercentage = totalSpentPaisa > 0 ? Math.round((paid / totalSpentPaisa) * 100) : 0;

      return {
        userId: m.id,
        name: m.name,
        email: m.email,
        totalPaidPaisa: paid,
        totalSharePaisa: share,
        netBalancePaisa: net,
        paidPercentage,
        status: net > 0 ? 'creditor' : net < 0 ? 'debtor' : 'settled',
        netBalanceFormatted: `Rs. ${(Math.abs(net) / 100).toLocaleString('en-IN')}`,
        totalPaidFormatted: `Rs. ${(paid / 100).toLocaleString('en-IN')}`,
        fairShareFormatted: `Rs. ${(share / 100).toLocaleString('en-IN')}`,
      };
    });

    const sortedByPaid = [...memberBreakdown].sort((a, b) => b.totalPaidPaisa - a.totalPaidPaisa);
    const sortedByNet = [...memberBreakdown].sort((a, b) => b.netBalancePaisa - a.netBalancePaisa);

    const topPayer = sortedByPaid[0] || null;
    const lowestPayer = sortedByPaid[sortedByPaid.length - 1] || null;
    const maxCreditor = sortedByNet[0]?.netBalancePaisa > 0 ? sortedByNet[0] : null;
    const maxDebtor =
      sortedByNet[sortedByNet.length - 1]?.netBalancePaisa < 0
        ? sortedByNet[sortedByNet.length - 1]
        : null;

    const fairSharePerMemberPaisa =
      memberBreakdown.length > 0 ? Math.round(totalSpentPaisa / memberBreakdown.length) : 0;

    return {
      totalSpentPaisa,
      totalSpentFormatted: `Rs. ${(totalSpentPaisa / 100).toLocaleString('en-IN')}`,
      fairSharePerMemberPaisa,
      fairSharePerMemberFormatted: `Rs. ${(fairSharePerMemberPaisa / 100).toLocaleString('en-IN')}`,
      memberCount: memberBreakdown.length,
      members: memberBreakdown,
      topPayer,
      lowestPayer,
      maxCreditor,
      maxDebtor,
    };
  }

  static buildDebtGraph(expenses) {
    const graph = new Map();

    const addDebt = (from, to, amount) => {
      if (from === to || amount <= 0) return;
      if (!graph.has(from)) graph.set(from, new Map());
      const current = graph.get(from).get(to) || 0;
      graph.get(from).set(to, current + amount);
    };

    for (const expense of expenses) {
      const payerId = this.extractId(expense.paidById);
      const splits = Array.isArray(expense.splits) ? expense.splits : [];
      for (const split of splits) {
        const debtorId = this.extractId(split.userId);
        if (debtorId !== payerId) {
          addDebt(debtorId, payerId, split.amountPaisa || 0);
        }
      }
    }

    return graph;
  }

  static findCycle(graph) {
    const visited = new Set();
    const inStack = new Set();
    const parentMap = new Map();

    const dfs = (node) => {
      visited.add(node);
      inStack.add(node);

      const neighbors = graph.get(node) ? Array.from(graph.get(node).keys()) : [];
      for (const next of neighbors) {
        if (!visited.has(next)) {
          parentMap.set(next, node);
          const cycle = dfs(next);
          if (cycle) return cycle;
        } else if (inStack.has(next)) {
          const cycle = [next];
          let curr = node;
          while (curr !== next && curr !== undefined) {
            cycle.push(curr);
            curr = parentMap.get(curr);
          }
          cycle.push(next);
          cycle.reverse();
          return cycle;
        }
      }

      inStack.delete(node);
      return null;
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        const cycle = dfs(node);
        if (cycle) return cycle;
      }
    }

    return null;
  }

  static cancelDebtCycles(initialGraph) {
    const graph = new Map();
    for (const [u, edges] of initialGraph.entries()) {
      graph.set(u, new Map(edges));
    }

    let cycleFound = true;
    while (cycleFound) {
      const cycle = this.findCycle(graph);
      if (!cycle || cycle.length === 0) {
        cycleFound = false;
        break;
      }

      let bottleneck = Infinity;
      for (let i = 0; i < cycle.length - 1; i++) {
        const u = cycle[i];
        const v = cycle[i + 1];
        const weight = graph.get(u)?.get(v) || 0;
        if (weight < bottleneck) {
          bottleneck = weight;
        }
      }

      for (let i = 0; i < cycle.length - 1; i++) {
        const u = cycle[i];
        const v = cycle[i + 1];
        const remaining = (graph.get(u)?.get(v) || 0) - bottleneck;
        if (remaining <= 0) {
          graph.get(u)?.delete(v);
        } else {
          graph.get(u)?.set(v, remaining);
        }
      }
    }

    const simplifiedEdges = [];
    for (const [from, targets] of graph.entries()) {
      for (const [to, amountPaisa] of targets.entries()) {
        if (amountPaisa > 0) {
          simplifiedEdges.push({ from, to, amountPaisa });
        }
      }
    }

    return simplifiedEdges;
  }

  static optimizeSettlementsGreedy(netBalances) {
    const creditors = [];
    const debtors = [];

    for (const item of netBalances) {
      if (item.netBalancePaisa > 0) {
        creditors.push({ userId: item.userId, amount: item.netBalancePaisa });
      } else if (item.netBalancePaisa < 0) {
        debtors.push({ userId: item.userId, amount: -item.netBalancePaisa });
      }
    }

    const transactions = [];

    while (debtors.length > 0 && creditors.length > 0) {
      debtors.sort((a, b) => b.amount - a.amount);
      creditors.sort((a, b) => b.amount - a.amount);

      const debtor = debtors[0];
      const creditor = creditors[0];

      const settlementAmount = Math.min(debtor.amount, creditor.amount);

      transactions.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amountPaisa: settlementAmount,
      });

      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;

      if (debtor.amount === 0) {
        debtors.shift();
      }
      if (creditor.amount === 0) {
        creditors.shift();
      }
    }

    return transactions;
  }

  static simulateWhatIf(expenses, hypotheticalExpense) {
    const currentBalances = this.calculateNetBalances(expenses);
    const currentTransactions = this.optimizeSettlementsGreedy(currentBalances);

    let simulatedSplits = hypotheticalExpense.splits || [];
    if (
      (!simulatedSplits || simulatedSplits.length === 0) &&
      hypotheticalExpense.participantIds?.length > 0
    ) {
      const count = hypotheticalExpense.participantIds.length;
      const baseShare = Math.floor(hypotheticalExpense.amountPaisa / count);
      const remainder = hypotheticalExpense.amountPaisa % count;
      simulatedSplits = hypotheticalExpense.participantIds.map((userId, index) => ({
        userId,
        amountPaisa: baseShare + (index < remainder ? 1 : 0),
      }));
    }

    const syntheticExpense = {
      paidById: hypotheticalExpense.paidById,
      amountPaisa: Number(hypotheticalExpense.amountPaisa) || 0,
      splits: simulatedSplits,
    };

    const simulatedExpenses = [...expenses, syntheticExpense];
    const simulatedBalances = this.calculateNetBalances(simulatedExpenses);
    const simulatedTransactions = this.optimizeSettlementsGreedy(simulatedBalances);

    const currentTotalDebt = currentTransactions.reduce((acc, t) => acc + t.amountPaisa, 0);
    const simulatedTotalDebt = simulatedTransactions.reduce((acc, t) => acc + t.amountPaisa, 0);

    return {
      current: {
        balances: currentBalances,
        transactions: currentTransactions,
        transactionCount: currentTransactions.length,
        totalDebtPaisa: currentTotalDebt,
      },
      simulated: {
        balances: simulatedBalances,
        transactions: simulatedTransactions,
        transactionCount: simulatedTransactions.length,
        totalDebtPaisa: simulatedTotalDebt,
      },
      delta: {
        transactionDiff: simulatedTransactions.length - currentTransactions.length,
        debtDiffPaisa: simulatedTotalDebt - currentTotalDebt,
      },
    };
  }
}
