import mongoose from 'mongoose';

const expenseSplitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amountPaisa: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amountPaisa: {
      type: Number,
      required: true,
      min: 1,
    },
    paidById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    splitType: {
      type: String,
      enum: ['EQUAL', 'EXACT', 'PERCENTAGE'],
      default: 'EQUAL',
    },
    splits: [expenseSplitSchema],
    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const ExpenseModelEntity =
  mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

export class ExpenseModel {
  async getAll() {
    const expenses = await ExpenseModelEntity.find()
      .populate('paidById', 'name email')
      .populate('splits.userId', 'name email');
    return expenses.map((e) => this.formatExpense(e));
  }

  async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const expense = await ExpenseModelEntity.findById(id)
      .populate('paidById', 'name email')
      .populate('splits.userId', 'name email');
    return expense ? this.formatExpense(expense) : null;
  }

  async getByGroupId(groupId) {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return [];
    }
    const expenses = await ExpenseModelEntity.find({ groupId })
      .populate('paidById', 'name email')
      .populate('splits.userId', 'name email');
    return expenses.map((e) => this.formatExpense(e));
  }

  calculateEqualSplits(totalAmountPaisa, participantIds) {
    const count = participantIds.length;
    if (count === 0) {
      throw new Error('At least one participant is required for expense split');
    }

    const baseShare = Math.floor(totalAmountPaisa / count);
    const remainder = totalAmountPaisa % count;

    return participantIds.map((userId, index) => ({
      userId,
      amountPaisa: baseShare + (index < remainder ? 1 : 0),
    }));
  }

  validateSplits(totalAmountPaisa, splitType, splits) {
    if (!Array.isArray(splits) || splits.length === 0) {
      throw new Error('Splits array cannot be empty');
    }

    if (splitType === 'PERCENTAGE') {
      const totalPercentage = splits.reduce((acc, curr) => acc + Number(curr.percentage || 0), 0);
      if (Math.round(totalPercentage) !== 100) {
        throw new Error('Split percentages must sum to 100');
      }
      return splits.map((item) => ({
        userId: item.userId,
        percentage: Number(item.percentage),
        amountPaisa: Math.round((totalAmountPaisa * Number(item.percentage)) / 100),
      }));
    }

    if (splitType === 'EXACT') {
      const sumPaisa = splits.reduce((acc, curr) => acc + Number(curr.amountPaisa || 0), 0);
      if (sumPaisa !== totalAmountPaisa) {
        throw new Error('Sum of exact split amounts must match the total expense amount');
      }
      return splits.map((item) => ({
        userId: item.userId,
        amountPaisa: Number(item.amountPaisa),
      }));
    }

    return splits;
  }

  async create({
    groupId,
    title,
    amountPaisa,
    paidById,
    splitType = 'EQUAL',
    splits = [],
    participantIds = [],
    createdById,
  }) {
    const numAmount = Number(amountPaisa);
    if (!numAmount || numAmount <= 0) {
      throw new Error('Amount must be a positive integer in paisa');
    }

    let finalSplits = [];
    if (splitType === 'EQUAL') {
      const ids = participantIds.length > 0 ? participantIds : splits.map((s) => s.userId);
      finalSplits = this.calculateEqualSplits(numAmount, ids);
    } else {
      finalSplits = this.validateSplits(numAmount, splitType, splits);
    }

    const expense = await ExpenseModelEntity.create({
      groupId,
      title: title.trim(),
      amountPaisa: numAmount,
      paidById,
      splitType,
      splits: finalSplits,
      createdById: createdById || paidById,
    });

    const populated = await ExpenseModelEntity.findById(expense._id)
      .populate('paidById', 'name email')
      .populate('splits.userId', 'name email');

    return this.formatExpense(populated);
  }

  async getUserExpenses(userId, groupIds = []) {
    const validGroupIds = (groupIds || []).filter((id) => mongoose.Types.ObjectId.isValid(id));
    const query = {
      $or: [
        ...(validGroupIds.length > 0 ? [{ groupId: { $in: validGroupIds } }] : []),
        ...(mongoose.Types.ObjectId.isValid(userId) ? [{ paidById: userId }] : []),
        ...(mongoose.Types.ObjectId.isValid(userId) ? [{ 'splits.userId': userId }] : []),
      ],
    };

    if (query.$or.length === 0) {
      return [];
    }

    const expenses = await ExpenseModelEntity.find(query)
      .sort({ createdAt: -1 })
      .populate('paidById', 'name email')
      .populate('splits.userId', 'name email')
      .populate('groupId', 'name');

    return expenses.map((e) => {
      const formatted = this.formatExpense(e);
      if (e.groupId && typeof e.groupId === 'object' && e.groupId.name) {
        formatted.groupName = e.groupId.name;
      }
      return formatted;
    });
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

  async update(id, { title, amountPaisa, paidById, splitType, splits = [], participantIds = [] }) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const expense = await ExpenseModelEntity.findById(id);
    if (!expense) {
      return null;
    }

    if (title && title.trim()) expense.title = title.trim();
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

      const GroupModelEntity = mongoose.models.Group;
      const group = GroupModelEntity ? await GroupModelEntity.findById(expense.groupId) : null;
      const defaultIds = group ? group.members.map((m) => m.toString()) : [];

      if (type === 'EQUAL') {
        const ids = participantIds.length > 0 ? participantIds : defaultIds;
        if (ids.length > 0) {
          const baseShare = Math.floor(numAmount / ids.length);
          const remainder = numAmount % ids.length;
          expense.splits = ids.map((uId, index) => ({
            userId: uId,
            amountPaisa: baseShare + (index < remainder ? 1 : 0),
          }));
        }
      } else if (type === 'EXACT') {
        if (splits.length > 0) {
          expense.splits = splits.map((s) => ({
            userId: s.userId,
            amountPaisa: Number(s.amountPaisa),
          }));
        }
      } else if (type === 'PERCENTAGE') {
        if (splits.length > 0) {
          expense.splits = splits.map((s) => ({
            userId: s.userId,
            percentage: Number(s.percentage),
            amountPaisa: Math.round((numAmount * Number(s.percentage)) / 100),
          }));
        }
      }
    }

    await expense.save();

    const populated = await ExpenseModelEntity.findById(id)
      .populate('paidById', 'name email')
      .populate('groupId', 'name')
      .populate('splits.userId', 'name email');

    return this.formatExpense(populated);
  }

  async delete(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const res = await ExpenseModelEntity.findByIdAndDelete(id);
    return Boolean(res);
  }

  formatExpense(expenseDoc) {
    if (!expenseDoc) return null;
    const plain = expenseDoc.toObject ? expenseDoc.toObject() : { ...expenseDoc };
    const { __v, ...safe } = plain;
    safe.id = safe._id.toString();
    safe.groupId =
      safe.groupId && safe.groupId._id
        ? safe.groupId._id.toString()
        : (safe.groupId || '').toString();
    if (safe.groupId && typeof plain.groupId === 'object' && plain.groupId?.name) {
      safe.groupName = plain.groupId.name;
    }
    safe.paidByName = plain.paidById?.name || 'Member';
    safe.paidById =
      safe.paidById && safe.paidById._id
        ? safe.paidById._id.toString()
        : (safe.paidById || '').toString();
    safe.splits = (safe.splits || []).map((s) => ({
      userId: s.userId && s.userId._id ? s.userId._id.toString() : (s.userId || '').toString(),
      userName: s.userId?.name || 'Member',
      amountPaisa: s.amountPaisa,
      percentage: s.percentage,
    }));
    return safe;
  }

  async clear() {
    await ExpenseModelEntity.deleteMany({});
  }
}
