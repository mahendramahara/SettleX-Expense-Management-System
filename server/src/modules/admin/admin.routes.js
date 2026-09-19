import { Router } from 'express';

export class AdminRoutes {
  constructor(adminController, adminAuthMiddleware) {
    this.router = Router();
    this.adminController = adminController;
    this.adminAuthMiddleware = adminAuthMiddleware;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.post('/login', this.adminController.login);

    this.router.use(this.adminAuthMiddleware.authenticateAdmin);

    this.router.get('/me', this.adminController.getMe);
    this.router.put('/profile', this.adminController.updateProfile);

    this.router.get(
      '/overview',
      this.adminAuthMiddleware.requirePermission('users:read'),
      this.adminController.getOverview
    );

    this.router.get(
      '/staff',
      this.adminAuthMiddleware.requirePermission('admins:manage'),
      this.adminController.listStaff
    );

    this.router.post(
      '/staff',
      this.adminAuthMiddleware.requireSuperAdmin,
      this.adminController.createStaff
    );

    this.router.patch(
      '/staff/:id/permissions',
      this.adminAuthMiddleware.requireSuperAdmin,
      this.adminController.updatePermissions
    );

    this.router.patch(
      '/staff/:id/role',
      this.adminAuthMiddleware.requireSuperAdmin,
      this.adminController.updateRole
    );

    this.router.patch(
      '/staff/:id/status',
      this.adminAuthMiddleware.requireSuperAdmin,
      this.adminController.toggleStaffStatus
    );
  }

  getRouter() {
    return this.router;
  }
}

