import jwt from 'jsonwebtoken';

export class AuthMiddleware {
  constructor(
    secretKey = process.env.JWT_SECRET || 'settlex_super_secure_jwt_secret_key_2026',
    authModel = null
  ) {
    this.secretKey = secretKey;
    this.authModel = authModel;
    this.authenticate = this.authenticate.bind(this);
    this.requireAdmin = this.requireAdmin.bind(this);
    this.requireSuperAdmin = this.requireSuperAdmin.bind(this);
    this.requireVerified = this.requireVerified.bind(this);
  }

  setAuthModel(authModel) {
    this.authModel = authModel;
  }

  setAdminModel(adminModel) {
    this.adminModel = adminModel;
  }

  async authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required',
      });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, this.secretKey);
      if (decoded.isSuspended) {
        return res.status(403).json({
          success: false,
          isSuspended: true,
          message: 'Account is suspended. Access denied.',
        });
      }

      if (this.authModel) {
        const liveUser = await this.authModel.findById(decoded.id);
        if (liveUser && liveUser.isSuspended) {
          return res.status(403).json({
            success: false,
            isSuspended: true,
            message: 'Account is suspended. Access denied.',
          });
        }
        if (liveUser) {
          decoded.role = liveUser.role || decoded.role;
          decoded.privileges = liveUser.privileges || decoded.privileges || [];
          decoded.isVerified = liveUser.isVerified !== undefined ? liveUser.isVerified : true;
        }
      }

      if (decoded.isAdmin || ['superadmin', 'admin', 'moderator'].includes(decoded.role)) {
        decoded.isAdmin = true;
        decoded.isVerified = true;
        if (this.adminModel) {
          const liveAdmin = await this.adminModel.findById(decoded.id);
          if (liveAdmin) {
            decoded.role = liveAdmin.role || decoded.role;
            decoded.permissions = liveAdmin.permissions || decoded.permissions || ['*'];
          }
        }
        if (!decoded.privileges || decoded.privileges.length === 0) {
          decoded.privileges = ['*'];
        }
        req.admin = decoded;
      }

      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  }

  requireVerified(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (
      req.user.role === 'superadmin' ||
      req.user.role === 'admin' ||
      req.user.role === 'moderator' ||
      req.user.isAdmin
    ) {
      return next();
    }

    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        isUnverified: true,
        message: 'Account is not verified. Please verify your email OTP to perform this action.',
      });
    }

    next();
  }

  requireAdmin(req, res, next) {
    if (!req.user || !['superadmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin authorization required',
      });
    }
    next();
  }

  requireSuperAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'SuperAdmin authorization required',
      });
    }
    next();
  }

  requireRole(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      if (req.user.role === 'superadmin' || allowedRoles.includes(req.user.role)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient role permissions',
      });
    };
  }

  requirePrivilege(privilege) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      if (req.user.role === 'superadmin') {
        return next();
      }

      const userPrivileges = req.user.privileges || [];
      if (userPrivileges.includes(privilege)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required '${privilege}' privilege`,
      });
    };
  }
}

export class AdminAuthMiddleware {
  constructor(
    secretKey = process.env.JWT_SECRET || 'settlex_super_secure_jwt_secret_key_2026',
    adminModel = null
  ) {
    this.secretKey = secretKey;
    this.adminModel = adminModel;
    this.authenticateAdmin = this.authenticateAdmin.bind(this);
    this.requireSuperAdmin = this.requireSuperAdmin.bind(this);
  }

  setAdminModel(adminModel) {
    this.adminModel = adminModel;
  }

  async authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Admin authorization token is required',
      });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, this.secretKey);
      if (!decoded.isAdmin && !['superadmin', 'admin', 'moderator'].includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Administrator credentials required',
        });
      }

      decoded.isAdmin = true;

      if (this.adminModel) {
        const liveAdmin = await this.adminModel.findById(decoded.id);
        if (!liveAdmin || !liveAdmin.isActive) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: Admin account is inactive or not found',
          });
        }
        decoded.role = liveAdmin.role || decoded.role;
        decoded.permissions = liveAdmin.permissions || decoded.permissions || ['*'];
      }

      req.admin = decoded;
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired admin token',
      });
    }
  }

  requirePermission(...permissionsToCheck) {
    return (req, res, next) => {
      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin authentication required',
        });
      }

      if (
        req.admin.role === 'superadmin' ||
        (req.admin.permissions && req.admin.permissions.includes('*'))
      ) {
        return next();
      }

      const permissions = req.admin.permissions || [];
      const hasAny = permissionsToCheck.some((p) => permissions.includes(p));
      if (hasAny) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission: ${permissionsToCheck.join(' or ')}`,
      });
    };
  }

  requireSuperAdmin(req, res, next) {
    if (!req.admin || req.admin.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Root SuperAdmin authorization required',
      });
    }
    next();
  }
}

export class ErrorMiddleware {
  static notFound(req, res) {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
    });
  }

  static handleError(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
}
