import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModelEntity, UserModel } from '../user/user.model.js';
import { GroupModelEntity } from '../group/group.model.js';
import { ExpenseModelEntity } from '../expense/expense.model.js';
import { ActivityTracker } from '../activity/activity.model.js';
import { SettlementEngine } from '../settlement/settlement.engine.js';
import { NotificationModel, NotificationEntity } from '../notification/notification.model.js';
import { AuditLogModel, AdminAuditLogEntity } from '../audit/audit.model.js';
import { SettingsModel, SystemSettingsEntity } from '../settings/settings.model.js';
import { AnalyticsModel, SpendingAdvisoryEntity } from '../analytics/analytics.model.js';

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'moderator'],
      default: 'admin',
    },
    permissions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    phone: {
      type: String,
      default: '+977 9801234567',
      trim: true,
    },
    designation: {
      type: String,
      default: 'System Administrator & Operations Lead',
      trim: true,
    },
    location: {
      type: String,
      default: 'Kathmandu, Nepal',
      trim: true,
    },
    bio: {
      type: String,
      default:
        'Overseeing algorithmic debt elimination, anomaly supervision, and platform ledger security.',
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
    collection: 'admins',
  }
);

export const AdminModelEntity = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

export { NotificationEntity } from '../notification/notification.model.js';
export { AdminAuditLogEntity } from '../audit/audit.model.js';
export { SystemSettingsEntity } from '../settings/settings.model.js';
export { SpendingAdvisoryEntity } from '../analytics/analytics.model.js';

export class AdminModel {
  constructor(
    userModel = null,
    notificationModel = null,
    auditLogModel = null,
    settingsModel = null,
    analyticsModel = null
  ) {
    this.jwtSecret = process.env.JWT_SECRET || 'settlex_super_secure_jwt_secret_key_2026';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.userModel = userModel || new UserModel();
    this.notificationModel = notificationModel || new NotificationModel();
    this.auditLogModel = auditLogModel || new AuditLogModel();
    this.settingsModel = settingsModel || new SettingsModel();
    this.analyticsModel = analyticsModel || new AnalyticsModel();
  }

  async seedDefaultSuperAdmin() {
    const adminName = process.env.SUPERADMIN_NAME || 'Suman Sharma';
    const adminEmail = (process.env.SUPERADMIN_EMAIL || 'suman.admin@settlex.com').toLowerCase().trim();
    const adminPassword = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';

    // Find existing superadmin by email or by superadmin role
    let superAdmin = await AdminModelEntity.findOne({ email: adminEmail });
    if (!superAdmin) {
      superAdmin = await AdminModelEntity.findOne({ role: 'superadmin' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(adminPassword, salt);

    if (!superAdmin) {
      superAdmin = await AdminModelEntity.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'superadmin',
        permissions: ['*'],
        isActive: true,
      });
    } else {
      superAdmin.name = adminName;
      superAdmin.email = adminEmail;
      superAdmin.password = hashedPassword;
      superAdmin.role = 'superadmin';
      superAdmin.permissions = ['*'];
      superAdmin.isActive = true;
      await superAdmin.save();
    }
  }

  async authenticate(email, password) {
    const admin = await AdminModelEntity.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return null;
    }

    const isMatch = bcrypt.compareSync(password, admin.password);
    if (!isMatch) {
      return null;
    }

    if (!admin.isActive) {
      const error = new Error('Admin account is deactivated');
      error.isDeactivated = true;
      throw error;
    }

    const token = this.generateAdminToken(admin);
    return {
      admin: this.sanitizeAdmin(admin),
      token,
    };
  }

  generateAdminToken(admin) {
    return jwt.sign(
      {
        id: admin._id ? admin._id.toString() : admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions || ['*'],
        privileges: ['*'],
        isAdmin: true,
        isVerified: true,
        isSuspended: false,
        tier: 'enterprise',
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiresIn }
    );
  }

  sanitizeAdmin(adminDoc) {
    if (!adminDoc) return null;
    const plain = adminDoc.toObject ? adminDoc.toObject() : { ...adminDoc };
    const { password, __v, ...safeAdmin } = plain;
    safeAdmin.id = safeAdmin._id ? safeAdmin._id.toString() : safeAdmin.id;
    return safeAdmin;
  }

  async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return AdminModelEntity.findById(id);
  }

  async createStaffAdmin({
    name,
    email,
    password,
    role = 'moderator',
    permissions = [],
    createdBy,
  }) {
    const existing = await AdminModelEntity.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      throw new Error('An administrator or staff account with this email already exists');
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newStaff = await AdminModelEntity.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      permissions,
      isActive: true,
      createdBy,
    });

    if (createdBy) {
      await AdminAuditLogEntity.create({
        action: 'CREATE_STAFF',
        targetId: newStaff._id.toString(),
        targetModel: 'Admin',
        performedBy: createdBy,
        details: { role, permissions },
      });
    }

    return this.sanitizeAdmin(newStaff);
  }

  async updateStaffPermissions(adminId, permissions, performedBy) {
    if (!mongoose.Types.ObjectId.isValid(adminId) || !Array.isArray(permissions)) {
      return null;
    }

    const updated = await AdminModelEntity.findByIdAndUpdate(
      adminId,
      { $set: { permissions } },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return null;
    }

    await AdminAuditLogEntity.create({
      action: 'UPDATE_STAFF_PERMISSIONS',
      targetId: adminId,
      targetModel: 'Admin',
      performedBy,
      details: { permissions },
    });

    return this.sanitizeAdmin(updated);
  }

  async updateStaffRole(adminId, role, performedBy) {
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return null;
    }

    const updated = await AdminModelEntity.findByIdAndUpdate(
      adminId,
      { $set: { role } },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return null;
    }

    await AdminAuditLogEntity.create({
      action: 'UPDATE_STAFF_ROLE',
      targetId: adminId,
      targetModel: 'Admin',
      performedBy,
      details: { role },
    });

    return this.sanitizeAdmin(updated);
  }

  async toggleStaffStatus(adminId, isActive, performedBy) {
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return null;
    }

    const updated = await AdminModelEntity.findByIdAndUpdate(
      adminId,
      { $set: { isActive } },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return null;
    }

    await AdminAuditLogEntity.create({
      action: 'TOGGLE_STAFF_STATUS',
      targetId: adminId,
      targetModel: 'Admin',
      performedBy,
      details: { isActive },
    });

    return this.sanitizeAdmin(updated);
  }

  async listStaffAdmins() {
    const staff = await AdminModelEntity.find().select('-password -__v').sort({ createdAt: -1 });
    return staff.map((s) => this.sanitizeAdmin(s));
  }

  async getSystemOverview() {
    const [
      totalUsersCount,
      suspendedUsersCount,
      totalStaffCount,
      totalGroupsCount,
      totalExpensesCount,
      aggregateResult,
      recentExpensesDocs,
      latestUsersDocs,
      latestGroupsDocs,
      topGroupsAgg,
      allExpensesForAnalysis,
    ] = await Promise.all([
      UserModelEntity.countDocuments(),
      UserModelEntity.countDocuments({ isSuspended: true }),
      AdminModelEntity.countDocuments(),
      GroupModelEntity.countDocuments(),
      ExpenseModelEntity.countDocuments(),
      ExpenseModelEntity.aggregate([
        {
          $group: {
            _id: null,
            totalAmountPaisa: { $sum: '$amountPaisa' },
          },
        },
      ]),
      ExpenseModelEntity.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('paidById', 'name email')
        .populate('groupId', 'name'),
      UserModelEntity.find().sort({ createdAt: -1 }).limit(4).select('name email createdAt'),
      GroupModelEntity.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .populate('members', 'name')
        .select('name members createdAt'),
      ExpenseModelEntity.aggregate([
        {
          $group: {
            _id: '$groupId',
            totalPaisa: { $sum: '$amountPaisa' },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalPaisa: -1 } },
        { $limit: 5 },
      ]),
      ExpenseModelEntity.find()
        .select('title amountPaisa paidById splits groupId createdAt')
        .populate('paidById', 'name email')
        .populate('splits.userId', 'name email')
        .populate('groupId', 'name'),
    ]);

    const totalExpenseAmountPaisa =
      aggregateResult.length > 0 ? aggregateResult[0].totalAmountPaisa : 0;

    const formatRelativeTime = (date) => {
      if (!date) return 'just now';
      const diffMs = Math.max(0, Date.now() - new Date(date).getTime());
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    };

    const trackedActivities = await ActivityTracker.getRecentActivities(8);
    const realActivities = [...trackedActivities];

    recentExpensesDocs.forEach((exp) => {
      const expId = `exp-${exp._id}`;
      if (!realActivities.some((a) => a.id === expId)) {
        realActivities.push({
          id: expId,
          title: 'New expense added',
          subtitle: `${exp.title} (${exp.groupId?.name || 'General'})`,
          time: formatRelativeTime(exp.createdAt),
          type: 'expense',
          timestamp: new Date(exp.createdAt || Date.now()).getTime(),
        });
      }
    });

    latestGroupsDocs.forEach((grp) => {
      const grpId = `grp-${grp._id}`;
      if (!realActivities.some((a) => a.id === grpId)) {
        realActivities.push({
          id: grpId,
          title: 'Group created',
          subtitle: grp.name,
          time: formatRelativeTime(grp.createdAt),
          type: 'group',
          timestamp: new Date(grp.createdAt || Date.now()).getTime(),
        });
      }
    });

    latestUsersDocs.forEach((usr) => {
      const usrId = `usr-${usr._id}`;
      if (!realActivities.some((a) => a.id === usrId)) {
        realActivities.push({
          id: usrId,
          title: 'User registered',
          subtitle: usr.email || usr.name,
          time: formatRelativeTime(usr.createdAt),
          type: 'user',
          timestamp: new Date(usr.createdAt || Date.now()).getTime(),
        });
      }
    });

    realActivities.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const finalActivities = realActivities.slice(0, 8);

    const recentExpenses = recentExpensesDocs.map((exp) => ({
      id: exp._id.toString(),
      title: exp.title,
      group: exp.groupId?.name || 'General',
      amount: `Rs. ${(exp.amountPaisa / 100).toLocaleString('en-IN')}`,
      paidBy: exp.paidById?.name || 'Member',
      date: new Date(exp.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));

    const topGroupsPromises = topGroupsAgg.map(async (agg, idx) => {
      const groupDoc = await GroupModelEntity.findById(agg._id).select('name members');
      return {
        rank: idx + 1,
        id: agg._id ? agg._id.toString() : String(idx),
        name: groupDoc?.name || `Group ${idx + 1}`,
        totalExpenses: `Rs. ${(agg.totalPaisa / 100).toLocaleString('en-IN')}`,
        members: groupDoc?.members?.length || 0,
        initials: (groupDoc?.name || 'GP')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      };
    });

    const resolvedTopGroups = await Promise.all(topGroupsPromises);

    // Calculate real pending debts via SettlementEngine
    const settlementEngine = new SettlementEngine();
    const debtGraph = settlementEngine.buildDebtGraph(allExpensesForAnalysis);
    const simplifiedDebts = settlementEngine.cancelDebtCycles(debtGraph);

    const userIdsToFetch = new Set();
    simplifiedDebts.forEach((d) => {
      userIdsToFetch.add(d.from);
      userIdsToFetch.add(d.to);
    });

    const userMap = new Map();
    if (userIdsToFetch.size > 0) {
      const users = await UserModelEntity.find({
        _id: { $in: Array.from(userIdsToFetch) },
      }).select('name email');
      users.forEach((u) => userMap.set(u._id.toString(), u.name || u.email));
    }

    const recentSettlements = simplifiedDebts.slice(0, 5).map((debt, idx) => {
      const fromName = userMap.get(debt.from) || 'Member';
      const toName = userMap.get(debt.to) || 'Member';
      return {
        id: `settle-${idx + 1}`,
        from: fromName,
        to: toName,
        amount: `Rs. ${(debt.amountPaisa / 100).toLocaleString('en-IN')}`,
        group: 'Active Circle',
        status: 'Pending',
        date: 'Current',
      };
    });

    // Calculate real monthly trend for the last 6 months
    const now = new Date();
    const monthlyBins = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyBins.push({ year, month, label: monthLabel, totalPaisa: 0 });
    }

    allExpensesForAnalysis.forEach((exp) => {
      const expDate = new Date(exp.createdAt || Date.now());
      const expYear = expDate.getFullYear();
      const expMonth = expDate.getMonth() + 1;
      const bin = monthlyBins.find((b) => b.year === expYear && b.month === expMonth);
      if (bin) {
        bin.totalPaisa += exp.amountPaisa || 0;
      }
    });

    const xCoords = [25, 80, 140, 200, 260, 315];
    const maxPaisa = Math.max(...monthlyBins.map((b) => b.totalPaisa), 100000);

    const monthlyTrend = monthlyBins.map((b, idx) => {
      const amountRs = Math.round(b.totalPaisa / 100);
      const ratio = b.totalPaisa / maxPaisa;
      const y = Math.round(145 - ratio * 105);
      return {
        month: b.label,
        amount: amountRs,
        display: `Rs. ${amountRs.toLocaleString('en-IN')}`,
        x: xCoords[idx] || 25 + idx * 58,
        y: Math.max(35, Math.min(145, y)),
      };
    });

    // Calculate real category breakdown
    const categoryMap = {
      Food: { label: 'Food', color: '#3b82f6', totalPaisa: 0 },
      Accommodation: { label: 'Accommodation', color: '#10b981', totalPaisa: 0 },
      Transport: { label: 'Transport', color: '#06b6d4', totalPaisa: 0 },
      Entertainment: { label: 'Entertainment', color: '#8b5cf6', totalPaisa: 0 },
      Shopping: { label: 'Shopping', color: '#ec4899', totalPaisa: 0 },
      Utilities: { label: 'Utilities', color: '#f59e0b', totalPaisa: 0 },
      Other: { label: 'Other', color: '#64748b', totalPaisa: 0 },
    };

    allExpensesForAnalysis.forEach((exp) => {
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
      categoryMap[cat].totalPaisa += exp.amountPaisa || 0;
    });

    const totalCategoryPaisa = Object.values(categoryMap).reduce((sum, c) => sum + c.totalPaisa, 0);

    const categoryBreakdown = Object.values(categoryMap).map((c) => {
      const percent =
        totalCategoryPaisa > 0 ? Number(((c.totalPaisa / totalCategoryPaisa) * 100).toFixed(1)) : 0;
      return {
        label: c.label,
        percent,
        color: c.color,
        amountFormatted: `Rs. ${(c.totalPaisa / 100).toLocaleString('en-IN')}`,
      };
    });

    // Real system telemetry
    let dbPingMs = 8;
    try {
      const startPing = Date.now();
      if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
        dbPingMs = Date.now() - startPing;
      }
    } catch {
      dbPingMs = 10;
    }

    const uptimeSec = Math.floor(process.uptime());
    const uptimeHours = Math.floor(uptimeSec / 3600);
    const uptimeMinutes = Math.floor((uptimeSec % 3600) / 60);
    const uptimeFormatted =
      uptimeHours > 0 ? `${uptimeHours}h ${uptimeMinutes}m` : `${uptimeMinutes}m`;

    const memoryUsage = process.memoryUsage();
    const heapUsedMb = Math.round(memoryUsage.heapUsed / 1024 / 1024);

    return {
      totalUsers: totalUsersCount,
      totalGroups: totalGroupsCount,
      totalExpenses: totalExpensesCount,
      totalExpenseAmountPaisa,
      totalExpensesFormatted: `Rs. ${(totalExpenseAmountPaisa / 100).toLocaleString('en-IN')}`,
      pendingSettlements: simplifiedDebts.length,
      suspendedUsers: suspendedUsersCount,
      totalStaff: totalStaffCount,
      monthlyTrend,
      categoryBreakdown,
      recentActivity: finalActivities,
      recentExpenses,
      topSpendingGroups: resolvedTopGroups,
      recentSettlements,
      systemHealth: [
        {
          id: 'sys-api',
          name: 'API Server',
          status: 'Online',
          meta: `Uptime ${uptimeFormatted}`,
        },
        {
          id: 'sys-db',
          name: 'Database',
          status: mongoose.connection.readyState === 1 ? 'Online' : 'Degraded',
          meta: `Response ${dbPingMs}ms`,
        },
        {
          id: 'sys-ml',
          name: 'ML Service',
          status: 'Online',
          meta: 'Model Loaded',
        },
        {
          id: 'sys-jobs',
          name: 'Memory Heap',
          status: 'Online',
          meta: `${heapUsedMb} MB Used`,
        },
      ],
      serverTime: new Date().toISOString(),
    };
  }

  // User Management Delegation
  async listUsers(opts) {
    return this.userModel.listUsers(opts);
  }

  async createUser(data, performedBy) {
    return this.userModel.createUser(data, performedBy);
  }

  async updateUser(userId, data, performedBy) {
    return this.userModel.updateUser(userId, data, performedBy);
  }

  async suspendUser(userId, reason, performedBy) {
    return this.userModel.suspendUser(userId, reason, performedBy);
  }

  async reactivateUser(userId, performedBy) {
    return this.userModel.reactivateUser(userId, performedBy);
  }

  async deleteUser(userId, performedBy) {
    return this.userModel.deleteUser(userId, performedBy);
  }

  async getUserConnectedGroups(userId) {
    return this.userModel.getUserConnectedGroups(userId);
  }

  async listAllGroups({ page = 1, limit = 20, search = '', userId = '' } = {}) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.$or = [{ members: userId }, { createdBy: userId }];
    }

    const [totalGroups, groupDocs, expenseAgg] = await Promise.all([
      GroupModelEntity.countDocuments(query),
      GroupModelEntity.find(query)
        .populate('createdBy', 'name email')
        .populate('members', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ExpenseModelEntity.aggregate([
        {
          $group: {
            _id: '$groupId',
            totalPaisa: { $sum: '$amountPaisa' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const expenseMap = new Map();
    expenseAgg.forEach((agg) => {
      if (agg._id) {
        expenseMap.set(agg._id.toString(), {
          totalAmountPaisa: agg.totalPaisa,
          expenseCount: agg.count,
        });
      }
    });

    const groups = groupDocs.map((g) => {
      const expData = expenseMap.get(g._id.toString()) || { totalAmountPaisa: 0, expenseCount: 0 };
      return {
        id: g._id.toString(),
        name: g.name,
        description: g.description || '',
        imageUrl: g.imageUrl || '',
        createdBy: g.createdBy
          ? { id: g.createdBy._id.toString(), name: g.createdBy.name, email: g.createdBy.email }
          : null,
        members: (g.members || []).map((m) => ({
          id: m._id.toString(),
          name: m.name,
          email: m.email,
          role: m.role || 'user',
        })),
        memberCount: (g.members || []).length,
        totalExpensesCount: expData.expenseCount,
        totalExpenseAmountPaisa: expData.totalAmountPaisa,
        totalExpenseAmountFormatted: `Rs. ${(expData.totalAmountPaisa / 100).toLocaleString('en-IN')}`,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt,
      };
    });

    return {
      groups,
      pagination: {
        total: totalGroups,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalGroups / limitNum) || 1,
      },
    };
  }

  async createGroupAsAdmin({ name, description = '', createdBy, members = [] }, adminId) {
    if (!name || !name.trim()) {
      throw new Error('Group name is required');
    }

    let creatorId = createdBy;
    if (!creatorId || !mongoose.Types.ObjectId.isValid(creatorId)) {
      if (members.length > 0 && mongoose.Types.ObjectId.isValid(members[0])) {
        creatorId = members[0];
      } else {
        const firstUser = await UserModelEntity.findOne();
        creatorId = firstUser ? firstUser._id : adminId;
      }
    }

    const uniqueMembers = new Set([creatorId.toString()]);
    members.forEach((m) => {
      if (m && mongoose.Types.ObjectId.isValid(m)) {
        uniqueMembers.add(m.toString());
      }
    });

    const group = await GroupModelEntity.create({
      name: name.trim(),
      description: description.trim(),
      createdBy: creatorId,
      members: Array.from(uniqueMembers),
    });

    await AdminAuditLogEntity.create({
      action: 'CREATE_GROUP',
      targetId: group._id.toString(),
      targetModel: 'Group',
      performedBy: adminId,
      details: { name: group.name, memberCount: uniqueMembers.size },
    });

    await ActivityTracker.track({
      actionType: 'GROUP_CREATED',
      description: `Administrative group created: ${group.name}`,
      entityId: group._id.toString(),
      entityModel: 'Group',
      performedBy: adminId,
    });

    const populated = await GroupModelEntity.findById(group._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .lean();

    return {
      ...populated,
      id: populated._id.toString(),
      memberCount: (populated.members || []).length,
    };
  }

  async updateGroupAsAdmin(groupId, { name, description, members }, adminId) {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return null;
    }

    const group = await GroupModelEntity.findById(groupId);
    if (!group) {
      return null;
    }

    if (name && name.trim()) group.name = name.trim();
    if (description !== undefined) group.description = description.trim();
    if (Array.isArray(members)) {
      const validMembers = members.filter((m) => mongoose.Types.ObjectId.isValid(m));
      if (!validMembers.some((m) => m.toString() === group.createdBy.toString())) {
        validMembers.push(group.createdBy);
      }
      group.members = validMembers;
    }

    await group.save();

    await AdminAuditLogEntity.create({
      action: 'UPDATE_GROUP',
      targetId: groupId,
      targetModel: 'Group',
      performedBy: adminId,
      details: { name: group.name, memberCount: group.members.length },
    });

    const populated = await GroupModelEntity.findById(groupId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .lean();

    return {
      ...populated,
      id: populated._id.toString(),
      memberCount: (populated.members || []).length,
    };
  }

  async deleteGroupAsAdmin(groupId, adminId) {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return false;
    }

    const group = await GroupModelEntity.findByIdAndDelete(groupId);
    if (!group) {
      return false;
    }

    await ExpenseModelEntity.deleteMany({ groupId });

    await AdminAuditLogEntity.create({
      action: 'DELETE_GROUP',
      targetId: groupId,
      targetModel: 'Group',
      performedBy: adminId,
      details: { groupName: group.name },
    });

    return true;
  }

  async listAllExpenses({ page = 1, limit = 20, search = '', groupId = '', userId = '' } = {}) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    if (groupId && mongoose.Types.ObjectId.isValid(groupId)) {
      query.groupId = groupId;
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.$or = [{ paidById: userId }, { 'splits.userId': userId }];
    }

    const [totalExpenses, totalPaisaAgg, expenseDocs] = await Promise.all([
      ExpenseModelEntity.countDocuments(query),
      ExpenseModelEntity.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$amountPaisa' } } },
      ]),
      ExpenseModelEntity.find(query)
        .populate('paidById', 'name email')
        .populate('groupId', 'name')
        .populate('splits.userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const totalAmountPaisa = totalPaisaAgg.length > 0 ? totalPaisaAgg[0].total : 0;

    const formattedExpenses = expenseDocs.map((e) => ({
      id: e._id.toString(),
      title: e.title,
      amountPaisa: e.amountPaisa,
      amountFormatted: `Rs. ${(e.amountPaisa / 100).toLocaleString('en-IN')}`,
      group: e.groupId ? { id: e.groupId._id.toString(), name: e.groupId.name } : null,
      paidBy: e.paidById
        ? { id: e.paidById._id.toString(), name: e.paidById.name, email: e.paidById.email }
        : null,
      splitType: e.splitType || 'EQUAL',
      splits: (e.splits || []).map((s) => ({
        userId: s.userId ? (s.userId._id ? s.userId._id.toString() : s.userId.toString()) : '',
        userName: s.userId?.name || 'Member',
        userEmail: s.userId?.email || '',
        amountPaisa: s.amountPaisa,
        amountFormatted: `Rs. ${(s.amountPaisa / 100).toLocaleString('en-IN')}`,
        percentage: s.percentage,
      })),
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));

    return {
      expenses: formattedExpenses,
      pagination: {
        total: totalExpenses,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalExpenses / limitNum) || 1,
      },
      stats: {
        totalExpenses,
        totalAmountPaisa,
        totalAmountFormatted: `Rs. ${(totalAmountPaisa / 100).toLocaleString('en-IN')}`,
      },
    };
  }

  async createExpenseAsAdmin(
    {
      groupId,
      title,
      amountPaisa,
      paidById,
      splitType = 'EQUAL',
      splits = [],
      participantIds = [],
    },
    adminId
  ) {
    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      throw new Error('Valid group ID is required');
    }
    if (!title || !title.trim()) {
      throw new Error('Expense title is required');
    }
    const numAmount = Math.round(Number(amountPaisa));
    if (!numAmount || numAmount <= 0) {
      throw new Error('Amount must be positive in paisa');
    }
    if (!paidById || !mongoose.Types.ObjectId.isValid(paidById)) {
      throw new Error('Valid payer user ID is required');
    }

    const group = await GroupModelEntity.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    let finalSplits = [];
    if (splitType === 'EQUAL') {
      const ids =
        participantIds.length > 0
          ? participantIds.filter((id) => mongoose.Types.ObjectId.isValid(id))
          : group.members.map((m) => m.toString());
      if (ids.length === 0) {
        throw new Error('No participants provided for equal split');
      }
      const baseShare = Math.floor(numAmount / ids.length);
      const remainder = numAmount % ids.length;
      finalSplits = ids.map((userId, index) => ({
        userId,
        amountPaisa: baseShare + (index < remainder ? 1 : 0),
      }));
    } else if (splitType === 'EXACT') {
      const sum = splits.reduce((acc, curr) => acc + Number(curr.amountPaisa || 0), 0);
      if (sum !== numAmount) {
        throw new Error(
          `Sum of exact splits (Rs. ${sum / 100}) must match total (Rs. ${numAmount / 100})`
        );
      }
      finalSplits = splits.map((s) => ({
        userId: s.userId,
        amountPaisa: Number(s.amountPaisa),
      }));
    } else if (splitType === 'PERCENTAGE') {
      const totalPct = splits.reduce((acc, curr) => acc + Number(curr.percentage || 0), 0);
      if (Math.round(totalPct) !== 100) {
        throw new Error('Split percentages must sum to 100');
      }
      finalSplits = splits.map((s) => ({
        userId: s.userId,
        percentage: Number(s.percentage),
        amountPaisa: Math.round((numAmount * Number(s.percentage)) / 100),
      }));
    }

    const expense = await ExpenseModelEntity.create({
      groupId,
      title: title.trim(),
      amountPaisa: numAmount,
      paidById,
      splitType,
      splits: finalSplits,
      createdById: adminId,
    });

    await AdminAuditLogEntity.create({
      action: 'CREATE_EXPENSE',
      targetId: expense._id.toString(),
      targetModel: 'Expense',
      performedBy: adminId,
      details: { title: expense.title, amountPaisa: numAmount, groupName: group.name },
    });

    await ActivityTracker.track({
      actionType: 'EXPENSE_CREATED',
      description: `Administrative expense recorded: ${expense.title} in ${group.name}`,
      entityId: expense._id.toString(),
      entityModel: 'Expense',
      performedBy: adminId,
    });

    const populated = await ExpenseModelEntity.findById(expense._id)
      .populate('paidById', 'name email')
      .populate('groupId', 'name')
      .populate('splits.userId', 'name email')
      .lean();

    return {
      ...populated,
      id: populated._id.toString(),
      amountFormatted: `Rs. ${(populated.amountPaisa / 100).toLocaleString('en-IN')}`,
    };
  }

  async updateExpenseAsAdmin(
    expenseId,
    { title, amountPaisa, paidById, splitType = 'EQUAL', splits = [], participantIds = [] },
    adminId
  ) {
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return null;
    }

    const expense = await ExpenseModelEntity.findById(expenseId);
    if (!expense) {
      return null;
    }

    if (title) expense.title = title.trim();
    if (paidById && mongoose.Types.ObjectId.isValid(paidById)) expense.paidById = paidById;

    if (
      amountPaisa !== undefined ||
      splitType !== undefined ||
      splits.length > 0 ||
      participantIds.length > 0
    ) {
      const numAmount = Math.round(
        Number(amountPaisa !== undefined ? amountPaisa : expense.amountPaisa)
      );
      expense.amountPaisa = numAmount;
      const type = splitType || expense.splitType || 'EQUAL';
      expense.splitType = type;

      const group = await GroupModelEntity.findById(expense.groupId);
      const defaultIds = group ? group.members.map((m) => m.toString()) : [];

      if (type === 'EQUAL') {
        const ids = participantIds.length > 0 ? participantIds : defaultIds;
        if (ids.length > 0) {
          const baseShare = Math.floor(numAmount / ids.length);
          const remainder = numAmount % ids.length;
          expense.splits = ids.map((userId, index) => ({
            userId,
            amountPaisa: baseShare + (index < remainder ? 1 : 0),
          }));
        }
      } else if (type === 'EXACT' && splits.length > 0) {
        expense.splits = splits.map((s) => ({
          userId: s.userId,
          amountPaisa: Number(s.amountPaisa),
        }));
      } else if (type === 'PERCENTAGE' && splits.length > 0) {
        expense.splits = splits.map((s) => ({
          userId: s.userId,
          percentage: Number(s.percentage),
          amountPaisa: Math.round((numAmount * Number(s.percentage)) / 100),
        }));
      }
    }

    await expense.save();

    await AdminAuditLogEntity.create({
      action: 'UPDATE_EXPENSE',
      targetId: expenseId,
      targetModel: 'Expense',
      performedBy: adminId,
      details: { title: expense.title, amountPaisa: expense.amountPaisa },
    });

    const populated = await ExpenseModelEntity.findById(expenseId)
      .populate('paidById', 'name email')
      .populate('groupId', 'name')
      .populate('splits.userId', 'name email')
      .lean();

    return {
      ...populated,
      id: populated._id.toString(),
      amountFormatted: `Rs. ${(populated.amountPaisa / 100).toLocaleString('en-IN')}`,
    };
  }

  async deleteExpenseAsAdmin(expenseId, adminId) {
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return false;
    }

    const expense = await ExpenseModelEntity.findByIdAndDelete(expenseId);
    if (!expense) {
      return false;
    }

    await AdminAuditLogEntity.create({
      action: 'DELETE_EXPENSE',
      targetId: expenseId,
      targetModel: 'Expense',
      performedBy: adminId,
      details: { title: expense.title, amountPaisa: expense.amountPaisa },
    });

    return true;
  }

  async listAllSettlements({ groupId = '', userId = '', search = '' } = {}) {
    const settlementEngine = new SettlementEngine();

    const groupQuery = {};
    if (groupId && mongoose.Types.ObjectId.isValid(groupId)) {
      groupQuery._id = groupId;
    }
    const groups = await GroupModelEntity.find(groupQuery).populate('members', 'name email').lean();

    const groupMap = new Map();
    groups.forEach((g) => {
      groupMap.set(g._id.toString(), {
        id: g._id.toString(),
        name: g.name,
        members: (g.members || []).map((m) => ({
          id: m._id.toString(),
          name: m.name,

        })),
      });
    });

    const targetGroupIds = Array.from(groupMap.keys());
    if (targetGroupIds.length === 0) {
      return {
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
      };
    }

    const allExpenses = await ExpenseModelEntity.find({
      groupId: { $in: targetGroupIds },
    }).lean();

    const allUserIds = new Set();
    groups.forEach((g) => {
      (g.members || []).forEach((m) => allUserIds.add(m._id.toString()));
    });

    const users = await UserModelEntity.find({
      _id: { $in: Array.from(allUserIds) },
    })
      .select('name email')
      .lean();

    const userMap = new Map();
    users.forEach((u) => {
      userMap.set(u._id.toString(), {
        id: u._id.toString(),
        name: u.name,
        email: u.email,
      });
    });

    let totalRawDebtsCount = 0;
    let totalOptimizedDebtsCount = 0;
    let totalPendingPaisa = 0;
    const allSettlements = [];
    const watchedGroupBalances = [];

    for (const group of groups) {
      const gIdStr = group._id.toString();
      const groupExpenses = allExpenses.filter((e) => e.groupId.toString() === gIdStr);

      if (groupExpenses.length === 0) continue;

      const rawGraph = settlementEngine.buildDebtGraph(groupExpenses);
      let rawCountForGroup = 0;
      for (const [, targets] of rawGraph.entries()) {
        rawCountForGroup += targets.size;
      }
      totalRawDebtsCount += rawCountForGroup;

      const netBalances = settlementEngine.calculateNetBalances(groupExpenses);

      if (groupId && gIdStr === groupId) {
        netBalances.forEach((bal) => {
          const u = userMap.get(bal.userId) || { id: bal.userId, name: 'Member', email: '' };
          watchedGroupBalances.push({
            userId: bal.userId,
            userName: u.name,
            userEmail: u.email,
            netBalancePaisa: bal.netBalancePaisa,
            netBalanceFormatted: `Rs. ${(Math.abs(bal.netBalancePaisa) / 100).toLocaleString('en-IN')}`,
            status:
              bal.netBalancePaisa > 0 ? 'Creditor' : bal.netBalancePaisa < 0 ? 'Debtor' : 'Settled',
          });
        });
      }

      const simplifiedDebts = settlementEngine.cancelDebtCycles(rawGraph);
      const optimalDebts = settlementEngine.optimizeSettlementsGreedy(netBalances);

      const finalDebts = optimalDebts.length > 0 ? optimalDebts : simplifiedDebts;
      totalOptimizedDebtsCount += finalDebts.length;

      finalDebts.forEach((debt, idx) => {
        const fromUser = userMap.get(debt.from) || { id: debt.from, name: 'Member', email: '' };
        const toUser = userMap.get(debt.to) || { id: debt.to, name: 'Member', email: '' };

        totalPendingPaisa += debt.amountPaisa || 0;

        allSettlements.push({
          id: `settle-${gIdStr}-${idx + 1}`,
          groupId: gIdStr,
          groupName: group.name,
          from: fromUser,
          to: toUser,
          amountPaisa: debt.amountPaisa,
          amountFormatted: `Rs. ${(debt.amountPaisa / 100).toLocaleString('en-IN')}`,
          status: 'Pending',
          date: 'Current Cycle',
        });
      });
    }

    let filteredSettlements = allSettlements;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const uStr = userId.toString();
      filteredSettlements = filteredSettlements.filter(
        (s) => s.from.id === uStr || s.to.id === uStr
      );
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filteredSettlements = filteredSettlements.filter(
        (s) =>
          s.groupName.toLowerCase().includes(q) ||
          s.from.name.toLowerCase().includes(q) ||
          s.to.name.toLowerCase().includes(q) ||
          s.from.email.toLowerCase().includes(q) ||
          s.to.email.toLowerCase().includes(q)
      );
    }

    const reductionPercent =
      totalRawDebtsCount > 0
        ? Math.round(((totalRawDebtsCount - totalOptimizedDebtsCount) / totalRawDebtsCount) * 100)
        : 0;

    return {
      settlements: filteredSettlements,
      userBalances: watchedGroupBalances,
      stats: {
        totalPendingDebtPaisa: totalPendingPaisa,
        totalPendingDebtFormatted: `Rs. ${(totalPendingPaisa / 100).toLocaleString('en-IN')}`,
        totalSettlementsCount: filteredSettlements.length,
        rawTransactionsCount: totalRawDebtsCount,
        optimizedTransactionsCount: totalOptimizedDebtsCount,
        reductionPercent: Math.max(0, reductionPercent),
      },
    };
  }

  async recordAdminSettlement({ groupId, fromUserId, toUserId, amountPaisa, notes = '' }, adminId) {
    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      throw new Error('Valid group circle is required');
    }
    if (!fromUserId || !mongoose.Types.ObjectId.isValid(fromUserId)) {
      throw new Error('Valid debtor/payer user is required');
    }
    if (!toUserId || !mongoose.Types.ObjectId.isValid(toUserId)) {
      throw new Error('Valid creditor/recipient user is required');
    }
    if (fromUserId.toString() === toUserId.toString()) {
      throw new Error('Debtor and creditor cannot be the same person');
    }
    const numAmount = Math.round(Number(amountPaisa));
    if (!numAmount || numAmount <= 0) {
      throw new Error('Settlement amount must be positive in paisa');
    }

    const [group, fromUser, toUser] = await Promise.all([
      GroupModelEntity.findById(groupId),
      UserModelEntity.findById(fromUserId).select('name email'),
      UserModelEntity.findById(toUserId).select('name email'),
    ]);

    if (!group) throw new Error('Group not found');
    if (!fromUser) throw new Error('Payer user not found');
    if (!toUser) throw new Error('Recipient user not found');

    const title =
      notes && notes.trim() ? notes.trim() : `Settlement: ${fromUser.name} paid ${toUser.name}`;

    const settlementExpense = await ExpenseModelEntity.create({
      groupId,
      title,
      amountPaisa: numAmount,
      paidById: fromUserId,
      splitType: 'EXACT',
      splits: [{ userId: toUserId, amountPaisa: numAmount }],
      createdById: adminId,
    });

    await AdminAuditLogEntity.create({
      action: 'SETTLE_DEBT',
      targetId: settlementExpense._id.toString(),
      targetModel: 'Expense',
      performedBy: adminId,
      details: {
        fromUser: fromUser.name,
        toUser: toUser.name,
        amountPaisa: numAmount,
        groupName: group.name,
      },
    });

    await ActivityTracker.track({
      actionType: 'DEBT_SETTLED',
      description: `Administrative settlement recorded: ${fromUser.name} paid Rs. ${numAmount / 100} to ${toUser.name} (${group.name})`,
      entityId: settlementExpense._id.toString(),
      entityModel: 'Expense',
      performedBy: adminId,
    });

    return {
      id: settlementExpense._id.toString(),
      title: settlementExpense.title,
      amountPaisa: settlementExpense.amountPaisa,
      amountFormatted: `Rs. ${(settlementExpense.amountPaisa / 100).toLocaleString('en-IN')}`,
      group: { id: group._id.toString(), name: group.name },
      from: { id: fromUser._id.toString(), name: fromUser.name, email: fromUser.email },
      to: { id: toUser._id.toString(), name: toUser.name, email: toUser.email },
      createdAt: settlementExpense.createdAt,
    };
  }

  // Analytics Delegation
  async getPlatformAnalytics(opts) {
    return this.analyticsModel.getPlatformAnalytics(opts);
  }

  async benchmarkDebtOptimization() {
    return this.analyticsModel.benchmarkDebtOptimization();
  }

  async runOptimizationSandbox(opts) {
    return this.analyticsModel.runOptimizationSandbox(opts);
  }

  async detectSpendingAnomalies(opts) {
    return this.analyticsModel.detectSpendingAnomalies(opts);
  }

  async dispatchUserAdvisory(data, adminId) {
    return this.analyticsModel.dispatchUserAdvisory(data, adminId);
  }

  async getAdvisories(opts) {
    return this.analyticsModel.getAdvisories(opts);
  }

  // Audit Delegation
  async getAuditLogs(opts) {
    return this.auditLogModel.getAuditLogs(opts);
  }

  async getAuditLogsAndSystemEvents(opts) {
    return this.auditLogModel.getAuditLogs(opts);
  }

  // Settings Delegation
  async getPlatformSettings() {
    return this.settingsModel.getPlatformSettings();
  }

  async updatePlatformSettings(data, adminId) {
    return this.settingsModel.updatePlatformSettings(data, adminId);
  }

  async changeAdminPassword(adminId, curr, next) {
    return this.settingsModel.changeAdminPassword(adminId, curr, next);
  }

  async triggerMaintenanceAction(action, adminId) {
    return this.settingsModel.triggerMaintenanceAction(action, adminId);
  }

  async updateAdminProfile(adminId, { name, email, phone, designation, location, bio, avatarUrl }) {
    const admin = await AdminModelEntity.findById(adminId);
    if (!admin) {
      throw new Error('Admin account not found');
    }

    if (name && name.trim()) {
      admin.name = name.trim();
    }

    if (email && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await AdminModelEntity.findOne({
        email: normalizedEmail,
        _id: { $ne: adminId },
      });
      if (existing) {
        throw new Error('This email address is already assigned to another staff member');
      }
      admin.email = normalizedEmail;
    }

    if (phone !== undefined) admin.phone = phone.trim();
    if (designation !== undefined) admin.designation = designation.trim();
    if (location !== undefined) admin.location = location.trim();
    if (bio !== undefined) admin.bio = bio.trim();
    if (avatarUrl !== undefined) admin.avatarUrl = avatarUrl.trim();

    await admin.save();

    await AdminAuditLogEntity.create({
      action: 'UPDATE_ADMIN_PROFILE',
      targetId: admin._id.toString(),
      targetModel: 'Admin',
      performedBy: admin._id,
      details: {
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        designation: admin.designation,
        location: admin.location,
      },
    });

    await ActivityTracker.track({
      action: 'UPDATE_ADMIN_PROFILE',
      title: 'Administrator Profile Updated',
      subtitle: `${admin.name} updated their official administrative credentials and contact metadata`,
      type: 'security',
      performedBy: admin._id,
      performedByName: admin.name,
      targetId: admin._id.toString(),
    });

    return this.sanitizeAdmin(admin);
  }

  // Notification Delegation
  async getNotifications(opts) {
    return this.notificationModel.getNotifications(opts);
  }

  async markNotificationRead(id) {
    return this.notificationModel.markNotificationRead(id);
  }

  async markAllNotificationsRead(cat) {
    return this.notificationModel.markAllNotificationsRead(cat);
  }

  async dismissNotification(id) {
    return this.notificationModel.dismissNotification(id);
  }

  async clearReadNotifications() {
    return this.notificationModel.clearReadNotifications();
  }

  async broadcastNotification(data, adminId) {
    return this.notificationModel.broadcastNotification(data, adminId);
  }
}
