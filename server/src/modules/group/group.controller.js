import { ActivityTracker } from '../activity/activity.model.js';

export class GroupController {
  constructor(groupModel, expenseModel = null, settlementEngine = null) {
    this.groupModel = groupModel;
    this.expenseModel = expenseModel;
    this.settlementEngine = settlementEngine;
    this.createGroup = this.createGroup.bind(this);
    this.getUserGroups = this.getUserGroups.bind(this);
    this.listAllGroups = this.listAllGroups.bind(this);
    this.getGroupById = this.getGroupById.bind(this);
    this.updateGroup = this.updateGroup.bind(this);
    this.deleteGroup = this.deleteGroup.bind(this);
    this.addMember = this.addMember.bind(this);
  }

  async createGroup(req, res, next) {
    try {
      const { name, description, members, imageUrl } = req.body;
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Group name is required',
        });
      }

      const group = await this.groupModel.create({
        name,
        description,
        imageUrl,
        createdBy: req.user.id,
        members: members || [],
      });

      ActivityTracker.track({
        action: 'GROUP_CREATED',
        title: 'Group created',
        subtitle: group.name,
        type: 'group',
        performedBy: req.user.id,
        performedByName: req.user.name,
        targetId: group.id,
      });

      res.status(201).json({
        success: true,
        message: 'Group created successfully',
        data: { group },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserGroups(req, res, next) {
    try {
      const groups = await this.groupModel.getUserGroups(req.user.id);
      if (!this.expenseModel || !this.settlementEngine) {
        return res.status(200).json({
          success: true,
          data: {
            groups,
            count: groups.length,
          },
        });
      }

      const userId = req.user.id.toString();
      const enrichedGroups = await Promise.all(
        groups.map(async (group) => {
          const expenses = await this.expenseModel.getByGroupId(group.id);
          let totalSpendPaisa = 0;
          for (const exp of expenses) {
            totalSpendPaisa += exp.amountPaisa;
          }

          const balances = this.settlementEngine.calculateNetBalances(expenses);
          const userBalanceItem = balances.find((b) => b.userId === userId);
          const userBalancePaisa = userBalanceItem ? userBalanceItem.netBalancePaisa : 0;

          let balanceType = 'settled';
          let balanceAmount = 'Settled up';
          if (userBalancePaisa < 0) {
            balanceType = 'owe';
            const oweAmt = Math.abs(userBalancePaisa);
            balanceAmount = `You owe Rs. ${(oweAmt / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
          } else if (userBalancePaisa > 0) {
            balanceType = 'owed';
            balanceAmount = `You're owed Rs. ${(userBalancePaisa / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
          }

          return {
            ...group,
            expensesCount: expenses.length,
            totalSpendPaisa,
            userBalancePaisa,
            balanceType,
            balanceAmount,
            membersCount: group.members?.length || group.memberIds?.length || 0,
            imageUrl:
              group.imageUrl ||
              (group.name.toLowerCase().includes('pokhara')
                ? 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300&auto=format&fit=crop&q=80'
                : group.name.toLowerCase().includes('roommate')
                  ? 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&auto=format&fit=crop&q=80'
                  : 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&auto=format&fit=crop&q=80'),
          };
        })
      );

      res.status(200).json({
        success: true,
        data: {
          groups: enrichedGroups,
          count: enrichedGroups.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getGroupById(req, res, next) {
    try {
      const group = await this.groupModel.getById(req.params.id);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      const isMember = group.memberIds && group.memberIds.includes(req.user.id.toString());
      if (!isMember && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this group',
        });
      }

      if (!this.expenseModel || !this.settlementEngine) {
        return res.status(200).json({
          success: true,
          data: { group },
        });
      }

      const expenses = await this.expenseModel.getByGroupId(group.id);
      let totalSpendPaisa = 0;
      for (const exp of expenses) {
        totalSpendPaisa += exp.amountPaisa;
      }

      const balances = this.settlementEngine.calculateNetBalances(expenses);
      const userId = req.user.id.toString();
      const userBalanceItem = balances.find((b) => b.userId === userId);
      const userBalancePaisa = userBalanceItem ? userBalanceItem.netBalancePaisa : 0;

      let balanceType = 'settled';
      let balanceAmount = 'Settled up';
      if (userBalancePaisa < 0) {
        balanceType = 'owe';
        const oweAmt = Math.abs(userBalancePaisa);
        balanceAmount = `You owe Rs. ${(oweAmt / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
      } else if (userBalancePaisa > 0) {
        balanceType = 'owed';
        balanceAmount = `You're owed Rs. ${(userBalancePaisa / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
      }

      const memberBalances = (group.members || []).map((m) => {
        const mId = (m._id || m.id || m).toString();
        const bItem = balances.find((b) => b.userId === mId);
        return {
          userId: mId,
          name: m.name || 'Member',
          email: m.email || '',
          netBalancePaisa: bItem ? bItem.netBalancePaisa : 0,
        };
      });

      const settlements = this.settlementEngine.optimizeSettlementsGreedy(balances);

      res.status(200).json({
        success: true,
        data: {
          group: {
            ...group,
            expenses,
            totalSpendPaisa,
            userBalancePaisa,
            balanceType,
            balanceAmount,
            memberBalances,
            settlements,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async addMember(req, res, next) {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
      }

      const group = await this.groupModel.getById(req.params.id);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      if (group.createdBy !== req.user.id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only the group creator or admin can add members',
        });
      }

      const updated = await this.groupModel.addMember(group.id, userId);

      ActivityTracker.track({
        action: 'MEMBER_JOINED',
        title: 'New group member',
        subtitle: `Added member to ${group.name}`,
        type: 'member',
        performedBy: req.user.id,
        performedByName: req.user.name,
        targetId: group.id,
      });

      res.status(200).json({
        success: true,
        message: 'Member added successfully',
        data: { group: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  async listAllGroups(req, res, next) {
    try {
      const { page, limit, search, userId } = req.query;
      const result = await this.groupModel.listAllGroups({ page, limit, search, userId });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateGroup(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, members, imageUrl } = req.body;

      const group = await this.groupModel.getById(id);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      const isAdmin = req.admin || ['superadmin', 'admin', 'moderator'].includes(req.user?.role);
      const isOwner = group.createdBy === req.user?.id?.toString();
      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Only group creator or admin can update group',
        });
      }

      const updated = await this.groupModel.updateGroup(id, { name, description, members, imageUrl });
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      ActivityTracker.track({
        action: 'GROUP_UPDATED',
        title: 'Group updated',
        subtitle: updated.name,
        type: 'group',
        performedBy: req.user?.id,
        performedByName: req.user?.name || 'Administrator',
        targetId: id,
      });

      res.status(200).json({
        success: true,
        message: 'Group updated successfully',
        data: { group: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteGroup(req, res, next) {
    try {
      const { id } = req.params;
      const group = await this.groupModel.getById(id);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      const isAdmin = req.admin || ['superadmin', 'admin', 'moderator'].includes(req.user?.role);
      const isOwner = group.createdBy === req.user?.id?.toString();
      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Only group creator or admin can delete group',
        });
      }

      const deleted = await this.groupModel.deleteGroup(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      ActivityTracker.track({
        action: 'GROUP_DELETED',
        title: 'Group deleted',
        subtitle: group.name,
        type: 'group',
        performedBy: req.user?.id,
        performedByName: req.user?.name || 'Administrator',
        targetId: id,
      });

      res.status(200).json({
        success: true,
        message: 'Group and associated records deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
