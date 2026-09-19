export class SettingsController {
  constructor(settingsModel) {
    this.settingsModel = settingsModel;
    this.getSettings = this.getSettings.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.triggerMaintenance = this.triggerMaintenance.bind(this);
  }

  async getSettings(req, res, next) {
    try {
      const settings = await this.settingsModel.getPlatformSettings();
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const adminId = req.admin?.id || req.admin?._id;
      const settings = await this.settingsModel.updatePlatformSettings(req.body, adminId);
      res.status(200).json({
        success: true,
        message: 'System settings updated successfully',
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const adminId = req.admin?.id || req.admin?._id;
      const { currentPassword, newPassword } = req.body;
      await this.settingsModel.changeAdminPassword(adminId, currentPassword, newPassword);
      res.status(200).json({
        success: true,
        message: 'Administrator password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async triggerMaintenance(req, res, next) {
    try {
      const adminId = req.admin?.id || req.admin?._id;
      const { action } = req.body;
      const result = await this.settingsModel.triggerMaintenanceAction(action, adminId);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
