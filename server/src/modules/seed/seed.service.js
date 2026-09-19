import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { UserModelEntity } from '../user/user.model.js';
import { AdminModelEntity } from '../admin/admin.model.js';
import { GroupModelEntity } from '../group/group.model.js';
import { ExpenseModelEntity } from '../expense/expense.model.js';
import { NotificationEntity } from '../notification/notification.model.js';
import { AdminAuditLogEntity } from '../audit/audit.model.js';
import { AnomalyModelEntity } from '../analytics/anomaly.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SeedService {
  constructor() {
    this.mockDir = path.resolve(__dirname, '../../data/mock');
  }

  async readMockJson(filename) {
    try {
      const filePath = path.join(this.mockDir, filename);
      const raw = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`Could not read mock file ${filename}:`, err.message);
      return [];
    }
  }

  async seedAll() {
    const counts = {
      users: 0,
      groups: 0,
      expenses: 0,
      notifications: 0,
      auditLogs: 0,
      anomalies: 0,
    };

    // 1. Seed Users
    const mockUsers = await this.readMockJson('users.json');
    const userMap = new Map();

    for (const u of mockUsers) {
      let existingUser = await UserModelEntity.findOne({ email: u.email.toLowerCase() });
      if (!existingUser) {
        const hashedPassword = bcrypt.hashSync(u.password, 10);
        existingUser = await UserModelEntity.create({
          ...u,
          email: u.email.toLowerCase(),
          password: hashedPassword,
        });
        counts.users += 1;
      }
      userMap.set(u.email.toLowerCase(), existingUser);
    }

    // Ensure superadmin exists
    let admin = await AdminModelEntity.findOne({ role: 'superadmin' });
    if (!admin) {
      const adminHash = bcrypt.hashSync('AdminSecure123!', 10);
      admin = await AdminModelEntity.create({
        name: 'Suman Sharma (Root)',
        email: 'suman.admin@settlex.com',
        password: adminHash,
        role: 'superadmin',
        designation: 'Chief System Administrator',
        permissions: [
          'users:read', 'users:create', 'users:update', 'users:delete', 'users:suspend',
          'expenses:read', 'expenses:create', 'expenses:update', 'expenses:delete',
          'groups:read', 'groups:create', 'groups:update', 'groups:delete',
          'settlements:read', 'settlements:create', 'settlements:update', 'settlements:delete',
          'notifications:read', 'notifications:create', 'notifications:update', 'notifications:delete',
          'analytics:read', 'system:settings', 'audit:read', 'staff:manage', 'system:manage'
        ],
      });
    }

    // 2. Seed Groups
    const mockGroups = await this.readMockJson('groups.json');
    const groupMap = new Map();

    for (const g of mockGroups) {
      let existingGroup = await GroupModelEntity.findOne({ name: g.name });
      if (!existingGroup) {
        const owner = userMap.get(g.ownerEmail.toLowerCase()) || Array.from(userMap.values())[0];
        const memberIds = (g.memberEmails || [])
          .map((email) => userMap.get(email.toLowerCase())?._id)
          .filter(Boolean);

        existingGroup = await GroupModelEntity.create({
          name: g.name,
          description: g.description,
          createdBy: owner?._id,
          members: memberIds.length > 0 ? memberIds : [owner?._id],
        });
        counts.groups += 1;
      }
      groupMap.set(g.name, existingGroup);
    }

    // 3. Seed Expenses
    const mockExpenses = await this.readMockJson('expenses.json');
    for (const exp of mockExpenses) {
      const group = groupMap.get(exp.groupName);
      if (group) {
        const existingExp = await ExpenseModelEntity.findOne({
          groupId: group._id,
          title: exp.title,
        });

        if (!existingExp) {
          const payer = userMap.get(exp.paidByEmail.toLowerCase()) || group.members[0];
          const participants = group.members;
          const share = Math.floor(exp.amountPaisa / participants.length);

          await ExpenseModelEntity.create({
            groupId: group._id,
            title: exp.title,
            amountPaisa: exp.amountPaisa,
            paidById: payer._id || payer,
            splitType: exp.splitType || 'EQUAL',
            category: exp.category || 'General',
            createdById: payer._id || payer,
            splits: participants.map((mId) => ({
              userId: mId,
              amountPaisa: share,
            })),
          });
          counts.expenses += 1;
        }
      }
    }

    // 4. Seed Notifications
    const mockNotifications = await this.readMockJson('notifications.json');
    for (const notif of mockNotifications) {
      const existing = await NotificationEntity.findOne({ title: notif.title });
      if (!existing) {
        await NotificationEntity.create(notif);
        counts.notifications += 1;
      }
    }

    // 5. Seed Audit Logs
    const mockLogs = await this.readMockJson('audit-logs.json');
    for (const log of mockLogs) {
      const existing = await AdminAuditLogEntity.findOne({ action: log.action });
      if (!existing && admin) {
        await AdminAuditLogEntity.create({
          action: log.action,
          targetId: log.details?.recipient || log.details?.group || 'system',
          targetModel: log.targetModel || 'System',
          performedBy: admin._id,
          details: log.details || {},
        });
        counts.auditLogs += 1;
      }
    }

    // 6. Seed Anomalies
    const mockAnomalies = await this.readMockJson('anomalies.json');
    const firstGroup = Array.from(groupMap.values())[0];
    const firstUser = Array.from(userMap.values())[0];

    for (const anom of mockAnomalies) {
      const existing = await AnomalyModelEntity.findOne({ title: anom.title });
      if (!existing && firstGroup && firstUser) {
        await AnomalyModelEntity.create({
          ...anom,
          groupId: firstGroup._id,
          userId: firstUser._id,
          detectedAt: new Date(),
        });
        counts.anomalies += 1;
      }
    }

    return counts;
  }

  async getSeedStatus() {
    const [usersCount, groupsCount, expensesCount, notifsCount] = await Promise.all([
      UserModelEntity.countDocuments(),
      GroupModelEntity.countDocuments(),
      ExpenseModelEntity.countDocuments(),
      NotificationEntity.countDocuments(),
    ]);

    return {
      isSeeded: usersCount > 0 && groupsCount > 0,
      counts: {
        users: usersCount,
        groups: groupsCount,
        expenses: expensesCount,
        notifications: notifsCount,
      },
    };
  }
}
