import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['SECURITY', 'FINANCIAL', 'ANOMALY', 'SYSTEM'],
      default: 'SYSTEM',
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'WARNING', 'INFO', 'SUCCESS'],
      default: 'INFO',
    },
    actionTab: {
      type: String,
      default: '',
    },
    actionLabel: {
      type: String,
      default: '',
    },
    read: {
      type: Boolean,
      default: false,
    },
    dismissed: {
      type: Boolean,
      default: false,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'admin_notifications',
  }
);

export const NotificationEntity =
  mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class NotificationModel {
  async seedDefaultNotifications() {
    try {
      const filePath = path.resolve(__dirname, '../../data/mock/notifications.json');
      const rawData = await fs.readFile(filePath, 'utf-8');
      const defaultSeeds = JSON.parse(rawData);
      await NotificationEntity.insertMany(defaultSeeds);
    } catch {
      // ignore if mock file unavailable
    }
  }

  async getNotifications({
    category = 'all',
    severity = 'all',
    read,
    search = '',
    limit = 50,
  } = {}) {
    const query = { dismissed: { $ne: true } };
    if (category && category !== 'all') {
      query.category = category.toUpperCase();
    }
    if (severity && severity !== 'all') {
      query.severity = severity.toUpperCase();
    }
    if (read !== undefined && read !== 'all') {
      query.read = read === true || read === 'true';
    }
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { message: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const items = await NotificationEntity.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 50)
      .lean();

    const allActive = await NotificationEntity.find({ dismissed: { $ne: true } }).lean();

    const summary = {
      total: allActive.length,
      unread: allActive.filter((n) => !n.read).length,
      critical: allActive.filter((n) => n.severity === 'CRITICAL').length,
      warning: allActive.filter((n) => n.severity === 'WARNING').length,
      financial: allActive.filter((n) => n.category === 'FINANCIAL').length,
      security: allActive.filter((n) => n.category === 'SECURITY').length,
      anomaly: allActive.filter((n) => n.category === 'ANOMALY').length,
      system: allActive.filter((n) => n.category === 'SYSTEM').length,
    };

    return {
      notifications: items.map((n) => ({
        ...n,
        id: n._id.toString(),
      })),
      summary,
    };
  }

  async markNotificationRead(id) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      await NotificationEntity.findByIdAndUpdate(id, { read: true });
    }
    return true;
  }

  async markAllNotificationsRead(category) {
    const filter = { dismissed: { $ne: true } };
    if (category && category !== 'all') {
      filter.category = category.toUpperCase();
    }
    await NotificationEntity.updateMany(filter, { read: true });
    return true;
  }

  async dismissNotification(id) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      await NotificationEntity.findByIdAndUpdate(id, { dismissed: true });
    }
    return true;
  }

  async clearReadNotifications() {
    await NotificationEntity.updateMany({ read: true }, { dismissed: true });
    return true;
  }

  async broadcastNotification(
    {
      title,
      message,
      category = 'SYSTEM',
      severity = 'INFO',
      actionTab = '',
      actionLabel = '',
      details = {},
    },
    adminId
  ) {
    const notif = await NotificationEntity.create({
      title: title.trim(),
      message: message.trim(),
      category: category.toUpperCase(),
      severity: severity.toUpperCase(),
      actionTab,
      actionLabel,
      details,
      createdBy: mongoose.Types.ObjectId.isValid(adminId) ? adminId : null,
    });
    return notif.toObject();
  }
}
