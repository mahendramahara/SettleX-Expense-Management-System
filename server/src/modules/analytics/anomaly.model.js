import mongoose from 'mongoose';

const anomalySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'EXPENSE_OUTLIER',
        'DISPROPORTIONATE_PAYER',
        'RAPID_EXPENSE_BURST',
        'CROSS_GROUP_DOMINANT',
        'HIGH_SETTLEMENT_DEVIATION',
        'CYCLIC_DEBT_CONGESTION',
      ],
      default: 'EXPENSE_OUTLIER',
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'ELEVATED', 'MODERATE', 'INFO'],
      default: 'MODERATE',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    headline: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null,
      index: true,
    },
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
      default: null,
    },
    metrics: {
      amountPaisa: { type: Number, default: 0 },
      groupTotalPaisa: { type: Number, default: 0 },
      expectedFairSharePaisa: { type: Number, default: 0 },
      totalPaidPaisa: { type: Number, default: 0 },
      overspendPaisa: { type: Number, default: 0 },
      overspendRatio: { type: Number, default: 1 },
      zScore: { type: Number, default: 0 },
      dominantCount: { type: Number, default: 0 },
      sharePercent: { type: Number, default: 0 },
      frequencyCount: { type: Number, default: 0 },
      groupBreakdown: { type: Array, default: [] },
    },
    primaryFactors: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['DETECTED', 'INVESTIGATING', 'ADVISED', 'RESOLVED', 'DISMISSED'],
      default: 'DETECTED',
      index: true,
    },
    resolutionNotes: {
      type: String,
      default: '',
      trim: true,
    },
    advisoriesSentCount: {
      type: Number,
      default: 0,
    },
    advisorySubject: {
      type: String,
      default: '',
      trim: true,
    },
    advisoryDraft: {
      type: String,
      default: '',
    },
    detectedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'anomalies',
  }
);

anomalySchema.index({ userId: 1, type: 1, groupId: 1, status: 1 });
anomalySchema.index({ severity: 1, status: 1 });

export const AnomalyModelEntity =
  mongoose.models.Anomaly || mongoose.model('Anomaly', anomalySchema);

export class AnomalyModel {
  async create(data) {
    return AnomalyModelEntity.create(data);
  }

  async findById(id) {
    return AnomalyModelEntity.findById(id)
      .populate('userId', 'name email avatar')
      .populate('groupId', 'name')
      .populate('expenseId', 'title amountPaisa');
  }

  async find(query = {}, options = {}) {
    const { sort = { detectedAt: -1 }, limit = 50, skip = 0 } = options;
    return AnomalyModelEntity.find(query)
      .populate('userId', 'name email avatar')
      .populate('groupId', 'name')
      .populate('expenseId', 'title amountPaisa')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async count(query = {}) {
    return AnomalyModelEntity.countDocuments(query);
  }

  async updateStatus(id, { status, resolutionNotes = '', adminId = null }) {
    const update = {
      status,
      resolutionNotes,
    };
    if (['RESOLVED', 'DISMISSED'].includes(status)) {
      update.resolvedAt = new Date();
    }
    return AnomalyModelEntity.findByIdAndUpdate(id, update, { new: true })
      .populate('userId', 'name email avatar')
      .populate('groupId', 'name');
  }

  async incrementAdvisories(id) {
    return AnomalyModelEntity.findByIdAndUpdate(
      id,
      {
        $inc: { advisoriesSentCount: 1 },
        status: 'ADVISED',
      },
      { new: true }
    );
  }
}
