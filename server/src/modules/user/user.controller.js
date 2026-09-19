export class UserController {
  constructor(userModel, groupModel = null, expenseModel = null, settlementEngine = null) {
    this.userModel = userModel;
    this.groupModel = groupModel;
    this.expenseModel = expenseModel;
    this.settlementEngine = settlementEngine;
    this.getUsers = this.getUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.updatePreferences = this.updatePreferences.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);
    this.getDashboard = this.getDashboard.bind(this);
    this.searchUsers = this.searchUsers.bind(this);

    this.listUsers = this.listUsers.bind(this);
    this.createUser = this.createUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.suspendUser = this.suspendUser.bind(this);
    this.reactivateUser = this.reactivateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.getUserConnectedGroups = this.getUserConnectedGroups.bind(this);
  }

  async getUsers(req, res, next) {
    try {
      const { search, role, page, limit, status } = req.query;
      if (status !== undefined || req.admin) {
        const result = await this.userModel.listUsers({ page, limit, search, status });
        return res.status(200).json({
          success: true,
          data: result,
        });
      }

      const result = await this.userModel.getAll({ search, role, page, limit });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req, res, next) {
    try {
      const { page, limit, search, status } = req.query;
      const result = await this.userModel.listUsers({ page, limit, search, status });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const { name, email, password, phone, role, tier, isVerified } = req.body;
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'User name and email are required',
        });
      }

      const performedBy = req.admin?.id || req.user?.id;
      const user = await this.userModel.createUser(
        { name, email, password, phone, role, tier, isVerified },
        performedBy
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user },
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, phone, role, tier, isVerified, password } = req.body;
      const performedBy = req.admin?.id || req.user?.id;

      const updated = await this.userModel.updateUser(
        id,
        { name, email, phone, role, tier, isVerified, password },
        performedBy
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user: updated },
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async suspendUser(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const performedBy = req.admin?.id || req.user?.id;

      const suspended = await this.userModel.suspendUser(id, reason, performedBy);
      if (!suspended) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'User suspended successfully',
        data: { user: suspended },
      });
    } catch (error) {
      next(error);
    }
  }

  async reactivateUser(req, res, next) {
    try {
      const { id } = req.params;
      const performedBy = req.admin?.id || req.user?.id;

      const reactivated = await this.userModel.reactivateUser(id, performedBy);
      if (!reactivated) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'User reactivated successfully',
        data: { user: reactivated },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const performedBy = req.admin?.id || req.user?.id;

      const isDeleted = await this.userModel.deleteUser(id, performedBy);
      if (!isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully from database',
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserConnectedGroups(req, res, next) {
    try {
      const { id } = req.params;
      const groups = await this.userModel.getUserConnectedGroups(id);
      res.status(200).json({
        success: true,
        data: { groups },
      });
    } catch (error) {
      next(error);
    }
  }

  async searchUsers(req, res, next) {
    try {
      const { q = '' } = req.query;
      if (q.trim().length < 2) {
        return res.status(200).json({ success: true, data: { users: [] } });
      }

      const result = await this.userModel.getAll({ search: q.trim(), limit: 10 });
      const currentUserId = req.user?.id ? req.user.id.toString() : '';

      const users = result.users
        .filter((u) => u.id !== currentUserId && u.isVerified)
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          avatar: u.avatar || '',
        }));

      res.status(200).json({ success: true, data: { users } });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await this.userModel.getById(req.params.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, phoneNumber, bio, avatar, currencyPreference } = req.body;
      const updatedUser = await this.userModel.updateProfile(userId, {
        name,
        phoneNumber,
        bio,
        avatar,
        currencyPreference,
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'New password is required',
        });
      }

      await this.userModel.changePassword(userId, currentPassword, newPassword);
      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (
        error.message.includes('not match') ||
        error.message.includes('at least 6') ||
        error.message.includes('not found')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async updatePreferences(req, res, next) {
    try {
      const userId = req.user.id;
      const { currencyPreference, bio } = req.body;

      const updatedUser = await this.userModel.updatePreferences(userId, {
        currencyPreference,
        bio,
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const userId = req.user.id;
      const isDeleted = await this.userModel.deleteAccount(userId);

      if (!isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'Account not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const userId = req.user.id.toString();
      if (!this.groupModel || !this.expenseModel || !this.settlementEngine) {
        return res.status(200).json({
          success: true,
          data: {
            stats: {
              totalGroups: 0,
              totalExpensesPaisa: 0,
              youOwePaisa: 0,
              youAreOwedPaisa: 0,
              netBalancePaisa: 0,
            },
            groups: [],
            recentExpenses: [],
            activeSettlements: [],
          },
        });
      }

      const userGroups = await this.groupModel.getUserGroups(userId);
      let totalExpensesPaisa = 0;
      let youOwePaisa = 0;
      let youAreOwedPaisa = 0;
      const allExpenses = [];
      const enrichedGroups = [];

      for (const group of userGroups) {
        const expenses = await this.expenseModel.getByGroupId(group.id);
        allExpenses.push(...expenses.map((exp) => ({ ...exp, groupName: group.name })));

        let groupTotalSpendPaisa = 0;
        for (const exp of expenses) {
          groupTotalSpendPaisa += exp.amountPaisa;
        }
        totalExpensesPaisa += groupTotalSpendPaisa;

        const balances = this.settlementEngine.calculateNetBalances(expenses);
        const userBalanceItem = balances.find((b) => b.userId === userId);
        const userBalancePaisa = userBalanceItem ? userBalanceItem.netBalancePaisa : 0;

        let balanceType = 'settled';
        let balanceAmount = 'Settled up';
        if (userBalancePaisa < 0) {
          balanceType = 'owe';
          const oweAmt = Math.abs(userBalancePaisa);
          youOwePaisa += oweAmt;
          balanceAmount = `You owe Rs. ${(oweAmt / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
        } else if (userBalancePaisa > 0) {
          balanceType = 'owed';
          youAreOwedPaisa += userBalancePaisa;
          balanceAmount = `You're owed Rs. ${(userBalancePaisa / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
        }

        const membersCount = group.members
          ? group.members.length
          : group.memberIds
            ? group.memberIds.length
            : 0;
        enrichedGroups.push({
          id: group.id,
          title: group.name,
          description: group.description,
          membersCount,
          members: group.members || [],
          expensesCount: expenses.length,
          totalSpendPaisa: groupTotalSpendPaisa,
          userBalancePaisa,
          balanceType,
          balanceAmount,
          imageUrl:
            group.imageUrl ||
            (group.name.toLowerCase().includes('pokhara')
              ? 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300&auto=format&fit=crop&q=80'
              : group.name.toLowerCase().includes('roommate')
                ? 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&auto=format&fit=crop&q=80'),
        });
      }

      allExpenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const recentExpenses = allExpenses.slice(0, 8);

      let activeSettlements = [];
      if (userGroups.length > 0) {
        const primaryGroup = userGroups[0];
        const primaryExpenses = await this.expenseModel.getByGroupId(primaryGroup.id);
        const primaryBalances = this.settlementEngine.calculateNetBalances(primaryExpenses);
        activeSettlements = this.settlementEngine.optimizeSettlementsGreedy(primaryBalances);
      }

      res.status(200).json({
        success: true,
        data: {
          stats: {
            totalGroups: userGroups.length,
            totalExpensesPaisa,
            youOwePaisa,
            youAreOwedPaisa,
            netBalancePaisa: youAreOwedPaisa - youOwePaisa,
          },
          groups: enrichedGroups,
          recentExpenses,
          activeSettlements,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
