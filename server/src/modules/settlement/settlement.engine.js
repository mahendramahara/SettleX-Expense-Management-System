import { DebtSettlementAlgorithm } from '../algorithm/debt-settlement.algorithm.js';

export class SettlementEngine {
  extractId(entity) {
    return DebtSettlementAlgorithm.extractId(entity);
  }

  calculateNetBalances(expenses) {
    return DebtSettlementAlgorithm.calculateNetBalances(expenses);
  }

  calculateGroupBreakdown(expenses, members = []) {
    return DebtSettlementAlgorithm.calculateGroupBreakdown(expenses, members);
  }

  buildDebtGraph(expenses) {
    return DebtSettlementAlgorithm.buildDebtGraph(expenses);
  }

  cancelDebtCycles(initialGraph) {
    return DebtSettlementAlgorithm.cancelDebtCycles(initialGraph);
  }

  findCycle(graph) {
    return DebtSettlementAlgorithm.findCycle(graph);
  }

  optimizeSettlementsGreedy(netBalances) {
    return DebtSettlementAlgorithm.optimizeSettlementsGreedy(netBalances);
  }

  simulateWhatIf(expenses, hypotheticalExpense) {
    return DebtSettlementAlgorithm.simulateWhatIf(expenses, hypotheticalExpense);
  }
}
