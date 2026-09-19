import { Router } from 'express';

export class SettingsRoutes {
  constructor(settingsController, adminAuthMiddleware) {
    this.router = Router();
    this.settingsController = settingsController;
    this.adminAuthMiddleware = adminAuthMiddleware;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(this.adminAuthMiddleware.authenticateAdmin);

    this.router.get(
      '/',
      this.adminAuthMiddleware.requirePermission('admins:manage', 'users:read'),
      this.settingsController.getSettings
    );

    this.router.put(
      '/',
      this.adminAuthMiddleware.requireSuperAdmin,
      this.settingsController.updateSettings
    );

    this.router.post(
      '/password',
      this.adminAuthMiddleware.requirePermission('admins:manage', 'users:update'),
      this.settingsController.changePassword
    );

    this.router.post(
      '/maintenance',
      this.adminAuthMiddleware.requireSuperAdmin,
      this.settingsController.triggerMaintenance
    );
  }

  getRouter() {
    return this.router;
  }
}
