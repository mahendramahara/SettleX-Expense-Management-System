import { Router } from 'express';

export class SettlementRoutes {
  constructor(settlementController, authMiddleware) {
    this.router = Router();
    this.settlementController = settlementController;
    this.authMiddleware = authMiddleware;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(this.authMiddleware.authenticate);

    this.router.get('/', this.settlementController.listSettlements);
    this.router.post('/record', this.settlementController.recordSettlement);
    this.router.post('/group/:groupId/record', this.settlementController.recordSettlement);

    this.router.get('/group/:groupId/balances', this.settlementController.getGroupBalances);
    this.router.get('/group/:groupId/optimize', this.settlementController.getGroupSettlements);
    this.router.get('/group/:groupId/graph', this.settlementController.getGroupDebtGraph);
    this.router.get(
      '/group/:groupId/simplify',
      this.authMiddleware.requireVerified,
      this.settlementController.simplifyDebtCycles
    );
    this.router.post('/group/:groupId/simulate', this.settlementController.simulateSettlement);
  }

  getRouter() {
    return this.router;
  }
}
