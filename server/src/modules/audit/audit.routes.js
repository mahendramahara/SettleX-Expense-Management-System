import { Router } from 'express';

export class AuditRoutes {
  constructor(auditController, adminAuthMiddleware) {
    this.router = Router();
    this.auditController = auditController;
    this.adminAuthMiddleware = adminAuthMiddleware;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(this.adminAuthMiddleware.authenticateAdmin);

    this.router.get(
      '/',
      this.adminAuthMiddleware.requirePermission('audit:read'),
      this.auditController.getAuditLogs
    );
  }

  getRouter() {
    return this.router;
  }
}
