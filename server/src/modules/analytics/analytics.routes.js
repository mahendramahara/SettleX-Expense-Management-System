import { Router } from 'express';

export class AnalyticsRoutes {
  constructor(analyticsController, adminAuthMiddleware) {
    this.router = Router();
    this.analyticsController = analyticsController;
    this.adminAuthMiddleware = adminAuthMiddleware;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(this.adminAuthMiddleware.authenticateAdmin);

    this.router.get(
      '/',
      this.adminAuthMiddleware.requirePermission('analytics:read', 'users:read'),
      this.analyticsController.getAnalytics
    );

    this.router.get(
      '/benchmark',
      this.adminAuthMiddleware.requirePermission('analytics:read', 'users:read'),
      this.analyticsController.getAlgorithmBenchmark
    );

    this.router.get(
      '/algorithm/benchmark',
      this.adminAuthMiddleware.requirePermission('analytics:read', 'users:read'),
      this.analyticsController.getAlgorithmBenchmark
    );

    this.router.post(
      '/sandbox',
      this.adminAuthMiddleware.requirePermission('analytics:read', 'users:read'),
      this.analyticsController.runAlgorithmSandbox
    );

    this.router.post(
      '/algorithm/sandbox',
      this.adminAuthMiddleware.requirePermission('analytics:read', 'users:read'),
      this.analyticsController.runAlgorithmSandbox
    );

    this.router.get(
      '/anomalies',
      this.adminAuthMiddleware.requirePermission('analytics:read', 'users:read'),
      this.analyticsController.getAnomalies
    );

    this.router.post(
      '/anomalies/scan',
      this.adminAuthMiddleware.requirePermission('analytics:read', 'users:read'),
      this.analyticsController.runAnomalyScan
    );

    this.router.patch(
      '/anomalies/:id/status',
      this.adminAuthMiddleware.requirePermission('users:update', 'admins:manage'),
      this.analyticsController.updateAnomalyStatus
    );

    this.router.get(
      '/anomaly/detect',
      this.adminAuthMiddleware.requirePermission('analytics:read', 'users:read'),
      this.analyticsController.getAnomalies
    );

    this.router.post(
      '/advisories',
      this.adminAuthMiddleware.requirePermission('users:update', 'admins:manage'),
      this.analyticsController.dispatchAdvisory
    );

    this.router.post(
      '/anomaly/advisory',
      this.adminAuthMiddleware.requirePermission('users:update', 'admins:manage'),
      this.analyticsController.dispatchAdvisory
    );

    this.router.get(
      '/advisories',
      this.adminAuthMiddleware.requirePermission('analytics:read', 'users:read'),
      this.analyticsController.getAdvisories
    );

    this.router.get(
      '/anomaly/advisories',
      this.adminAuthMiddleware.requirePermission('analytics:read', 'users:read'),
      this.analyticsController.getAdvisories
    );
  }

  getRouter() {
    return this.router;
  }
}
