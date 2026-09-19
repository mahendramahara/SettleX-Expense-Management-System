export class AdminController {
  constructor(adminModel) {
    this.adminModel = adminModel;
    this.login = this.login.bind(this);
    this.getMe = this.getMe.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.getOverview = this.getOverview.bind(this);
    this.listStaff = this.listStaff.bind(this);
    this.createStaff = this.createStaff.bind(this);
    this.updatePermissions = this.updatePermissions.bind(this);
    this.updateRole = this.updateRole.bind(this);
    this.toggleStaffStatus = this.toggleStaffStatus.bind(this);
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Admin email and password are required',
        });
      }

      const result = await this.adminModel.authenticate(email, password);
      if (!result) {
        return res.status(401).json({
          success: false,
          message: 'Invalid administrator credentials',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Admin authentication successful',
        data: {
          admin: result.admin,
          user: {
            ...result.admin,
            isAdmin: true,
          },
          token: result.token,
        },
      });
    } catch (error) {
      if (error.isDeactivated) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const admin = await this.adminModel.findById(req.admin.id);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin profile not found',
        });
      }

      res.status(200).json({
        success: true,
        data: { admin: this.adminModel.sanitizeAdmin(admin) },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const adminId = req.admin?.id || req.admin?._id;
      const updatedAdmin = await this.adminModel.updateAdminProfile(adminId, req.body);
      res.status(200).json({
        success: true,
        message: 'Administrator profile updated successfully',
        data: { admin: updatedAdmin },
      });
    } catch (error) {
      next(error);
    }
  }

  async getOverview(req, res, next) {
    try {
      const stats = await this.adminModel.getSystemOverview();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async listStaff(req, res, next) {
    try {
      const staff = await this.adminModel.listStaffAdmins();
      res.status(200).json({
        success: true,
        data: {
          staff,
          count: staff.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createStaff(req, res, next) {
    try {
      const { name, email, password, role, permissions } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required',
        });
      }

      const newStaff = await this.adminModel.createStaffAdmin({
        name,
        email,
        password,
        role: role || 'moderator',
        permissions: permissions || [],
        createdBy: req.admin.id,
      });

      res.status(201).json({
        success: true,
        message: 'Staff account created successfully',
        data: { admin: newStaff },
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async updatePermissions(req, res, next) {
    try {
      const { id } = req.params;
      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          message: 'Permissions must be an array of scoped strings',
        });
      }

      const updated = await this.adminModel.updateStaffPermissions(id, permissions, req.admin.id);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Staff account not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Permissions updated successfully',
        data: { admin: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !['superadmin', 'admin', 'moderator'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Valid role is required',
        });
      }

      const updated = await this.adminModel.updateStaffRole(id, role, req.admin.id);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Staff account not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Staff role updated successfully',
        data: { admin: updated },
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleStaffStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const updated = await this.adminModel.toggleStaffStatus(id, Boolean(isActive), req.admin.id);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Staff account not found',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Staff status updated successfully',
        data: { admin: updated },
      });
    } catch (error) {
      next(error);
    }
  }
}
