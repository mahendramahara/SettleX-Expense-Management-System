export class NotificationController {
  constructor(notificationModel) {
    this.notificationModel = notificationModel;
    this.getNotifications = this.getNotifications.bind(this);
    this.markNotificationRead = this.markNotificationRead.bind(this);
    this.markAllNotificationsRead = this.markAllNotificationsRead.bind(this);
    this.dismissNotification = this.dismissNotification.bind(this);
    this.clearReadNotifications = this.clearReadNotifications.bind(this);
    this.broadcastNotification = this.broadcastNotification.bind(this);
  }

  async getNotifications(req, res, next) {
    try {
      const result = await this.notificationModel.getNotifications(req.query);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async markNotificationRead(req, res, next) {
    try {
      const { id } = req.params;
      await this.notificationModel.markNotificationRead(id);
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllNotificationsRead(req, res, next) {
    try {
      const { category } = req.body;
      await this.notificationModel.markAllNotificationsRead(category);
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async dismissNotification(req, res, next) {
    try {
      const { id } = req.params;
      await this.notificationModel.dismissNotification(id);
      res.status(200).json({
        success: true,
        message: 'Notification dismissed',
      });
    } catch (error) {
      next(error);
    }
  }

  async clearReadNotifications(req, res, next) {
    try {
      await this.notificationModel.clearReadNotifications();
      res.status(200).json({
        success: true,
        message: 'Read notifications cleared',
      });
    } catch (error) {
      next(error);
    }
  }

  async broadcastNotification(req, res, next) {
    try {
      const adminId = req.admin?.id || req.admin?._id;
      const notif = await this.notificationModel.broadcastNotification(req.body, adminId);
      res.status(201).json({
        success: true,
        message: 'Administrative alert broadcast successfully',
        data: { notification: notif },
      });
    } catch (error) {
      next(error);
    }
  }
}
