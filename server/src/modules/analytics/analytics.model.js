import mongoose from 'mongoose';
import { UserModelEntity } from '../user/user.model.js';
import { GroupModelEntity } from '../group/group.model.js';
import { ExpenseModelEntity } from '../expense/expense.model.js';
import { ActivityTracker } from '../activity/activity.model.js';
import { SettlementEngine } from '../settlement/settlement.engine.js';
import { AdminAuditLogEntity } from '../audit/audit.model.js';
import { AdminModelEntity } from '../admin/admin.model.js';
import { AnomalyModelEntity } from './anomaly.model.js';
import { anomalyEngine } from './anomaly.engine.js';
import { MailService } from '../../common/mail.service.js';

const spendingAdvisorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    adminName: {
      type: String,
      default: 'System Administrator',
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    anomalyType: {
      type: String,
      default: 'CROSS_GROUP_HIGH_SPENDER',
    },
    metrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['SENT', 'READ', 'ACKNOWLEDGED'],
      default: 'SENT',
    },
  },
  {
    timestamps: true,
    collection: 'spending_advisories',
  }
);

spendingAdvisorySchema.index({ userId: 1, createdAt: -1 });

export const SpendingAdvisoryEntity =
  mongoose.models.SpendingAdvisory || mongoose.model('SpendingAdvisory', spendingAdvisorySchema);

export class AnalyticsModel {
  async getPlatformAnalytics({ range = '6m', groupId = '' } = {}) {
    const monthsCount = range === '12m' ? 12 : 6;
    const now = new Date();

    const groupFilter = {};
    if (groupId && mongoose.Types.ObjectId.isValid(groupId)) {
      groupFilter.groupId = groupId;
    }

    const [allExpenses, allGroups, allUsers] = await Promise.all([
      ExpenseModelEntity.find(groupFilter)
        .populate('paidById', 'name email')
        .populate('groupId', 'name')
        .lean(),
      GroupModelEntity.find().populate('members', 'name email').lean(),
      UserModelEntity.find().select('name email createdAt isVerified isSuspended').lean(),
    ]);

    let totalVolumePaisa = 0;
    const splitTypeMap = {
      EQUAL: { count: 0, totalPaisa: 0 },
      EXACT: { count: 0, totalPaisa: 0 },
      PERCENTAGE: { count: 0, totalPaisa: 0 },
    };

    const categoryMap = {
      Food: { label: 'Food & Dining', color: '#3b82f6', totalPaisa: 0, count: 0 },
      Accommodation: { label: 'Accommodation', color: '#10b981', totalPaisa: 0, count: 0 },
      Transport: { label: 'Travel & Transport', color: '#06b6d4', totalPaisa: 0, count: 0 },
      Utilities: { label: 'Bills & Utilities', color: '#f59e0b', totalPaisa: 0, count: 0 },
      Entertainment: {
        label: 'Entertainment & Outing',
        color: '#8b5cf6',
        totalPaisa: 0,
        count: 0,
      },
      Shopping: { label: 'Shopping & Supplies', color: '#ec4899', totalPaisa: 0, count: 0 },
      Other: { label: 'General / Miscellaneous', color: '#64748b', totalPaisa: 0, count: 0 },
    };

    const userSpendingMap = new Map();
    const groupSpendingMap = new Map();

    allExpenses.forEach((exp) => {
      const amt = exp.amountPaisa || 0;
      totalVolumePaisa += amt;

      const sType = exp.splitType || 'EQUAL';
      if (splitTypeMap[sType]) {
        splitTypeMap[sType].count += 1;
        splitTypeMap[sType].totalPaisa += amt;
      }

      const t = (exp.title || '').toLowerCase();
      let cat = 'Other';
      if (
        t.includes('hotel') ||
        t.includes('room') ||
        t.includes('resort') ||
        t.includes('hostel') ||
        t.includes('rent') ||
        t.includes('stay')
      ) {
        cat = 'Accommodation';
      } else if (
        t.includes('food') ||
        t.includes('dinner') ||
        t.includes('lunch') ||
        t.includes('breakfast') ||
        t.includes('grocer') ||
        t.includes('cafe') ||
        t.includes('restaurant') ||
        t.includes('momo') ||
        t.includes('bhatbhateni') ||
        t.includes('snack') ||
        t.includes('drink')
      ) {
        cat = 'Food';
      } else if (
        t.includes('bus') ||
        t.includes('taxi') ||
        t.includes('cab') ||
        t.includes('ticket') ||
        t.includes('fuel') ||
        t.includes('petrol') ||
        t.includes('ride') ||
        t.includes('flight') ||
        t.includes('fare')
      ) {
        cat = 'Transport';
      } else if (
        t.includes('bill') ||
        t.includes('electric') ||
        t.includes('water') ||
        t.includes('wifi') ||
        t.includes('internet') ||
        t.includes('recharge')
      ) {
        cat = 'Utilities';
      } else if (
        t.includes('movie') ||
        t.includes('party') ||
        t.includes('game') ||
        t.includes('cinema') ||
        t.includes('club') ||
        t.includes('concert')
      ) {
        cat = 'Entertainment';
      } else if (
        t.includes('shop') ||
        t.includes('cloth') ||
        t.includes('shoe') ||
        t.includes('mall') ||
        t.includes('buy')
      ) {
        cat = 'Shopping';
      }
      categoryMap[cat].totalPaisa += amt;
      categoryMap[cat].count += 1;

      if (exp.paidById) {
        const uId = exp.paidById._id ? exp.paidById._id.toString() : exp.paidById.toString();
        const existing = userSpendingMap.get(uId) || {
          id: uId,
          name: exp.paidById.name || 'Member',
          email: exp.paidById.email || '',
          totalPaidPaisa: 0,
          expenseCount: 0,
        };
        existing.totalPaidPaisa += amt;
        existing.expenseCount += 1;
        userSpendingMap.set(uId, existing);
      }

      if (exp.groupId) {
        const gId = exp.groupId._id ? exp.groupId._id.toString() : exp.groupId.toString();
        const existing = groupSpendingMap.get(gId) || {
          id: gId,
          name: exp.groupId.name || 'Circle',
          totalPaidPaisa: 0,
          expenseCount: 0,
        };
        existing.totalPaidPaisa += amt;
        existing.expenseCount += 1;
        groupSpendingMap.set(gId, existing);
      }
    });

    const monthlyBins = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short' });
      monthlyBins.push({ year, month, label: monthLabel, totalPaisa: 0, count: 0 });
    }

    allExpenses.forEach((exp) => {
      const expDate = new Date(exp.createdAt || Date.now());
      const expYear = expDate.getFullYear();
      const expMonth = expDate.getMonth() + 1;
      const bin = monthlyBins.find((b) => b.year === expYear && b.month === expMonth);
      if (bin) {
        bin.totalPaisa += exp.amountPaisa || 0;
        bin.count += 1;
      }
    });

    const maxBinPaisa = Math.max(...monthlyBins.map((b) => b.totalPaisa), 100000);
    const monthlyTrend = monthlyBins.map((b, idx) => {
      const amountRs = Math.round(b.totalPaisa / 100);
      const ratio = b.totalPaisa / maxBinPaisa;
      const y = Math.round(150 - ratio * 110);
      const x = Math.round(30 + (idx / Math.max(1, monthsCount - 1)) * 300);
      return {
        month: b.label,
        year: b.year,
        amount: amountRs,
        amountFormatted: `Rs. ${amountRs.toLocaleString('en-IN')}`,
        count: b.count,
        x,
        y: Math.max(30, Math.min(150, y)),
      };
    });

    const totalCategoryPaisa = Object.values(categoryMap).reduce((acc, c) => acc + c.totalPaisa, 0);
    const categoryBreakdown = Object.values(categoryMap)
      .filter((c) => c.totalPaisa > 0 || c.count > 0)
      .map((c) => ({
        label: c.label,
        color: c.color,
        count: c.count,
        totalPaisa: c.totalPaisa,
        amountFormatted: `Rs. ${(c.totalPaisa / 100).toLocaleString('en-IN')}`,
        percentage:
          totalCategoryPaisa > 0
            ? Number(((c.totalPaisa / totalCategoryPaisa) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.totalPaisa - a.totalPaisa);

    const totalSplitCount = allExpenses.length;
    const splitStrategyDistribution = Object.entries(splitTypeMap).map(([type, data]) => ({
      type,
      label:
        type === 'EQUAL'
          ? 'Equal Split'
          : type === 'EXACT'
            ? 'Exact Allocation'
            : 'Percentage Based',
      count: data.count,
      totalPaisa: data.totalPaisa,
      amountFormatted: `Rs. ${(data.totalPaisa / 100).toLocaleString('en-IN')}`,
      percentage:
        totalSplitCount > 0 ? Number(((data.count / totalSplitCount) * 100).toFixed(1)) : 0,
    }));

    const topUsers = Array.from(userSpendingMap.values())
      .sort((a, b) => b.totalPaidPaisa - a.totalPaidPaisa)
      .slice(0, 5)
      .map((u) => ({
        ...u,
        amountFormatted: `Rs. ${(u.totalPaidPaisa / 100).toLocaleString('en-IN')}`,
      }));

    const topCircles = Array.from(groupSpendingMap.values())
      .sort((a, b) => b.totalPaidPaisa - a.totalPaidPaisa)
      .slice(0, 5)
      .map((g) => ({
        ...g,
        amountFormatted: `Rs. ${(g.totalPaidPaisa / 100).toLocaleString('en-IN')}`,
      }));

    const settlementEngine = new SettlementEngine();
    const rawGraph = settlementEngine.buildDebtGraph(allExpenses);
    let rawDebtsCount = 0;
    for (const [, targets] of rawGraph.entries()) {
      rawDebtsCount += targets.size;
    }
    const simplified = settlementEngine.cancelDebtCycles(rawGraph);
    const simplifiedCount = simplified.length;
    const debtReductionPercent =
      rawDebtsCount > 0 ? Math.round(((rawDebtsCount - simplifiedCount) / rawDebtsCount) * 100) : 0;

    return {
      kpis: {
        totalVolumePaisa,
        totalVolumeFormatted: `Rs. ${(totalVolumePaisa / 100).toLocaleString('en-IN')}`,
        totalTransactions: allExpenses.length,
        averageExpenseFormatted:
          allExpenses.length > 0
            ? `Rs. ${(Math.round(totalVolumePaisa / allExpenses.length) / 100).toLocaleString('en-IN')}`
            : 'Rs. 0',
        activeUsersCount: allUsers.filter((u) => !u.isSuspended).length,
        totalUsersCount: allUsers.length,
        verifiedUsersCount: allUsers.filter((u) => u.isVerified).length,
        activeCirclesCount: allGroups.length,
        debtReductionPercent: Math.max(0, debtReductionPercent),
        rawDebtsCount,
        simplifiedDebtsCount: simplifiedCount,
      },
      monthlyTrend,
      categoryBreakdown,
      splitStrategyDistribution,
      topUsers,
      topCircles,
    };
  }

  async benchmarkDebtOptimization() {
    const startTime = process.hrtime();
    const settlementEngine = new SettlementEngine();

    const [groups, allExpenses, users] = await Promise.all([
      GroupModelEntity.find().select('name members').lean(),
      ExpenseModelEntity.find().lean(),
      UserModelEntity.find().select('name email').lean(),
    ]);

    const userMap = new Map();
    users.forEach((u) => userMap.set(u._id.toString(), u.name || u.email));

    let totalRawTransfers = 0;
    let totalOptimizedTransfers = 0;
    let totalRedundantCashPaisa = 0;
    let totalCyclesDetected = 0;
    const groupBenchmarks = [];

    for (const group of groups) {
      const gId = group._id.toString();
      const groupExpenses = allExpenses.filter((e) => e.groupId.toString() === gId);
      if (groupExpenses.length === 0) continue;

      const rawGraph = settlementEngine.buildDebtGraph(groupExpenses);
      let rawCount = 0;
      let rawVolumePaisa = 0;
      for (const [, targets] of rawGraph.entries()) {
        for (const [, amount] of targets.entries()) {
          rawCount += 1;
          rawVolumePaisa += amount;
        }
      }

      let cyclesInGroup = 0;
      const copyGraph = new Map();
      for (const [u, edges] of rawGraph.entries()) {
        copyGraph.set(u, new Map(edges));
      }
      while (true) {
        const cycle = settlementEngine.findCycle(copyGraph);
        if (!cycle || cycle.length === 0) break;
        cyclesInGroup += 1;
        let bottleneck = Infinity;
        for (let i = 0; i < cycle.length - 1; i++) {
          const w = copyGraph.get(cycle[i])?.get(cycle[i + 1]) || 0;
          if (w < bottleneck) bottleneck = w;
        }
        for (let i = 0; i < cycle.length - 1; i++) {
          const u = cycle[i];
          const v = cycle[i + 1];
          const rem = (copyGraph.get(u)?.get(v) || 0) - bottleneck;
          if (rem <= 0) copyGraph.get(u)?.delete(v);
          else copyGraph.get(u)?.set(v, rem);
        }
      }

      const netBalances = settlementEngine.calculateNetBalances(groupExpenses);
      const optimized = settlementEngine.optimizeSettlementsGreedy(netBalances);

      const optimizedCount = optimized.length;
      let optimizedVolumePaisa = 0;
      optimized.forEach((t) => (optimizedVolumePaisa += t.amountPaisa));

      totalRawTransfers += rawCount;
      totalOptimizedTransfers += optimizedCount;
      totalCyclesDetected += cyclesInGroup;
      totalRedundantCashPaisa += Math.max(0, rawVolumePaisa - optimizedVolumePaisa);

      const reduction =
        rawCount > 0 ? Math.round(((rawCount - optimizedCount) / rawCount) * 100) : 0;

      groupBenchmarks.push({
        groupId: gId,
        groupName: group.name,
        rawTransactions: rawCount,
        optimizedTransactions: optimizedCount,
        reductionPercent: reduction,
        cyclesEliminated: cyclesInGroup,
      });
    }

    const diffTime = process.hrtime(startTime);
    const latencyMs = Number((diffTime[0] * 1000 + diffTime[1] / 1000000).toFixed(2));

    const platformReductionPercent =
      totalRawTransfers > 0
        ? Math.round(((totalRawTransfers - totalOptimizedTransfers) / totalRawTransfers) * 100)
        : 0;

    return {
      kpis: {
        totalRawTransfers,
        totalOptimizedTransfers,
        totalCyclesDetected,
        totalRedundantCashFormatted: `Rs. ${(totalRedundantCashPaisa / 100).toLocaleString('en-IN')}`,
        platformReductionPercent,
        latencyMs,
        algorithmStatus: 'Operational (Greedy Cycle Elimination)',
      },
      groupBenchmarks,
    };
  }

  async runOptimizationSandbox({
    scenario = 'triangle',
    customMembers = [],
    customDebts = [],
    groupId = '',
  }) {
    const startTime = process.hrtime();
    const settlementEngine = new SettlementEngine();

    let members = [];
    let initialDebts = [];

    let targetGroup = null;
    let groupExpenses = [];

    if (customMembers && customMembers.length > 0 && customDebts && customDebts.length > 0) {
      members = customMembers;
      initialDebts = customDebts;
    } else {
      if (groupId && mongoose.Types.ObjectId.isValid(groupId)) {
        targetGroup = await GroupModelEntity.findById(groupId).populate('members', 'name email');
      }

      if (!targetGroup) {
        targetGroup = await GroupModelEntity.findOne()
          .sort({ createdAt: -1 })
          .populate('members', 'name email');
      }

      if (targetGroup) {
        members = (targetGroup.members || []).map((m) => ({
          id: m._id ? m._id.toString() : m.id,
          name: m.name || 'Member',
          email: m.email || '',
        }));

        groupExpenses = await ExpenseModelEntity.find({ groupId: targetGroup._id }).lean();
        const rawGraph = settlementEngine.buildDebtGraph(groupExpenses);

        for (const [from, targets] of rawGraph.entries()) {
          for (const [to, amountPaisa] of targets.entries()) {
            if (amountPaisa > 0) {
              initialDebts.push({ from, to, amountPaisa });
            }
          }
        }
      }
    }

    const memberMap = new Map();
    members.forEach((m) => memberMap.set(m.id, m));

    const initialGraph = new Map();
    initialDebts.forEach(({ from, to, amountPaisa }) => {
      if (!initialGraph.has(from)) initialGraph.set(from, new Map());
      const cur = initialGraph.get(from).get(to) || 0;
      initialGraph.get(from).set(to, cur + amountPaisa);
    });

    const stepLogs = [];
    const copyGraph = new Map();
    for (const [u, edges] of initialGraph.entries()) {
      copyGraph.set(u, new Map(edges));
    }

    let cycleIteration = 1;
    while (true) {
      const cycle = settlementEngine.findCycle(copyGraph);
      if (!cycle || cycle.length === 0) break;

      let bottleneck = Infinity;
      for (let i = 0; i < cycle.length - 1; i++) {
        const u = cycle[i];
        const v = cycle[i + 1];
        const w = copyGraph.get(u)?.get(v) || 0;
        if (w < bottleneck) bottleneck = w;
      }

      const cycleNames = cycle.map((nodeId) => memberMap.get(nodeId)?.name || nodeId);
      stepLogs.push({
        step: `Cycle #${cycleIteration}`,
        description: `Identified cycle: ${cycleNames.join(' -> ')}`,
        bottleneckPaisa: bottleneck,
        bottleneckFormatted: `Rs. ${(bottleneck / 100).toLocaleString('en-IN')}`,
        action: `Subtracted Rs. ${bottleneck / 100} from all edges in the cycle`,
      });

      for (let i = 0; i < cycle.length - 1; i++) {
        const u = cycle[i];
        const v = cycle[i + 1];
        const rem = (copyGraph.get(u)?.get(v) || 0) - bottleneck;
        if (rem <= 0) copyGraph.get(u)?.delete(v);
        else copyGraph.get(u)?.set(v, rem);
      }
      cycleIteration += 1;
    }

    const cycleCancelledDebts = [];
    for (const [from, targets] of copyGraph.entries()) {
      for (const [to, amountPaisa] of targets.entries()) {
        if (amountPaisa > 0) {
          cycleCancelledDebts.push({ from, to, amountPaisa });
        }
      }
    }

    const balanceMap = new Map();
    members.forEach((m) => balanceMap.set(m.id, 0));
    initialDebts.forEach(({ from, to, amountPaisa }) => {
      balanceMap.set(from, (balanceMap.get(from) || 0) - amountPaisa);
      balanceMap.set(to, (balanceMap.get(to) || 0) + amountPaisa);
    });

    const netBalances = Array.from(balanceMap.entries()).map(([userId, netBalancePaisa]) => ({
      userId,
      netBalancePaisa,
    }));

    const greedyOptimized = settlementEngine.optimizeSettlementsGreedy(netBalances);

    const diffTime = process.hrtime(startTime);
    const executionTimeMicroseconds = Number(
      (diffTime[0] * 1000000 + diffTime[1] / 1000).toFixed(0)
    );

    const formatDebtList = (debts) =>
      debts.map((d) => ({
        from: memberMap.get(d.from || d.fromUserId) || { id: d.from, name: d.from },
        to: memberMap.get(d.to || d.toUserId) || { id: d.to, name: d.to },
        amountPaisa: d.amountPaisa,
        amountFormatted: `Rs. ${(d.amountPaisa / 100).toLocaleString('en-IN')}`,
      }));

    const sortedBalances = [...netBalances].sort((a, b) => b.netBalancePaisa - a.netBalancePaisa);
    const topCreditor = sortedBalances[0] ? memberMap.get(sortedBalances[0].userId) : null;
    const topDebtor = sortedBalances[sortedBalances.length - 1]
      ? memberMap.get(sortedBalances[sortedBalances.length - 1].userId)
      : null;

    let breakdown = null;
    if (targetGroup && groupExpenses) {
      breakdown = settlementEngine.calculateGroupBreakdown(groupExpenses, members);
    }

    return {
      group: targetGroup
        ? {
            id: targetGroup._id ? targetGroup._id.toString() : targetGroup.id,
            name: targetGroup.name,
            description: targetGroup.description,
          }
        : null,
      breakdown,
      topPayer: breakdown?.topPayer || null,
      lowestPayer: breakdown?.lowestPayer || null,
      members,
      initialDebts: formatDebtList(initialDebts),
      cycleCancelledDebts: formatDebtList(cycleCancelledDebts),
      greedyOptimized: formatDebtList(greedyOptimized),
      netBalances: netBalances.map((b) => {
        const u = memberMap.get(b.userId) || { id: b.userId, name: b.userId, email: '' };
        return {
          ...b,
          user: u,
          name: u.name,
          email: u.email,
          netBalanceFormatted: `Rs. ${(Math.abs(b.netBalancePaisa) / 100).toLocaleString('en-IN')}`,
          type: b.netBalancePaisa > 0 ? 'Creditor' : b.netBalancePaisa < 0 ? 'Debtor' : 'Settled',
        };
      }),
      topCreditor,
      topDebtor,
      stepLogs,
      summary: {
        rawCount: initialDebts.length,
        cyclesEliminated: stepLogs.length,
        finalCount: greedyOptimized.length,
        reductionPercent:
          initialDebts.length > 0
            ? Math.round(
                ((initialDebts.length - greedyOptimized.length) / initialDebts.length) * 100
              )
            : 0,
        executionTimeMicroseconds,
      },
    };
  }

  async detectSpendingAnomalies({ threshold = 1.5, severity = 'all', status = 'all', search = '', limit = 50 } = {}) {
    const count = await AnomalyModelEntity.countDocuments();
    if (count === 0) {
      await anomalyEngine.scanAllAnomalies({ threshold, severity });
    }

    const result = await anomalyEngine.getPersistedAnomalies({ severity, status, search, limit });

    const storedAdvisories = await SpendingAdvisoryEntity.find()
      .populate('userId', 'name email avatar')
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    result.recentAdvisories = storedAdvisories.map((adv) => ({
      id: adv._id.toString(),
      userId: adv.userId?._id ? adv.userId._id.toString() : adv.userId,
      userName: adv.userId?.name || 'User',
      userEmail: adv.userId?.email || '',
      adminId: adv.adminId?._id ? adv.adminId._id.toString() : adv.adminId,
      adminName: adv.adminName || adv.adminId?.name || 'Administrator',
      subject: adv.subject,
      message: adv.message,
      anomalyType: adv.anomalyType,
      status: adv.status,
      createdAt: adv.createdAt,
    }));

    return result;
  }

  async runAnomalyScan({ threshold = 1.5, severity = 'all' } = {}) {
    return anomalyEngine.scanAllAnomalies({ threshold, severity });
  }

  async updateAnomalyStatus(id, { status, resolutionNotes = '', adminId = null }) {
    const update = {
      status,
      resolutionNotes,
    };
    if (['RESOLVED', 'DISMISSED'].includes(status)) {
      update.resolvedAt = new Date();
    }
    const updated = await AnomalyModelEntity.findByIdAndUpdate(id, update, { new: true })
      .populate('userId', 'name email avatar')
      .populate('groupId', 'name');

    if (updated && adminId) {
      ActivityTracker.track({
        action: 'ANOMALY_STATUS_UPDATED',
        title: `Anomaly marked as ${status}`,
        subtitle: updated.title,
        type: 'system',
        performedBy: adminId,
        targetId: id,
      });
    }

    return updated;
  }

  async dispatchUserAdvisory(
    { userId, anomalyId, subject, message, anomalyType = 'CROSS_GROUP_HIGH_SPENDER', metrics = {} },
    adminId
  ) {
    if (!userId || !subject || !message) {
      throw new Error('User ID, advisory subject, and message content are required');
    }

    const admin = await AdminModelEntity.findById(adminId).lean();
    const adminName = admin ? admin.name : 'System Administrator';

    let userObjectId = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } else {
      const existingUser = await UserModelEntity.findOne({
        $or: [
          { _id: mongoose.Types.ObjectId.isValid(userId) ? userId : undefined },
          { email: userId },
        ],
      });
      if (existingUser) {
        userObjectId = existingUser._id;
      }
    }

    const newAdvisory = await SpendingAdvisoryEntity.create({
      userId: userObjectId || new mongoose.Types.ObjectId(),
      adminId: mongoose.Types.ObjectId.isValid(adminId) ? adminId : new mongoose.Types.ObjectId(),
      adminName,
      subject: subject.trim(),
      message: message.trim(),
      anomalyType,
      metrics,
      status: 'SENT',
    });

    await AdminAuditLogEntity.create({
      action: 'DISPATCH_SPENDING_ADVISORY',
      targetId: newAdvisory._id.toString(),
      targetModel: 'User',
      performedBy: mongoose.Types.ObjectId.isValid(adminId)
        ? adminId
        : new mongoose.Types.ObjectId(),
      details: {
        userId,
        subject,
        anomalyType,
      },
    });

    await ActivityTracker.track({
      action: 'DISPATCH_ADVISORY',
      title: 'Spending Advisory Dispatched',
      subtitle: `Advisory sent regarding cross-group spending variance: "${subject}"`,
      type: 'security',
      performedBy: mongoose.Types.ObjectId.isValid(adminId) ? adminId : null,
      performedByName: adminName,
      targetId: newAdvisory._id.toString(),
      metadata: { userId, anomalyType },
    });

    if (anomalyId && mongoose.Types.ObjectId.isValid(anomalyId)) {
      await AnomalyModelEntity.findByIdAndUpdate(anomalyId, {
        $inc: { advisoriesSentCount: 1 },
        status: 'ADVISED',
      });
    } else if (userObjectId) {
      await AnomalyModelEntity.updateMany(
        { userId: userObjectId, status: 'DETECTED' },
        { $inc: { advisoriesSentCount: 1 }, status: 'ADVISED' }
      );
    }

    // Send real email alert to the user
    let emailSent = false;
    let targetUserEmail = null;
    try {
      let targetUser = null;
      if (userObjectId) {
        targetUser = await UserModelEntity.findById(userObjectId).lean();
      }
      targetUserEmail = targetUser?.email || (typeof userId === 'string' && userId.includes('@') ? userId : null);

      if (targetUserEmail) {
        const mailService = new MailService();
        const mailRes = await mailService.sendAnomalyAlert({
          to: targetUserEmail,
          userName: targetUser?.name || 'Member',
          anomalyType: anomalyType || 'OUTLIER_EXPENSE',
          severity: metrics?.severity || 'HIGH',
          description: message,
          metrics,
        });
        emailSent = Boolean(mailRes?.delivered || mailRes?.simulated);
      }
    } catch (mailError) {
      process.stderr.write(`[Analytics] Failed to send anomaly advisory email: ${mailError.message}\n`);
    }

    return {
      id: newAdvisory._id.toString(),
      subject: newAdvisory.subject,
      message: newAdvisory.message,
      adminName,
      status: newAdvisory.status,
      emailSent,
      recipientEmail: targetUserEmail,
      createdAt: newAdvisory.createdAt,
    };
  }

  async getAdvisories({ userId = null } = {}) {
    const query = {};
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }

    const advisories = await SpendingAdvisoryEntity.find(query)
      .populate('userId', 'name email avatar')
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return advisories.map((adv) => ({
      id: adv._id.toString(),
      userId: adv.userId?._id ? adv.userId._id.toString() : adv.userId,
      userName: adv.userId?.name || 'User',
      userEmail: adv.userId?.email || '',
      adminName: adv.adminName || adv.adminId?.name || 'Administrator',
      subject: adv.subject,
      message: adv.message,
      anomalyType: adv.anomalyType,
      status: adv.status,
      createdAt: adv.createdAt,
    }));
  }
}
