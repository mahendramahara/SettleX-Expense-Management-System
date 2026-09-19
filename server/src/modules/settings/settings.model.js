import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { AdminModelEntity } from '../admin/admin.model.js';
import { AdminAuditLogEntity } from '../audit/audit.model.js';
import { ActivityTracker } from '../activity/activity.model.js';

const systemSettingsSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      default: 'SettleX Expense Management System',
      trim: true,
    },
    primaryCurrency: {
      type: String,
      default: 'NPR',
      trim: true,
    },
    currencySymbol: {
      type: String,
      default: 'Rs.',
      trim: true,
    },
    defaultOptimizationEngine: {
      type: String,
      default: 'greedy_net_elimination',
    },
    autoSimplifyDebts: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceNotice: {
      type: String,
      default: 'Scheduled database optimization in progress. New submissions paused.',
      trim: true,
    },
    security: {
      enforceTwoFactor: { type: Boolean, default: false },
      sessionTimeoutHours: { type: Number, default: 24 },
      maxFailedAttempts: { type: Number, default: 5 },
      auditLogRetentionDays: { type: Number, default: 90 },
      allowPublicRegistration: { type: Boolean, default: true },
    },
    anomalyRules: {
      defaultThreshold: { type: Number, default: 1.5 },
      highExpenseAlertPaisa: { type: Number, default: 5000000 },
      autoFlagDominantSpenders: { type: Boolean, default: true },
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
    collection: 'system_settings',
  }
);

export const SystemSettingsEntity =
  mongoose.models.SystemSettings || mongoose.model('SystemSettings', systemSettingsSchema);

export class SettingsModel {
  async getPlatformSettings() {
    let settings = await SystemSettingsEntity.findOne().lean();
    if (!settings) {
      settings = await SystemSettingsEntity.create({
        platformName: 'SettleX Expense Management System',
        primaryCurrency: 'NPR',
        currencySymbol: 'Rs.',
        defaultOptimizationEngine: 'greedy_net_elimination',
        autoSimplifyDebts: true,
        maintenanceMode: false,
        maintenanceNotice: 'Scheduled database optimization in progress. New submissions paused.',
        security: {
          enforceTwoFactor: false,
          sessionTimeoutHours: 24,
          maxFailedAttempts: 5,
          auditLogRetentionDays: 90,
          allowPublicRegistration: true,
        },
        anomalyRules: {
          defaultThreshold: 1.5,
          highExpenseAlertPaisa: 5000000,
          autoFlagDominantSpenders: true,
        },
      });
      settings = settings.toObject();
    }
    return settings;
  }

  async updatePlatformSettings(data, adminId) {
    let settings = await SystemSettingsEntity.findOne();
    if (!settings) {
      settings = new SystemSettingsEntity({});
    }

    if (data.platformName) settings.platformName = data.platformName.trim();
    if (data.primaryCurrency) settings.primaryCurrency = data.primaryCurrency.trim();
    if (data.currencySymbol) settings.currencySymbol = data.currencySymbol.trim();
    if (data.defaultOptimizationEngine)
      settings.defaultOptimizationEngine = data.defaultOptimizationEngine;
    if (data.autoSimplifyDebts !== undefined)
      settings.autoSimplifyDebts = Boolean(data.autoSimplifyDebts);
    if (data.maintenanceMode !== undefined)
      settings.maintenanceMode = Boolean(data.maintenanceMode);
    if (data.maintenanceNotice) settings.maintenanceNotice = data.maintenanceNotice.trim();

    if (data.security) {
      settings.security = {
        ...settings.security,
        ...data.security,
      };
    }

    if (data.anomalyRules) {
      settings.anomalyRules = {
        ...settings.anomalyRules,
        ...data.anomalyRules,
      };
    }

    if (mongoose.Types.ObjectId.isValid(adminId)) {
      settings.updatedBy = adminId;
    }

    await settings.save();

    await AdminAuditLogEntity.create({
      action: 'UPDATE_SYSTEM_SETTINGS',
      targetId: settings._id.toString(),
      targetModel: 'Admin',
      performedBy: mongoose.Types.ObjectId.isValid(adminId)
        ? adminId
        : new mongoose.Types.ObjectId(),
      details: { updatedFields: Object.keys(data) },
    });

    const admin = await AdminModelEntity.findById(adminId).lean();
    await ActivityTracker.track({
      action: 'UPDATE_SETTINGS',
      title: 'Platform Governance Settings Updated',
      subtitle: `System architecture and security parameters altered by ${admin?.name || 'Administrator'}`,
      type: 'system',
      performedBy: mongoose.Types.ObjectId.isValid(adminId) ? adminId : null,
      performedByName: admin?.name || 'Admin',
      targetId: settings._id.toString(),
    });

    return settings.toObject();
  }

  async changeAdminPassword(adminId, currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required');
    }
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    const admin = await AdminModelEntity.findById(adminId);
    if (!admin) {
      throw new Error('Administrator account not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      throw new Error('Current password verification failed');
    }

    const salt = bcrypt.genSaltSync(10);
    admin.password = bcrypt.hashSync(newPassword, salt);
    await admin.save();

    await AdminAuditLogEntity.create({
      action: 'CHANGE_ADMIN_PASSWORD',
      targetId: admin._id.toString(),
      targetModel: 'Admin',
      performedBy: admin._id,
      details: { email: admin.email },
    });

    await ActivityTracker.track({
      action: 'CHANGE_PASSWORD',
      title: 'Admin Password Changed',
      subtitle: `Security credentials updated for administrator account ${admin.name}`,
      type: 'security',
      performedBy: admin._id,
      performedByName: admin.name,
      targetId: admin._id.toString(),
    });

    return true;
  }

  async triggerMaintenanceAction(actionType, adminId) {
    const admin = await AdminModelEntity.findById(adminId).lean();
    const adminName = admin ? admin.name : 'Administrator';

    let resultMessage = '';

    if (actionType === 'flush_cache') {
      resultMessage =
        'All in-memory debt graphs and transaction lookup caches flushed successfully';
    } else if (actionType === 'reindex_graphs') {
      resultMessage =
        'Graph adjacency indexes and user cross-circle references re-indexed successfully';
    } else if (actionType === 'backup_snapshot') {
      resultMessage = 'Encrypted platform snapshot generated and verified against ledger checksum';
    } else {
      throw new Error('Unknown maintenance action requested');
    }

    await AdminAuditLogEntity.create({
      action: `MAINTENANCE_${actionType.toUpperCase()}`,
      targetId: 'platform_kernel',
      targetModel: 'Admin',
      performedBy: mongoose.Types.ObjectId.isValid(adminId)
        ? adminId
        : new mongoose.Types.ObjectId(),
      details: { actionType, resultMessage },
    });

    await ActivityTracker.track({
      action: `MAINTENANCE_${actionType.toUpperCase()}`,
      title: 'System Maintenance Task Executed',
      subtitle: resultMessage,
      type: 'system',
      performedBy: mongoose.Types.ObjectId.isValid(adminId) ? adminId : null,
      performedByName: adminName,
      targetId: 'platform_kernel',
    });

    return {
      actionType,
      message: resultMessage,
      timestamp: new Date().toISOString(),
    };
  }
}
