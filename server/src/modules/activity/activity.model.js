import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['expense', 'group', 'settlement', 'user', 'category', 'member', 'security', 'system'],
      default: 'system',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    performedByName: {
      type: String,
      trim: true,
    },
    targetId: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'activities',
  }
);

activitySchema.index({ createdAt: -1 });

export const ActivityModelEntity =
  mongoose.models.Activity || mongoose.model('Activity', activitySchema);

function formatRelativeTime(date) {
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
}

export class ActivityTracker {
  static async track({
    action,
    title,
    subtitle,
    type = 'system',
    performedBy = null,
    performedByName = '',
    targetId = '',
    metadata = {},
  }) {
    try {
      const entry = await ActivityModelEntity.create({
        action,
        title,
        subtitle,
        type,
        performedBy: mongoose.Types.ObjectId.isValid(performedBy) ? performedBy : undefined,
        performedByName,
        targetId,
        metadata,
      });
      return entry;
    } catch {
      return null;
    }
  }

  static async getRecentActivities(limit = 8) {
    try {
      const records = await ActivityModelEntity.find().sort({ createdAt: -1 }).limit(limit);

      return records.map((rec) => ({
        id: rec._id.toString(),
        title: rec.title,
        subtitle: rec.subtitle,
        type: rec.type,
        time: formatRelativeTime(rec.createdAt),
        createdAt: rec.createdAt,
      }));
    } catch {
      return [];
    }
  }
}
