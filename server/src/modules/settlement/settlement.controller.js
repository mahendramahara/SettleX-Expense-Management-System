export class SettlementController {
  constructor(settlementEngine, expenseModel, groupModel, adminModel = null) {
    this.settlementEngine = settlementEngine;
    this.expenseModel = expenseModel;
    this.groupModel = groupModel;
    this.adminModel = adminModel;
    this.getGroupBalances = this.getGroupBalances.bind(this);
    this.getGroupSettlements = this.getGroupSettlements.bind(this);
    this.getGroupDebtGraph = this.getGroupDebtGraph.bind(this);
    this.simplifyDebtCycles = this.simplifyDebtCycles.bind(this);
    this.simulateSettlement = this.simulateSettlement.bind(this);
    this.listSettlements = this.listSettlements.bind(this);
    this.recordSettlement = this.recordSettlement.bind(this);
  }

  async getGroupBalances(req, res, next) {
    try {
      const { groupId } = req.params;
      const group = await this.groupModel.getById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      const expenses = await this.expenseModel.getByGroupId(groupId);
      const breakdown = this.settlementEngine.calculateGroupBreakdown(expenses, group.members || []);

      const memberMap = new Map();
      (group.members || []).forEach((m) => {
        const id = this.settlementEngine.extractId(m);
        memberMap.set(id, m);
      });

      const balances = this.settlementEngine.calculateNetBalances(expenses).map((b) => {
        const member = memberMap.get(b.userId);
        return {
          ...b,
          name: member?.name || 'Member',
          email: member?.email || '',
          netBalanceFormatted: `Rs. ${(Math.abs(b.netBalancePaisa) / 100).toLocaleString('en-IN')}`,
          totalPaidFormatted: `Rs. ${((b.totalPaidPaisa || 0) / 100).toLocaleString('en-IN')}`,
          status: b.netBalancePaisa > 0 ? 'creditor' : b.netBalancePaisa < 0 ? 'debtor' : 'settled',
        };
      });

      res.status(200).json({
        success: true,
        data: {
          groupId,
          groupName: group.name,
          balances,
          groupSummary: breakdown,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getGroupSettlements(req, res, next) {
    try {
      const { groupId } = req.params;
      const group = await this.groupModel.getById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      const expenses = await this.expenseModel.getByGroupId(groupId);
      const breakdown = this.settlementEngine.calculateGroupBreakdown(expenses, group.members || []);
      const memberMap = new Map();
      (group.members || []).forEach((m) => {
        const id = this.settlementEngine.extractId(m);
        memberMap.set(id, m);
      });

      const rawBalances = this.settlementEngine.calculateNetBalances(expenses);
      const balances = rawBalances.map((b) => {
        const member = memberMap.get(b.userId);
        return {
          ...b,
          name: member?.name || 'Member',
          email: member?.email || '',
          netBalanceFormatted: `Rs. ${(Math.abs(b.netBalancePaisa) / 100).toLocaleString('en-IN')}`,
          totalPaidFormatted: `Rs. ${((b.totalPaidPaisa || 0) / 100).toLocaleString('en-IN')}`,
          status: b.netBalancePaisa > 0 ? 'creditor' : b.netBalancePaisa < 0 ? 'debtor' : 'settled',
        };
      });

      const rawTransactions = this.settlementEngine.optimizeSettlementsGreedy(rawBalances);
      const transactions = rawTransactions.map((tx, idx) => {
        const fromUser = memberMap.get(tx.fromUserId) || {
          id: tx.fromUserId,
          name: 'Member',
          email: '',
        };
        const toUser = memberMap.get(tx.toUserId) || { id: tx.toUserId, name: 'Member', email: '' };
        return {
          ...tx,
          id: `tx-${idx + 1}-${tx.fromUserId}-${tx.toUserId}`,
          fromName: fromUser.name,
          toName: toUser.name,
          fromEmail: fromUser.email,
          toEmail: toUser.email,
          fromUser,
          toUser,
          amountFormatted: `Rs. ${(tx.amountPaisa / 100).toLocaleString('en-IN')}`,
          explanation: `${fromUser.name} pays ${toUser.name} Rs. ${(tx.amountPaisa / 100).toLocaleString('en-IN')} to settle net balance`,
        };
      });

      res.status(200).json({
        success: true,
        data: {
          groupId,
          groupName: group.name,
          balances,
          optimizedTransactions: transactions,
          transactions,
          transactionCount: transactions.length,
          groupSummary: breakdown,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getGroupDebtGraph(req, res, next) {
    try {
      const { groupId } = req.params;
      const group = await this.groupModel.getById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      const expenses = await this.expenseModel.getByGroupId(groupId);
      const graph = this.settlementEngine.buildDebtGraph(expenses);

      const edges = [];
      for (const [from, targets] of graph.entries()) {
        for (const [to, amountPaisa] of targets.entries()) {
          edges.push({ from, to, amountPaisa });
        }
      }

      res.status(200).json({
        success: true,
        data: {
          groupId,
          edges,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async simplifyDebtCycles(req, res, next) {
    try {
      const { groupId } = req.params;
      const group = await this.groupModel.getById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      const expenses = await this.expenseModel.getByGroupId(groupId);
      const initialGraph = this.settlementEngine.buildDebtGraph(expenses);
      const simplifiedEdges = this.settlementEngine.cancelDebtCycles(initialGraph);

      res.status(200).json({
        success: true,
        data: {
          groupId,
          simplifiedEdges,
          edgeCount: simplifiedEdges.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async simulateSettlement(req, res, next) {
    try {
      const { groupId } = req.params;
      const {
        amountPaisa,
        paidById,
        splitType = 'EQUAL',
        participantIds = [],
        splits = [],
      } = req.body;

      const group = await this.groupModel.getById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      const expenses = await this.expenseModel.getByGroupId(groupId);
      const simulation = this.settlementEngine.simulateWhatIf(expenses, {
        amountPaisa: Number(amountPaisa) || 0,
        paidById: paidById || req.user.id,
        splitType,
        participantIds,
        splits,
      });

      res.status(200).json({
        success: true,
        data: {
          groupId,
          simulation,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async listSettlements(req, res, next) {
    try {
      const { groupId, userId, search } = req.query;
      if (this.adminModel && typeof this.adminModel.listAllSettlements === 'function') {
        const result = await this.adminModel.listAllSettlements({ groupId, userId, search });
        return res.status(200).json({ success: true, data: result });
      }
      return res.status(200).json({
        success: true,
        data: {
          settlements: [],
          userBalances: [],
          stats: {
            totalPendingDebtPaisa: 0,
            totalPendingDebtFormatted: 'Rs. 0',
            totalSettlementsCount: 0,
            rawTransactionsCount: 0,
            optimizedTransactionsCount: 0,
            reductionPercent: 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async recordSettlement(req, res, next) {
    try {
      const { groupId, fromUserId, toUserId, amountPaisa, notes } = req.body;
      const targetGroupId = groupId || req.params.groupId;

      if (!targetGroupId || !fromUserId || !toUserId || !amountPaisa) {
        return res.status(400).json({
          success: false,
          message: 'Group circle, debtor, creditor, and amount are required',
        });
      }

      const performerId = req.admin?.id || req.user?.id;
      if (this.adminModel && typeof this.adminModel.recordAdminSettlement === 'function') {
        const settlement = await this.adminModel.recordAdminSettlement(
          { groupId: targetGroupId, fromUserId, toUserId, amountPaisa, notes },
          performerId
        );
        return res.status(201).json({
          success: true,
          message: 'Settlement payment recorded successfully',
          data: { settlement },
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Settlement recording service unavailable',
      });
    } catch (error) {
      next(error);
    }
  }
}

