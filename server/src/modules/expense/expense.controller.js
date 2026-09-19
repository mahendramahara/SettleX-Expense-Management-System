import mongoose from 'mongoose';
import { ActivityTracker } from '../activity/activity.model.js';
import { anomalyEngine } from '../analytics/anomaly.engine.js';

export class ExpenseController {
  constructor(expenseModel, groupModel) {
    this.expenseModel = expenseModel;
    this.groupModel = groupModel;
    this.createExpense = this.createExpense.bind(this);
    this.getUserExpenses = this.getUserExpenses.bind(this);
    this.listAllExpenses = this.listAllExpenses.bind(this);
    this.getGroupExpenses = this.getGroupExpenses.bind(this);
    this.getExpenseById = this.getExpenseById.bind(this);
    this.updateExpense = this.updateExpense.bind(this);
    this.deleteExpense = this.deleteExpense.bind(this);
  }

  async getUserExpenses(req, res, next) {
    try {
      const userGroups = await this.groupModel.getUserGroups(req.user.id);
      const groupIds = userGroups.map((g) => g.id);
      const expenses = await this.expenseModel.getUserExpenses(req.user.id, groupIds);

      res.status(200).json({
        success: true,
        data: {
          expenses,
          count: expenses.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createExpense(req, res, next) {
    try {
      const { groupId, title, amountPaisa, paidById, splitType, splits, participantIds } = req.body;

      if (!groupId || !title || !amountPaisa) {
        return res.status(400).json({
          success: false,
          message: 'Group ID, title, and amount in paisa are required',
        });
      }

      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Group ID format',
        });
      }

      const group = await this.groupModel.getById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      const effectivePaidById =
        paidById && mongoose.Types.ObjectId.isValid(paidById) ? paidById : req.user.id;

      const rawParticipants =
        Array.isArray(participantIds) && participantIds.length > 0
          ? participantIds
          : group.memberIds || [];

      const cleanParticipantIds = Array.from(
        new Set(rawParticipants.filter((id) => mongoose.Types.ObjectId.isValid(id)))
      );

      if (cleanParticipantIds.length === 0) {
        cleanParticipantIds.push(req.user.id);
      }

      const expense = await this.expenseModel.create({
        groupId,
        title,
        amountPaisa,
        paidById: effectivePaidById,
        splitType: splitType || 'EQUAL',
        splits,
        participantIds: cleanParticipantIds,
        createdById: req.user.id,
      });

      ActivityTracker.track({
        action: 'EXPENSE_CREATED',
        title: 'New expense added',
        subtitle: `${expense.title || title} (${group.name})`,
        type: 'expense',
        performedBy: req.user.id,
        performedByName: req.user.name,
        targetId: expense.id,
      });

      // Auto-run real-time anomaly detection heuristics in background
      anomalyEngine
        .evaluateExpenseAnomaly({
          expense,
          groupId,
          paidById: effectivePaidById,
          group,
        })
        .catch((err) => console.warn('Background anomaly evaluation warning:', err.message));

      res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        data: { expense },
      });
    } catch (error) {
      if (
        error.message.includes('Sum of exact split') ||
        error.message.includes('percentages must sum') ||
        error.message.includes('positive integer') ||
        error.message.includes('participant')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async getGroupExpenses(req, res, next) {
    try {
      const { groupId } = req.params;
      const group = await this.groupModel.getById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Group not found',
        });
      }

      const expenses = await this.expenseModel.getByGroupId(groupId);
      res.status(200).json({
        success: true,
        data: {
          expenses,
          count: expenses.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getExpenseById(req, res, next) {
    try {
      const expense = await this.expenseModel.getById(req.params.id);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found',
        });
      }

      res.status(200).json({
        success: true,
        data: { expense },
      });
    } catch (error) {
      next(error);
    }
  }

  async listAllExpenses(req, res, next) {
    try {
      const { page, limit, search, groupId, userId } = req.query;
      const result = await this.expenseModel.listAllExpenses({
        page,
        limit,
        search,
        groupId,
        userId,
      });
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateExpense(req, res, next) {
    try {
      const { id } = req.params;
      const { title, amountPaisa, paidById, splitType, splits, participantIds } = req.body;

      const existing = await this.expenseModel.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found',
        });
      }

      const updated = await this.expenseModel.update(id, {
        title,
        amountPaisa,
        paidById,
        splitType,
        splits,
        participantIds,
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found',
        });
      }

      ActivityTracker.track({
        action: 'EXPENSE_UPDATED',
        title: 'Expense updated',
        subtitle: `${updated.title} (Rs. ${(updated.amountPaisa / 100).toFixed(2)})`,
        type: 'expense',
        performedBy: req.user?.id,
        performedByName: req.user?.name || 'Administrator',
        targetId: id,
      });

      // Auto-run real-time anomaly detection heuristics in background
      anomalyEngine
        .evaluateExpenseAnomaly({
          expense: updated,
          groupId: updated.groupId,
          paidById: updated.paidById,
        })
        .catch((err) => console.warn('Background anomaly evaluation warning:', err.message));

      res.status(200).json({
        success: true,
        message: 'Expense updated successfully',
        data: { expense: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteExpense(req, res, next) {
    try {
      const expense = await this.expenseModel.getById(req.params.id);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found',
        });
      }

      await this.expenseModel.delete(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Expense deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
