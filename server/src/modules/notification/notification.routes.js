import { Router } from 'express';

export class NotificationRoutes {
  constructor(notificationController, adminAuthMiddleware) {
    this.router = Router();
    this.notificationController = notificationController;
    this.adminAuthMiddleware = adminAuthMiddleware;
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.use(this.adminAuthMiddleware.authenticateAdmin);

    this.router.get('/', this.notificationController.getNotifications);
    this.router.patch('/read-all', this.notificationController.markAllNotificationsRead);
    this.router.patch('/:id/read', this.notificationController.markNotificationRead);
    this.router.delete('/clear-read', this.notificationController.clearReadNotifications);
    this.router.delete('/:id', this.notificationController.dismissNotification);
    this.router.post('/broadcast', this.notificationController.broadcastNotification);
  }

  getRouter() {
    return this.router;
  }
}
