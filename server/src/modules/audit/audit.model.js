import mongoose from 'mongoose';
import { ActivityModelEntity } from '../activity/activity.model.js';

const adminAuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    targetModel: {
      type: String,
      enum: ['User', 'Admin', 'Group', 'Expense', 'Settlement', 'System', 'Algorithm'],
      default: 'User',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'admin_audit_logs',
  }
);

export const AdminAuditLogEntity =
  mongoose.models.AdminAuditLog || mongoose.model('AdminAuditLog', adminAuditLogSchema);

export class AuditLogModel {
  async record({ action, targetId, targetModel = 'User', performedBy, details = {} }) {
    if (!performedBy) return null;
    return AdminAuditLogEntity.create({
      action,
      targetId: targetId ? targetId.toString() : 'system',
      targetModel,
      performedBy,
      details,
    });
  }

  async getAuditLogs({ category = 'all', search = '', page = 1, limit = 20 } = {}) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));

    const [adminLogs, activities] = await Promise.all([
      AdminAuditLogEntity.find()
        .populate('performedBy', 'name email role')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      ActivityModelEntity.find()
        .populate('performedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
    ]);

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

    const unifiedList = [];

    adminLogs.forEach((log) => {
      let logCategory = 'SECURITY';
      let severity = 'INFO';
      const actionUpper = (log.action || '').toUpperCase();

      if (actionUpper.includes('EXPENSE') || actionUpper.includes('SETTLEMENT')) {
        logCategory = 'FINANCIAL';
      } else if (actionUpper.includes('GROUP')) {
        logCategory = 'GROUP';
      } else if (
        actionUpper.includes('SUSPEND') ||
        actionUpper.includes('DELETE') ||
        actionUpper.includes('ADVISORY')
      ) {
        logCategory = 'SECURITY';
        severity =
          actionUpper.includes('SUSPEND') || actionUpper.includes('DELETE') ? 'WARNING' : 'NOTICE';
      }

      unifiedList.push({
        id: `audit_${log._id.toString()}`,
        action: log.action || 'ADMIN_ACTION',
        category: logCategory,
        severity,
        operator: {
          id: log.performedBy?._id?.toString() || 'admin',
          name: log.performedBy?.name || 'Administrator',
          email: log.performedBy?.email || '',
          role: log.performedBy?.role || 'admin',
          type: 'admin',
        },
        target: {
          id: log.targetId || '',
          model: log.targetModel || 'System',
        },
        details: log.details || {},
        summary: `Admin performed ${log.action} on ${log.targetModel || 'Entity'}`,
        timestamp: log.createdAt,
        relativeTime: formatRelativeTime(log.createdAt),
        status: 'SUCCESS',
      });
    });

    activities.forEach((act) => {
      let actCategory = 'SYSTEM';
      let severity = 'INFO';

      if (act.type === 'security') {
        actCategory = 'SECURITY';
        severity = 'NOTICE';
      } else if (act.type === 'expense' || act.type === 'settlement') {
        actCategory = 'FINANCIAL';
      } else if (act.type === 'group' || act.type === 'member') {
        actCategory = 'GROUP';
      }

      unifiedList.push({
        id: `activity_${act._id.toString()}`,
        action: act.action || 'ACTIVITY_EVENT',
        category: actCategory,
        severity,
        operator: {
          id: act.performedBy?._id?.toString() || '',
          name: act.performedByName || act.performedBy?.name || 'System Actor',
          email: act.performedBy?.email || '',
          role: 'user',
          type: act.performedBy ? 'user' : 'system',
        },
        target: {
          id: act.targetId || '',
          model: act.type || 'System',
        },
        details: act.metadata || {},
        summary: act.title ? `${act.title}: ${act.subtitle || ''}` : act.action,
        timestamp: act.createdAt,
        relativeTime: formatRelativeTime(act.createdAt),
        status: 'SUCCESS',
      });
    });

    unifiedList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const totalCount = unifiedList.length;
    const securityCount = unifiedList.filter((l) => l.category === 'SECURITY').length;
    const financialCount = unifiedList.filter((l) => l.category === 'FINANCIAL').length;
    const groupCount = unifiedList.filter((l) => l.category === 'GROUP').length;
    const systemCount = unifiedList.filter((l) => l.category === 'SYSTEM').length;
    const uniqueOperators = new Set(unifiedList.map((l) => l.operator.name));

    let filtered = unifiedList;
    if (category && category !== 'all') {
      filtered = filtered.filter((l) => l.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter((l) => {
        const actionMatch = l.action.toLowerCase().includes(q);
        const nameMatch = l.operator.name.toLowerCase().includes(q);
        const emailMatch = l.operator.email.toLowerCase().includes(q);
        const summaryMatch = l.summary.toLowerCase().includes(q);
        const targetMatch = l.target.model.toLowerCase().includes(q);
        return actionMatch || nameMatch || emailMatch || summaryMatch || targetMatch;
      });
    }

    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / limitNum) || 1;
    const startIdx = (pageNum - 1) * limitNum;
    const paginatedItems = filtered.slice(startIdx, startIdx + limitNum);

    return {
      logs: paginatedItems,
      pagination: {
        total: totalFiltered,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
      summary: {
        totalEvents: totalCount,
        securityEvents: securityCount,
        financialEvents: financialCount,
        groupEvents: groupCount,
        systemEvents: systemCount,
        uniqueOperatorsCount: uniqueOperators.size,
      },
    };
  }
}
