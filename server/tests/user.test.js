import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { App } from '../src/app.js';
import { GroupModelEntity } from '../src/modules/group/group.model.js';
import { ExpenseModelEntity } from '../src/modules/expense/expense.model.js';
import { ActivityModelEntity } from '../src/modules/activity/activity.model.js';

describe('User Module Routes', () => {
  let appInstance;
  let app;
  let authToken;
  let testUserId;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    appInstance = new App();
    await appInstance.getDatabase().connect();
    await appInstance.seedData();
    app = appInstance.getApp();

    const uniqueEmail = `user.test.${Date.now()}@example.com`;
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Suresh Rai',
      email: uniqueEmail,
      password: 'Password123!',
    });

    const verifyRes = await request(app).post('/api/auth/verify-otp').send({
      email: uniqueEmail,
      otp: regRes.body.data.otp,
    });

    authToken = verifyRes.body.data.token;
    testUserId = verifyRes.body.data.user.id;
  });

  afterAll(async () => {
    await appInstance.getDatabase().disconnect();
  });

  it('should fetch paginated users with query parameters', async () => {
    const res = await request(app)
      .get('/api/users?page=1&limit=5&role=user')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.users)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(5);
  });

  it('should search users by keyword query parameter', async () => {
    const res = await request(app)
      .get('/api/users?search=Suresh')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users.length).toBeGreaterThanOrEqual(1);
  });

  it('should fetch a single user by id', async () => {
    const res = await request(app)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.id).toBe(testUserId);
  });

  it('should update profile via PUT /api/users/profile', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Suresh Kumar Rai',
        phoneNumber: '+9779812345678',
        bio: 'Software engineer based in Kathmandu',
        currencyPreference: 'USD',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe('Suresh Kumar Rai');
    expect(res.body.data.user.phoneNumber).toBe('+9779812345678');
    expect(res.body.data.user.currencyPreference).toBe('USD');
  });

  it('should reject password change with incorrect current password', async () => {
    const res = await request(app)
      .patch('/api/users/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: 'WrongPassword!',
        newPassword: 'BrandNewPassword123!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should update password via PATCH /api/users/password', async () => {
    const res = await request(app)
      .patch('/api/users/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currentPassword: 'Password123!',
        newPassword: 'BrandNewPassword123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should update preferences via PATCH /api/users/preferences', async () => {
    const res = await request(app)
      .patch('/api/users/preferences')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        currencyPreference: 'NPR',
        bio: 'Updated bio preference',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.currencyPreference).toBe('NPR');
    expect(res.body.data.user.bio).toBe('Updated bio preference');
  });

  it('should delete own account, cascade delete groups and expenses, and keep one log', async () => {
    // Seed user-specific group, expense, and previous activity
    const userGroup = await GroupModelEntity.create({
      name: 'Personal Vacation Trip',
      createdBy: testUserId,
      members: [testUserId],
    });

    const userExpense = await ExpenseModelEntity.create({
      groupId: userGroup._id,
      title: 'Personal Hotel Booking',
      amountPaisa: 500000,
      paidById: testUserId,
      splitType: 'EQUAL',
      splits: [{ userId: testUserId, amountPaisa: 500000 }],
    });

    await ActivityModelEntity.create({
      action: 'EXPENSE_ADDED',
      title: 'Added Hotel Booking',
      subtitle: 'Rs. 5,000.00',
      type: 'expense',
      performedBy: testUserId,
      targetId: userExpense._id.toString(),
    });

    const deleteRes = await request(app)
      .delete('/api/users/account')
      .set('Authorization', `Bearer ${authToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const getRes = await request(app)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(getRes.status).toBe(404);

    // Verify sole-member group was cascaded
    const foundGroup = await GroupModelEntity.findById(userGroup._id);
    expect(foundGroup).toBeNull();

    // Verify user expense was cascaded
    const foundExpense = await ExpenseModelEntity.findById(userExpense._id);
    expect(foundExpense).toBeNull();

    // Verify old activities are gone and exactly one log remains for this user
    const remainingLogs = await ActivityModelEntity.find({ targetId: testUserId.toString() });
    expect(remainingLogs.length).toBe(1);
    expect(remainingLogs[0].action).toBe('USER_ACCOUNT_DELETED');
  });

  it('should fetch aggregated dashboard metrics via GET /api/users/dashboard', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'suman.sharma@example.com',
      password: 'Password123!',
    });

    const sumanToken = loginRes.body.data.token;
    const res = await request(app)
      .get('/api/users/dashboard')
      .set('Authorization', `Bearer ${sumanToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stats).toBeDefined();
    expect(res.body.data.stats.totalGroups).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.data.groups)).toBe(true);
    expect(Array.isArray(res.body.data.recentExpenses)).toBe(true);
  });

  it('should block unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
