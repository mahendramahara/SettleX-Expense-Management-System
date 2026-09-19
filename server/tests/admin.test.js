import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { App } from '../src/app.js';

describe('Dedicated Admin Model & Scoped Permissions', () => {
  let appInstance;
  let app;
  let superAdminToken;
  let moderatorToken;
  let moderatorId;
  let targetUserId;
  let targetUserEmail;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    appInstance = new App();
    await appInstance.getDatabase().connect();
    await appInstance.seedData();
    app = appInstance.getApp();

    const adminLogin = await request(app).post('/api/admin/login').send({
      email: 'suman.admin@settlex.com',
      password: 'SuperAdmin123!',
    });
    superAdminToken = adminLogin.body.data.token;

    targetUserEmail = `target.user.${Date.now()}@example.com`;
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Target App User',
      email: targetUserEmail,
      password: 'Password123!',
      role: 'user',
    });

    const verifyRes = await request(app).post('/api/auth/verify-otp').send({
      email: targetUserEmail,
      otp: regRes.body.data.otp,
    });

    targetUserId = verifyRes.body.data.user.id;

    const modEmail = `staff.mod.${Date.now()}@settlex.com`;
    const createStaffRes = await request(app)
      .post('/api/admin/staff')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        name: 'Sita Moderator',
        email: modEmail,
        password: 'StaffPassword123!',
        role: 'moderator',
        permissions: ['users:read', 'audit:read'],
      });

    moderatorId = createStaffRes.body.data.admin.id;

    const modLogin = await request(app).post('/api/admin/login').send({
      email: modEmail,
      password: 'StaffPassword123!',
    });
    moderatorToken = modLogin.body.data.token;
  });

  afterAll(async () => {
    await appInstance.getDatabase().disconnect();
  });

  it('should authenticate superadmin from dedicated admins collection', async () => {
    const res = await request(app)
      .get('/api/admin/me')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.admin.email).toBe('suman.admin@settlex.com');
    expect(res.body.data.admin.role).toBe('superadmin');
  });

  it('should reject non-admin app users from admin login', async () => {
    const res = await request(app).post('/api/admin/login').send({
      email: targetUserEmail,
      password: 'Password123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow moderator with users:read permission to view system overview', async () => {
    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${moderatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalUsers).toBeGreaterThan(0);
  });

  it('should forbid moderator from suspending user without users:suspend permission', async () => {
    const res = await request(app)
      .patch(`/api/users/${targetUserId}/suspend`)
      .set('Authorization', `Bearer ${moderatorToken}`)
      .send({ reason: 'Payment violation' });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('users:suspend');
  });

  it('should allow superadmin to update moderator permissions to include users:suspend', async () => {
    const res = await request(app)
      .patch(`/api/admin/staff/${moderatorId}/permissions`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({ permissions: ['users:read', 'users:suspend', 'audit:read'] });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.admin.permissions).toContain('users:suspend');
  });

  it('should allow moderator with users:suspend permission to suspend user', async () => {
    const res = await request(app)
      .patch(`/api/users/${targetUserId}/suspend`)
      .set('Authorization', `Bearer ${moderatorToken}`)
      .send({ reason: 'Unsettled group balances dispute' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.isSuspended).toBe(true);
  });

  it('should prevent suspended user from logging in', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: targetUserEmail,
      password: 'Password123!',
    });

    expect(res.status).toBe(403);
    expect(res.body.isSuspended).toBe(true);
  });

  it('should forbid moderator from deleting user without users:delete permission', async () => {
    const res = await request(app)
      .delete(`/api/users/${targetUserId}`)
      .set('Authorization', `Bearer ${moderatorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('users:delete');
  });

  it('should allow superadmin to reactivate and delete user', async () => {
    const reactivateRes = await request(app)
      .patch(`/api/users/${targetUserId}/reactivate`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(reactivateRes.status).toBe(200);
    expect(reactivateRes.body.data.user.isSuspended).toBe(false);

    const deleteRes = await request(app)
      .delete(`/api/users/${targetUserId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });

  it('should retrieve audit logs of all admin actions', async () => {
    const res = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.logs)).toBe(true);
    expect(res.body.data.logs.length).toBeGreaterThan(0);
  });

  afterAll(async () => {
    if (moderatorId && appInstance) {
      try {
        const { AdminModelEntity } = await import('../src/modules/admin/admin.model.js');
        await AdminModelEntity.deleteOne({ _id: moderatorId });
      } catch {
        // Ignore test cleanup errors
      }
    }
    if (appInstance) {
      await appInstance.getDatabase().disconnect();
    }
  });
});
