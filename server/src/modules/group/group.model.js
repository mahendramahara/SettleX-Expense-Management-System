import mongoose from 'mongoose';
import { ExpenseModelEntity } from '../expense/expense.model.js';

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const GroupModelEntity = mongoose.models.Group || mongoose.model('Group', groupSchema);

export class GroupModel {
  async seedDefaultGroup(userIds = []) {
    if (userIds.length === 0) {
      return;
    }

    const existing = await GroupModelEntity.findOne({ name: 'Kathmandu Flatmate Expenses' });
    if (!existing) {
      await this.create({
        name: 'Kathmandu Flatmate Expenses',
        description: 'Shared rent, groceries, and utilities in Kathmandu',
        createdBy: userIds[0],
        members: userIds,
      });
    }
  }

  async getAll() {
    const groups = await GroupModelEntity.find().populate('members', 'name email role');
    return groups.map((g) => this.formatGroup(g));
  }

  async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const group = await GroupModelEntity.findById(id).populate('members', 'name email role');
    return group ? this.formatGroup(group) : null;
  }

  async getUserGroups(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }
    const groups = await GroupModelEntity.find({ members: userId }).populate(
      'members',
      'name email role'
    );
    return groups.map((g) => this.formatGroup(g));
  }

  async create({ name, description = '', createdBy, members = [], imageUrl = '' }) {
    const memberSet = new Set([createdBy.toString(), ...members.map((m) => m.toString())]);
    const group = await GroupModelEntity.create({
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      createdBy,
      members: Array.from(memberSet),
    });

    const populated = await GroupModelEntity.findById(group._id).populate(
      'members',
      'name email role'
    );
    return this.formatGroup(populated);
  }

  async addMember(groupId, userId) {
    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const group = await GroupModelEntity.findById(groupId);
    if (!group) {
      return null;
    }

    const alreadyMember = group.members.some((m) => m.toString() === userId.toString());
    if (!alreadyMember) {
      group.members.push(userId);
      await group.save();
    }

    const populated = await GroupModelEntity.findById(groupId).populate(
      'members',
      'name email role'
    );
    return this.formatGroup(populated);
  }

  async removeMember(groupId, userId) {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return null;
    }

    const updated = await GroupModelEntity.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } },
      { returnDocument: 'after' }
    ).populate('members', 'name email role');

    return updated ? this.formatGroup(updated) : null;
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

  async updateGroup(groupId, { name, description, members, imageUrl }) {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return null;
    }

    const group = await GroupModelEntity.findById(groupId);
    if (!group) {
      return null;
    }

    if (name && name.trim()) group.name = name.trim();
    if (description !== undefined) group.description = description.trim();
    if (imageUrl !== undefined) group.imageUrl = imageUrl.trim();
    if (Array.isArray(members)) {
      const validMembers = members.filter((m) => mongoose.Types.ObjectId.isValid(m));
      if (!validMembers.some((m) => m.toString() === group.createdBy.toString())) {
        validMembers.push(group.createdBy);
      }
      group.members = validMembers;
    }

    await group.save();

    const populated = await GroupModelEntity.findById(groupId)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    return this.formatGroup(populated);
  }

  async deleteGroup(groupId) {
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return false;
    }

    const group = await GroupModelEntity.findByIdAndDelete(groupId);
    if (!group) {
      return false;
    }

    await ExpenseModelEntity.deleteMany({ groupId });
    return true;
  }

  formatGroup(groupDoc) {
    if (!groupDoc) return null;
    const plain = groupDoc.toObject ? groupDoc.toObject() : { ...groupDoc };
    const { __v, ...safeGroup } = plain;
    safeGroup.id = safeGroup._id.toString();
    safeGroup.createdBy = safeGroup.createdBy.toString();
    if (Array.isArray(safeGroup.members)) {
      safeGroup.memberIds = safeGroup.members.map((m) => (m._id ? m._id.toString() : m.toString()));
      safeGroup.members = safeGroup.members.map((m) => {
        if (m && typeof m === 'object') {
          return {
            ...m,
            id: (m._id ? m._id.toString() : m.id || '').toString(),
            _id: (m._id ? m._id.toString() : m.id || '').toString(),
          };
        }
        return m;
      });
    }
    return safeGroup;
  }

  async clear() {
    await GroupModelEntity.deleteMany({});
  }
}
