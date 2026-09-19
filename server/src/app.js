import express from 'express';
import cors from 'cors';
import { AuthMiddleware, AdminAuthMiddleware, ErrorMiddleware } from './common/middleware.js';
import { DatabaseConnection } from './common/database.js';
import { MailService } from './common/mail.service.js';

import { TokenModel } from './modules/auth/token.model.js';
import { AuthModel } from './modules/auth/auth.model.js';
import { AuthController } from './modules/auth/auth.controller.js';
import { GoogleAuthController } from './modules/auth/google-auth.controller.js';
import { AuthRoutes } from './modules/auth/auth.routes.js';

import { UserModel } from './modules/user/user.model.js';
import { UserController } from './modules/user/user.controller.js';
import { UserRoutes } from './modules/user/user.routes.js';

import { GroupModel } from './modules/group/group.model.js';
import { GroupController } from './modules/group/group.controller.js';
import { GroupRoutes } from './modules/group/group.routes.js';

import { ExpenseModel } from './modules/expense/expense.model.js';
import { ExpenseController } from './modules/expense/expense.controller.js';
import { ExpenseRoutes } from './modules/expense/expense.routes.js';

import { SettlementEngine } from './modules/settlement/settlement.engine.js';
import { SettlementController } from './modules/settlement/settlement.controller.js';
import { SettlementRoutes } from './modules/settlement/settlement.routes.js';

import { NotificationModel } from './modules/notification/notification.model.js';
import { NotificationController } from './modules/notification/notification.controller.js';
import { NotificationRoutes } from './modules/notification/notification.routes.js';

import { AuditLogModel } from './modules/audit/audit.model.js';
import { AuditController } from './modules/audit/audit.controller.js';
import { AuditRoutes } from './modules/audit/audit.routes.js';

import { SettingsModel } from './modules/settings/settings.model.js';
import { SettingsController } from './modules/settings/settings.controller.js';
import { SettingsRoutes } from './modules/settings/settings.routes.js';

import { AnalyticsModel } from './modules/analytics/analytics.model.js';
import { AnalyticsController } from './modules/analytics/analytics.controller.js';
import { AnalyticsRoutes } from './modules/analytics/analytics.routes.js';

import { AdminModel } from './modules/admin/admin.model.js';
import { AdminController } from './modules/admin/admin.controller.js';
import { AdminRoutes } from './modules/admin/admin.routes.js';

import { cloudinaryService } from './common/cloudinary.service.js';
import { UploadController } from './modules/upload/upload.controller.js';
import { createUploadRoutes } from './modules/upload/upload.routes.js';

import { SeedService, SeedController, SeedRoutes } from './modules/seed/index.js';

export class App {
  constructor() {
    this.app = express();
    this.db = new DatabaseConnection();
    this.mailService = new MailService();
    this.initializeModels();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeModels() {
    this.tokenModel = new TokenModel();
    this.authModel = new AuthModel(this.tokenModel);
    this.userModel = new UserModel();
    this.groupModel = new GroupModel();
    this.expenseModel = new ExpenseModel();
    this.settlementEngine = new SettlementEngine();

    this.notificationModel = new NotificationModel();
    this.auditLogModel = new AuditLogModel();
    this.settingsModel = new SettingsModel();
    this.analyticsModel = new AnalyticsModel();

    this.adminModel = new AdminModel(
      this.userModel,
      this.notificationModel,
      this.auditLogModel,
      this.settingsModel,
      this.analyticsModel
    );

    this.authMiddleware = new AuthMiddleware();
    this.authMiddleware.setAuthModel(this.authModel);
    this.authMiddleware.setAdminModel(this.adminModel);
    this.adminAuthMiddleware = new AdminAuthMiddleware();
    this.adminAuthMiddleware.setAdminModel(this.adminModel);

    this.seedService = new SeedService();
  }

  initializeMiddlewares() {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'https://sattlex.miro.com.np',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
    ].filter(Boolean);

    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          return callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
        maxAge: 86400,
      })
    );
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  initializeRoutes() {
    const authController = new AuthController(this.authModel, this.mailService);
    const googleAuthController = new GoogleAuthController(this.authModel);
    const authRoutes = new AuthRoutes(authController, this.authMiddleware, googleAuthController);

    const userController = new UserController(
      this.userModel,
      this.groupModel,
      this.expenseModel,
      this.settlementEngine
    );
    const userRoutes = new UserRoutes(userController, this.authMiddleware, this.adminAuthMiddleware);

    const groupController = new GroupController(
      this.groupModel,
      this.expenseModel,
      this.settlementEngine
    );
    const groupRoutes = new GroupRoutes(groupController, this.authMiddleware);

    const expenseController = new ExpenseController(this.expenseModel, this.groupModel);
    const expenseRoutes = new ExpenseRoutes(expenseController, this.authMiddleware);

    const settlementController = new SettlementController(
      this.settlementEngine,
      this.expenseModel,
      this.groupModel,
      this.adminModel
    );
    const settlementRoutes = new SettlementRoutes(settlementController, this.authMiddleware);

    const notificationController = new NotificationController(this.notificationModel);
    const notificationRoutes = new NotificationRoutes(
      notificationController,
      this.adminAuthMiddleware
    );

    const auditController = new AuditController(this.auditLogModel);
    const auditRoutes = new AuditRoutes(auditController, this.adminAuthMiddleware);

    const settingsController = new SettingsController(this.settingsModel);
    const settingsRoutes = new SettingsRoutes(settingsController, this.adminAuthMiddleware);

    const analyticsController = new AnalyticsController(this.analyticsModel);
    const analyticsRoutes = new AnalyticsRoutes(analyticsController, this.adminAuthMiddleware);

    const adminController = new AdminController(
      this.adminModel,
      userController,
      notificationController,
      auditController,
      settingsController,
      analyticsController
    );
    const adminRoutes = new AdminRoutes(adminController, this.adminAuthMiddleware);

    const uploadController = new UploadController(cloudinaryService);
    const uploadRoutes = createUploadRoutes(uploadController, this.authMiddleware.authenticate);

    this.app.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'SettleX Expense Management API is live',
        healthCheck: '/api/health',
        timestamp: new Date().toISOString(),
      });
    });

    this.app.get('/api/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'SettleX API operational',
        databaseConnected: this.db.getConnectionState() === 1,
        timestamp: new Date().toISOString(),
      });
    });

    this.app.use('/api/auth', authRoutes.getRouter());
    this.app.use('/api/users', userRoutes.getRouter());
    this.app.use('/api/groups', groupRoutes.getRouter());
    this.app.use('/api/expenses', expenseRoutes.getRouter());
    this.app.use('/api/settlements', settlementRoutes.getRouter());
    this.app.use('/api/notifications', notificationRoutes.getRouter());
    this.app.use('/api/audit-logs', auditRoutes.getRouter());
    this.app.use('/api/settings', settingsRoutes.getRouter());
    this.app.use('/api/analytics', analyticsRoutes.getRouter());
    this.app.use('/api/admin', adminRoutes.getRouter());
    this.app.use('/api/upload', uploadRoutes);

    const seedController = new SeedController(this.seedService);
    const seedRoutes = new SeedRoutes(seedController);
    this.app.use('/api/seed', seedRoutes.getRouter());
  }

  initializeErrorHandling() {
    this.app.use(ErrorMiddleware.notFound);
    this.app.use(ErrorMiddleware.handleError);
  }

  async seedData() {
    return await this.seedService.seedAll();
  }

  getApp() {
    return this.app;
  }

  getDatabase() {
    return this.db;
  }

  getMailService() {
    return this.mailService;
  }

  getAdminModel() {
    return this.adminModel;
  }
}

const appInstance = new App();

export { appInstance };

export default appInstance.getApp();
