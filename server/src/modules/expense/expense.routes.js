import { Router } from 'express';

export class ExpenseRoutes {
  constructor(expenseController, authMiddleware) {
    this.router = Router();
    this.expenseController = expenseController;
    this.authMiddleware = authMiddleware;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(this.authMiddleware.authenticate);

    this.router.post(
      '/',
      this.authMiddleware.requireVerified,
      this.expenseController.createExpense
    );
    this.router.get('/', (req, res, next) => {
      if (req.query.limit || req.query.page || req.query.search || req.query.groupId || req.admin) {
        return this.expenseController.listAllExpenses(req, res, next);
      }
      return this.expenseController.getUserExpenses(req, res, next);
    });
    this.router.get('/all', this.expenseController.listAllExpenses);
    this.router.get('/group/:groupId', this.expenseController.getGroupExpenses);
    this.router.get('/:id', this.expenseController.getExpenseById);
    this.router.put('/:id', this.expenseController.updateExpense);
    this.router.delete(
      '/:id',
      this.authMiddleware.requireVerified,
      this.expenseController.deleteExpense
    );
  }

  getRouter() {
    return this.router;
  }
}
