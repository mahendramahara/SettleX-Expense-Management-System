import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { App } from '../src/app.js';

describe('Auth Module Routes', () => {
  let appInstance;
  let app;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    appInstance = new App();
    await appInstance.getDatabase().connect();
    await appInstance.seedData();
    app = appInstance.getApp();
  });

  afterAll(async () => {
    await appInstance.getDatabase().disconnect();
  });

  it('should register a new user and return verification OTP', async () => {
    const testEmail = `manish.adhikari.${Date.now()}@example.com`;
    const res = await request(app).post('/api/auth/register').send({
      name: 'Manish Adhikari',
      email: testEmail,
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user.isVerified).toBe(false);
    expect(res.body.data.otp).toBeDefined();
  });

  it('should reject registration if email is already taken', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate User',
      email: 'suman.sharma@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject OTP verification with invalid OTP code', async () => {
    const testEmail = `kiran.kc.${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Kiran KC',
      email: testEmail,
      password: 'Password123!',
    });

    const verifyRes = await request(app).post('/api/auth/verify-otp').send({
      email: testEmail,
      otp: '999999',
    });

    expect(verifyRes.status).toBe(400);
    expect(verifyRes.body.success).toBe(false);
  });

  it('should verify OTP successfully and automatically log in with token', async () => {
    const testEmail = `anita.shrestha.${Date.now()}@example.com`;
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Anita Shrestha',
      email: testEmail,
      password: 'Password123!',
    });

    const otp = regRes.body.data.otp;

    const verifyRes = await request(app).post('/api/auth/verify-otp').send({
      email: testEmail,
      otp,
    });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.user.isVerified).toBe(true);
    expect(verifyRes.body.data.token).toBeDefined();
  });

  it('should resend verification OTP for unverified user', async () => {
    const testEmail = `dipesh.pandey.${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Dipesh Pandey',
      email: testEmail,
      password: 'Password123!',
    });

    const resendRes = await request(app).post('/api/auth/resend-otp').send({ email: testEmail });

    expect(resendRes.status).toBe(200);
    expect(resendRes.body.success).toBe(true);
    expect(resendRes.body.data.otp).toBeDefined();
  });

  it('should authenticate via Google OAuth and return token', async () => {
    const googleId = `google_oauth_${Date.now()}`;
    const testEmail = `rohan.thapa.${Date.now()}@example.com`;

    const res = await request(app).post('/api/auth/google').send({
      googleId,
      email: testEmail,
      name: 'Rohan Thapa',
      avatar: 'https://example.com/avatar.jpg',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user.isVerified).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should generate Google OAuth 2.0 consent authorization URL', async () => {
    const res = await request(app).get('/api/auth/google/url');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toContain('accounts.google.com/o/oauth2/v2/auth');
    expect(res.body.data.url).toContain('client_id=');
  });

  it('should block login if user is not verified', async () => {
    const testEmail = `unverified.${Date.now()}@example.com`;
    await request(app).post('/api/auth/register').send({
      name: 'Unverified User',
      email: testEmail,
      password: 'Password123!',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'Password123!',
    });

    expect(loginRes.status).toBe(403);
    expect(loginRes.body.isUnverified).toBe(true);
  });

  it('should login an existing verified user with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'suman.sharma@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject login with invalid password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'suman.sharma@example.com',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should handle forgot password, verify reset OTP, and reset password with auto-login', async () => {
    const testEmail = `reset.user.${Date.now()}@example.com`;
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Reset Flow User',
      email: testEmail,
      password: 'OriginalPassword123!',
    });

    await request(app).post('/api/auth/verify-otp').send({
      email: testEmail,
      otp: regRes.body.data.otp,
    });

    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testEmail });

    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.data.otp).toBeDefined();
    const resetOtp = forgotRes.body.data.otp;

    const verifyResetRes = await request(app)
      .post('/api/auth/verify-reset-otp')
      .send({ email: testEmail, otp: resetOtp });

    expect(verifyResetRes.status).toBe(200);
    expect(verifyResetRes.body.success).toBe(true);

    const resetRes = await request(app).post('/api/auth/reset-password').send({
      email: testEmail,
      otp: resetOtp,
      newPassword: 'BrandNewPassword123!',
    });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);
    expect(resetRes.body.data.token).toBeDefined();

    const newLoginRes = await request(app).post('/api/auth/login').send({
      email: testEmail,
      password: 'BrandNewPassword123!',
    });

    expect(newLoginRes.status).toBe(200);
    expect(newLoginRes.body.success).toBe(true);
  });

  it('should get authenticated profile via /api/auth/me', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'suman.sharma@example.com',
      password: 'Password123!',
    });

    const token = loginRes.body.data.token;

    const meRes = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe('suman.sharma@example.com');
  });

  it('should allow re-registering unverified user and send new OTP instead of showing email taken', async () => {
    const testEmail = `reregister.${Date.now()}@example.com`;
    const firstReg = await request(app).post('/api/auth/register').send({
      name: 'Initial Name',
      email: testEmail,
      password: 'Password123!',
    });

    expect(firstReg.status).toBe(201);
    expect(firstReg.body.success).toBe(true);

    const secondReg = await request(app).post('/api/auth/register').send({
      name: 'Updated Name',
      email: testEmail,
      password: 'NewPassword123!',
    });

    expect(secondReg.status).toBe(200);
    expect(secondReg.body.success).toBe(true);
    expect(secondReg.body.resumed).toBe(true);
    expect(secondReg.body.data.otp).toBeDefined();

    const verifyRes = await request(app).post('/api/auth/verify-otp').send({
      email: testEmail,
      otp: secondReg.body.data.otp,
    });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
  });

  it('should block unverified user from creating groups via requireVerified middleware', async () => {
    const testEmail = `unverified.group.${Date.now()}@example.com`;
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Unverified Group Creator',
      email: testEmail,
      password: 'Password123!',
    });

    const unverifiedToken = appInstance.authModel.generateToken(regRes.body.data.user);
    const groupRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${unverifiedToken}`)
      .send({
        name: 'Blocked Group',
      });

    expect(groupRes.status).toBe(403);
    expect(groupRes.body.isUnverified).toBe(true);
  });
});
