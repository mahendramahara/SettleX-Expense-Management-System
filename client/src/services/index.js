import { httpClient } from './httpClient.js';
import { authService } from './auth.service.js';
import { userService } from './user.service.js';
import { groupService } from './group.service.js';
import { expenseService } from './expense.service.js';
import { settlementService } from './settlement.service.js';
import { adminService } from './admin.service.js';
import { notificationService } from './notification.service.js';
import { auditService, systemLogService } from './audit.service.js';
import { analyticsService } from './analytics.service.js';
import { settingsService } from './settings.service.js';
import { uploadService } from './upload.service.js';

export {
  httpClient,
  authService,
  userService,
  groupService,
  expenseService,
  settlementService,
  adminService,
  notificationService,
  auditService,
  systemLogService,
  analyticsService,
  settingsService,
  uploadService,
};

export const api = {
  getToken: () => httpClient.getToken(),
  setToken: (token) => httpClient.setToken(token),
  request: (endpoint, options) => httpClient.request(endpoint, options),

  auth: authService,
  users: userService,
  groups: groupService,
  expenses: expenseService,
  settlements: settlementService,

  admin: {
    ...adminService,

    // User operations delegated to user domain service
    getUsers: userService.getUsers,
    createUser: userService.createUser,
    updateUser: userService.updateUser,
    suspendUser: userService.suspendUser,
    reactivateUser: userService.reactivateUser,
    deleteUser: userService.deleteUser,
    getUserConnectedGroups: userService.getUserConnectedGroups,

    // Group operations delegated to group domain service
    getGroups: groupService.getAll,
    createGroup: groupService.create,
    updateGroup: groupService.update,
    deleteGroup: groupService.delete,

    // Expense operations delegated to expense domain service
    getExpenses: expenseService.getAll,
    createExpense: expenseService.create,
    updateExpense: expenseService.update,
    deleteExpense: expenseService.delete,

    // Settlement operations delegated to settlement domain service
    getSettlements: settlementService.getAll,
    recordSettlement: settlementService.recordSettlement,

    // Analytics delegated to analytics domain service
    getAnalytics: analyticsService.getAnalytics,
    getAlgorithmBenchmark: analyticsService.getAlgorithmBenchmark,
    runAlgorithmSandbox: analyticsService.runAlgorithmSandbox,
    getAnomalies: analyticsService.getAnomalies,
    dispatchAdvisory: analyticsService.dispatchAdvisory,
    getAdvisories: analyticsService.getAdvisories,

    // Audit logs delegated to audit domain service
    getAuditLogs: auditService.getAuditLogs,

    // Settings delegated to settings domain service
    getSettings: settingsService.getSettings,
    updateSettings: settingsService.updateSettings,
    changePassword: settingsService.changePassword,
    triggerMaintenance: settingsService.triggerMaintenance,

    // Notifications delegated to notification domain service
    getNotifications: notificationService.getNotifications,
    markNotificationRead: notificationService.markNotificationRead,
    markAllNotificationsRead: notificationService.markAllNotificationsRead,
    dismissNotification: notificationService.dismissNotification,
    clearReadNotifications: notificationService.clearReadNotifications,
    broadcastNotification: notificationService.broadcastNotification,
  },

  upload: uploadService,
};

export default api;
