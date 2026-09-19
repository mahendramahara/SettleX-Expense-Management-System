import { Router } from 'express';

export class UserRoutes {
  constructor(userController, authMiddleware, adminAuthMiddleware = null) {
    this.router = Router();
    this.userController = userController;
    this.authMiddleware = authMiddleware;
    this.adminAuthMiddleware = adminAuthMiddleware;
    this.setupRoutes();
  }

  getPermissionMiddleware(permission) {
    return (req, res, next) => {
      const admin = req.admin || req.user;
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      if (admin.role === 'superadmin' || (admin.permissions && admin.permissions.includes('*'))) {
        return next();
      }

      const permissions = admin.permissions || admin.privileges || [];
      if (permissions.includes(permission) || permissions.includes('*')) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission: ${permission}`,
      });
    };
  }

  setupRoutes() {
    this.router.use(this.authMiddleware.authenticate);

    // User Self-Service Endpoints
    this.router.get('/search', this.userController.searchUsers);
    this.router.get('/dashboard', this.userController.getDashboard);
    this.router.put('/profile', this.userController.updateProfile);
    this.router.patch('/password', this.userController.changePassword);
    this.router.patch('/preferences', this.userController.updatePreferences);
    this.router.delete('/account', this.userController.deleteAccount);

    // Administrative User Operations
    this.router.get(
      '/',
      (req, res, next) => {
        if (req.query.status !== undefined || req.admin) {
          return this.getPermissionMiddleware('users:read')(req, res, () =>
            this.userController.listUsers(req, res, next)
          );
        }
        return this.userController.getUsers(req, res, next);
      }
    );

    this.router.post(
      '/',
      this.getPermissionMiddleware('users:create'),
      this.userController.createUser
    );

    this.router.get('/:id', this.userController.getUserById);

    this.router.put(
      '/:id',
      this.getPermissionMiddleware('users:update'),
      this.userController.updateUser
    );

    this.router.patch(
      '/:id/suspend',
      this.getPermissionMiddleware('users:suspend'),
      this.userController.suspendUser
    );

    this.router.patch(
      '/:id/reactivate',
      this.getPermissionMiddleware('users:suspend'),
      this.userController.reactivateUser
    );

    this.router.delete(
      '/:id',
      this.getPermissionMiddleware('users:delete'),
      this.userController.deleteUser
    );

    this.router.get(
      '/:id/groups',
      this.getPermissionMiddleware('users:read'),
      this.userController.getUserConnectedGroups
    );
  }

  getRouter() {
    return this.router;
  }
}
