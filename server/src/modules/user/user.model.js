import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { AdminAuditLogEntity } from '../audit/audit.model.js';
import { ActivityTracker, ActivityModelEntity } from '../activity/activity.model.js';
import { GroupModelEntity } from '../group/group.model.js';
import { ExpenseModelEntity } from '../expense/expense.model.js';
import { TokenModelEntity } from '../auth/token.model.js';
import { NotificationEntity } from '../notification/notification.model.js';

const userSchema = new mongoose.Schema(
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
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    role: {
      type: String,
      default: 'user',
    },
    privileges: {
      type: [String],
      default: ['group:create', 'expense:create', 'settlement:create'],
    },
    tier: {
      type: String,
      enum: ['free', 'premium', 'student'],
      default: 'free',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspensionReason: {
      type: String,
      default: '',
    },
    suspendedAt: {
      type: Date,
    },
    suspendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    currencyPreference: {
      type: String,
      default: 'NPR',
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

export const UserModelEntity = mongoose.models.User || mongoose.model('User', userSchema);

export class UserModel {
  sanitizeUser(userDoc) {
    if (!userDoc) return null;
    const plain = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
    const { password, otp, resetOtp, __v, ...safeUser } = plain;
    safeUser.id = safeUser._id ? safeUser._id.toString() : safeUser.id;
    return safeUser;
  }

  async getAll({ search = '', role = '', tier = '', page = 1, limit = 10 } = {}) {
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    if (role) {
      query.role = role;
    }

    if (tier && ['free', 'premium', 'student'].includes(tier)) {
      query.tier = tier;
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [total, users] = await Promise.all([
      UserModelEntity.countDocuments(query),
      UserModelEntity.find(query)
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    return {
      users: users.map((u) => {
        const obj = u.toObject();
        obj.id = obj._id.toString();
        return obj;
      }),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  async listUsers({ page = 1, limit = 20, search = '', status = 'all' } = {}) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }];
    }

    if (status === 'active') {
      query.isSuspended = { $ne: true };
    } else if (status === 'suspended') {
      query.isSuspended = true;
    }

    const [totalUsers, activeCount, suspendedCount, verifiedCount, users] = await Promise.all([
      UserModelEntity.countDocuments(query),
      UserModelEntity.countDocuments({ isSuspended: { $ne: true } }),
      UserModelEntity.countDocuments({ isSuspended: true }),
      UserModelEntity.countDocuments({ isVerified: true }),
      UserModelEntity.find(query)
        .select('-password -otp -resetOtp -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const formattedUsers = users.map((u) => ({
      ...u,
      id: u._id.toString(),
    }));

    return {
      users: formattedUsers,
      pagination: {
        total: totalUsers,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalUsers / limitNum) || 1,
      },
      counts: {
        total: totalUsers,
        active: activeCount,
        suspended: suspendedCount,
        verified: verifiedCount,
      },
    };
  }

  async createUser(
    { name, email, password, phone, role = 'user', tier = 'free', isVerified = true },
    performedBy
  ) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = await UserModelEntity.findOne({ email: cleanEmail });
    if (existing) {
      throw new Error('A user with this email already exists');
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password || 'Settlex@123', salt);

    const newUser = await UserModelEntity.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role: role || 'user',
      tier: tier || 'free',
      isVerified: Boolean(isVerified),
      isSuspended: false,
    });

    if (performedBy) {
      await AdminAuditLogEntity.create({
        action: 'CREATE_USER',
        targetId: newUser._id.toString(),
        targetModel: 'User',
        performedBy,
        details: { email: cleanEmail, name: newUser.name, role: newUser.role },
      });
    }

    await ActivityTracker.track({
      actionType: 'USER_REGISTERED',
      description: `User account created: ${newUser.name} (${cleanEmail})`,
      userId: newUser._id,
      entityId: newUser._id.toString(),
      entityModel: 'User',
      performedBy,
    });

    const plain = newUser.toObject();
    const { password: _, otp: _o, resetOtp: _r, __v: _v, ...safe } = plain;
    safe.id = safe._id.toString();
    return safe;
  }

  async updateUser(userId, { name, email, phone, role, tier, isVerified, password }, performedBy) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const user = await UserModelEntity.findById(userId);
    if (!user) {
      return null;
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      const cleanEmail = email.toLowerCase().trim();
      const existing = await UserModelEntity.findOne({ email: cleanEmail, _id: { $ne: userId } });
      if (existing) {
        throw new Error('Another user already exists with this email');
      }
      user.email = cleanEmail;
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone ? phone.trim() : '';
    if (role) user.role = role;
    if (tier) user.tier = tier;
    if (isVerified !== undefined) user.isVerified = Boolean(isVerified);
    if (password && password.trim()) {
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(password.trim(), salt);
    }

    await user.save();

    if (performedBy) {
      await AdminAuditLogEntity.create({
        action: 'UPDATE_USER',
        targetId: userId,
        targetModel: 'User',
        performedBy,
        details: { name: user.name, email: user.email, role: user.role, tier: user.tier },
      });
    }

    const plain = user.toObject();
    const { password: _, otp: _o, resetOtp: _r, __v: _v, ...safe } = plain;
    safe.id = safe._id.toString();
    return safe;
  }

  async suspendUser(userId, reason = '', performedBy) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const user = await UserModelEntity.findById(userId);
    if (!user) {
      return null;
    }

    user.isSuspended = true;
    user.suspensionReason = reason.trim();
    user.suspendedAt = new Date();
    user.suspendedBy = performedBy;
    await user.save();

    if (performedBy) {
      await AdminAuditLogEntity.create({
        action: 'SUSPEND_USER',
        targetId: userId,
        targetModel: 'User',
        performedBy,
        details: { reason },
      });
    }

    const plain = user.toObject();
    const { password, otp, resetOtp, __v, ...safe } = plain;
    safe.id = safe._id.toString();
    return safe;
  }

  async reactivateUser(userId, performedBy) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const updated = await UserModelEntity.findByIdAndUpdate(
      userId,
      {
        $set: {
          isSuspended: false,
          suspensionReason: '',
          suspendedAt: null,
          suspendedBy: null,
        },
      },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return null;
    }

    if (performedBy) {
      await AdminAuditLogEntity.create({
        action: 'REACTIVATE_USER',
        targetId: userId,
        targetModel: 'User',
        performedBy,
        details: {},
      });
    }

    const plain = updated.toObject();
    const { password, otp, resetOtp, __v, ...safe } = plain;
    safe.id = safe._id.toString();
    return safe;
  }

  async deleteUser(userId, performedBy = null) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return false;
    }

    const user = await UserModelEntity.findById(userId);
    if (!user) {
      return false;
    }

    const userObjId = new mongoose.Types.ObjectId(userId);

    // 1. Process connected groups: delete sole-member groups and remove from shared groups
    const connectedGroups = await GroupModelEntity.find({ members: userObjId });
    const soleGroupIds = [];

    for (const group of connectedGroups) {
      const remainingMembers = (group.members || []).filter(
        (m) => m.toString() !== userObjId.toString()
      );

      if (remainingMembers.length === 0) {
        soleGroupIds.push(group._id);
      } else {
        const updateOps = { $pull: { members: userObjId } };
        // Transfer creator ownership to the first remaining member if user created it
        if (group.createdBy && group.createdBy.toString() === userObjId.toString()) {
          updateOps.$set = { createdBy: remainingMembers[0] };
        }
        await GroupModelEntity.updateOne({ _id: group._id }, updateOps);
      }
    }

    if (soleGroupIds.length > 0) {
      await GroupModelEntity.deleteMany({ _id: { $in: soleGroupIds } });
    }

    // 2. Delete expenses belonging to sole-member groups or paid/created by the user
    const expenseDeleteCriteria = {
      $or: [
        { paidById: userObjId },
        { createdById: userObjId },
      ],
    };
    if (soleGroupIds.length > 0) {
      expenseDeleteCriteria.$or.push({ groupId: { $in: soleGroupIds } });
    }
    const expenseDeleteResult = await ExpenseModelEntity.deleteMany(expenseDeleteCriteria);

    // 3. Remove user from splits in any remaining shared group expenses
    await ExpenseModelEntity.updateMany(
      { 'splits.userId': userObjId },
      { $pull: { splits: { userId: userObjId } } }
    );

    // Purge expenses that have zero remaining split participants
    await ExpenseModelEntity.deleteMany({
      $or: [{ splits: { $size: 0 } }, { splits: { $exists: false } }],
    });

    // 4. Delete tokens, notifications, advisories, and previous user activity events
    const TokenModel = mongoose.models.Token || TokenModelEntity;
    if (TokenModel) {
      await TokenModel.deleteMany({ userId: userObjId });
    }

    const NotificationModel = mongoose.models.Notification || NotificationEntity;
    if (NotificationModel) {
      await NotificationModel.deleteMany({
        $or: [{ recipientId: userObjId }, { 'details.userId': userObjId.toString() }],
      });
    }

    const AdvisoryModel = mongoose.models.SpendingAdvisory;
    if (AdvisoryModel) {
      await AdvisoryModel.deleteMany({ userId: userObjId });
    }

    // Purge past user activity records so only one final deletion log is kept
    await ActivityModelEntity.deleteMany({
      $or: [{ performedBy: userObjId }, { targetId: userObjId.toString() }],
    });

    // 5. Delete the user document
    await UserModelEntity.findByIdAndDelete(userObjId);

    // 6. Keep exactly one log documenting the deletion
    if (performedBy) {
      await AdminAuditLogEntity.create({
        action: 'DELETE_USER',
        targetId: userObjId.toString(),
        targetModel: 'User',
        performedBy,
        details: {
          deletedEmail: user.email,
          deletedName: user.name,
          purgedGroupsCount: soleGroupIds.length,
          purgedExpensesCount: expenseDeleteResult?.deletedCount || 0,
          cascade: true,
        },
      });
    }

    await ActivityModelEntity.create({
      action: 'USER_ACCOUNT_DELETED',
      title: `User Account Deleted: ${user.name}`,
      subtitle: `Account ${user.email} and related group & expense records deleted`,
      type: 'security',
      targetId: userObjId.toString(),
      metadata: {
        deletedUserId: userObjId.toString(),
        deletedUserName: user.name,
        deletedUserEmail: user.email,
        deletedAt: new Date().toISOString(),
        purgedGroupsCount: soleGroupIds.length,
        purgedExpensesCount: expenseDeleteResult?.deletedCount || 0,
        initiatedBy: performedBy ? 'admin' : 'self',
      },
    });

    return true;
  }

  async getUserConnectedGroups(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }

    const groups = await GroupModelEntity.find({ members: userId })
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .lean();

    const groupIds = groups.map((g) => g._id);

    const userExpenses = await ExpenseModelEntity.find({
      groupId: { $in: groupIds },
      $or: [{ paidById: userId }, { 'splits.userId': userId }],
    }).lean();

    return groups.map((g) => {
      const gIdStr = g._id.toString();
      const gExpenses = userExpenses.filter((e) => e.groupId.toString() === gIdStr);
      let paidPaisa = 0;
      let owedPaisa = 0;

      gExpenses.forEach((exp) => {
        if (exp.paidById.toString() === userId.toString()) {
          paidPaisa += exp.amountPaisa || 0;
        }
        const split = (exp.splits || []).find((s) => s.userId.toString() === userId.toString());
        if (split) {
          owedPaisa += split.amountPaisa || 0;
        }
      });

      return {
        id: g._id.toString(),
        name: g.name,
        currency: g.currency || 'NPR',
        category: g.category || 'Trip',
        createdBy: g.createdBy,
        membersCount: g.members?.length || 0,
        members: g.members,
        userStats: {
          paidAmountPaisa: paidPaisa,
          owedAmountPaisa: owedPaisa,
          netBalancePaisa: paidPaisa - owedPaisa,
        },
        createdAt: g.createdAt,
      };
    });
  }

  async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const user = await UserModelEntity.findById(id);
    if (!user) {
      return null;
    }
    return this.sanitizeUser(user);
  }

  async updateProfile(id, { name, phoneNumber, bio, avatar, currencyPreference }) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (avatar !== undefined) updates.avatar = avatar.trim();
    if (currencyPreference !== undefined) {
      updates.currencyPreference = currencyPreference.trim().toUpperCase();
    }

    const updatedUser = await UserModelEntity.findByIdAndUpdate(
      id,
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedUser) {
      return null;
    }

    return this.sanitizeUser(updatedUser);
  }

  async changePassword(userId, currentPassword, newPassword) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('User not found');
    }

    const user = await UserModelEntity.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.authProvider !== 'google') {
      if (!currentPassword) {
        throw new Error('Current password is required');
      }
      const isMatch = bcrypt.compareSync(currentPassword, user.password);
      if (!isMatch) {
        throw new Error('Current password does not match');
      }
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(newPassword, salt);
    await user.save();

    return true;
  }

  async updatePreferences(userId, { currencyPreference, bio }) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const updates = {};
    if (currencyPreference !== undefined) {
      updates.currencyPreference = currencyPreference.trim().toUpperCase();
    }
    if (bio !== undefined) {
      updates.bio = bio.trim();
    }

    const updatedUser = await UserModelEntity.findByIdAndUpdate(
      userId,
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedUser) {
      return null;
    }

    return this.sanitizeUser(updatedUser);
  }

  async deleteAccount(userId) {
    return this.deleteUser(userId, null);
  }
}
