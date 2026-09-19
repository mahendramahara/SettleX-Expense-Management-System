import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { App } from '../src/app.js';

describe('App-level Seed Route & Mock Isolation', () => {
  let appInstance;
  let app;

  beforeAll(async () => {
    appInstance = new App();
    await appInstance.getDatabase().connect();
    app = appInstance.getApp();
  });

  afterAll(async () => {
    await appInstance.getDatabase().disconnect();
  });

  it('should get seed status via GET /api/seed/status', async () => {
    const res = await request(app).get('/api/seed/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('counts');
  });

  it('should seed database on-demand via POST /api/seed from mock JSON files', async () => {
    const res = await request(app).post('/api/seed');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('users');
    expect(res.body.data).toHaveProperty('groups');
    expect(res.body.data).toHaveProperty('expenses');
  });
});
