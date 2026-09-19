import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { App } from '../src/app.js';
import { SettlementEngine } from '../src/modules/settlement/settlement.engine.js';

describe('Settlement Module & Algorithms', () => {
  let appInstance;
  let app;
  let authToken;
  let testGroupId;
  let engine;

  beforeAll(async () => {
    appInstance = new App();
    await appInstance.getDatabase().connect();
    await appInstance.seedData();
    app = appInstance.getApp();
    engine = new SettlementEngine();

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'suman.sharma@example.com',
      password: 'Password123!',
    });
    authToken = loginRes.body.data.token;

    const usersRes = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${authToken}`);
    const users = usersRes.body.data.users;
    const memberIds = users.slice(0, 3).map((u) => u.id);

    const groupRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: `Settlement Test Group ${Date.now()}`,
        description: 'Test Group for Balances',
        members: memberIds,
      });

    testGroupId = groupRes.body.data.group.id;

    await request(app).post('/api/expenses').set('Authorization', `Bearer ${authToken}`).send({
      groupId: testGroupId,
      title: 'Group Dinner at Thamel',
      amountPaisa: 600000,
      paidById: memberIds[0],
      splitType: 'EQUAL',
      participantIds: memberIds,
    });
  });

  afterAll(async () => {
    await appInstance.getDatabase().disconnect();
  });

  it('should calculate net balances correctly for group expenses', async () => {
    const res = await request(app)
      .get(`/api/settlements/group/${testGroupId}/balances`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const balances = res.body.data.balances;
    expect(Array.isArray(balances)).toBe(true);
    expect(balances.length).toBeGreaterThanOrEqual(2);

    const sum = balances.reduce((acc, b) => acc + b.netBalancePaisa, 0);
    expect(sum).toBe(0);
  });

  it('should optimize group settlements using greedy minimum cash flow', async () => {
    const res = await request(app)
      .get(`/api/settlements/group/${testGroupId}/optimize`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const transactions = res.body.data.optimizedTransactions;
    expect(Array.isArray(transactions)).toBe(true);
    for (const tx of transactions) {
      expect(tx.fromUserId).toBeDefined();
      expect(tx.toUserId).toBeDefined();
      expect(tx.amountPaisa).toBeGreaterThan(0);
    }
  });

  it('should optimize the classic multi-party debt problem accurately', () => {
    const balances = [
      { userId: '1', netBalancePaisa: 800000 },
      { userId: '2', netBalancePaisa: 300000 },
      { userId: '3', netBalancePaisa: -500000 },
      { userId: '4', netBalancePaisa: -300000 },
      { userId: '5', netBalancePaisa: -300000 },
    ];

    const result = engine.optimizeSettlementsGreedy(balances);

    expect(result.length).toBeLessThanOrEqual(4);

    const finalBalances = new Map();
    for (const b of balances) {
      finalBalances.set(b.userId, b.netBalancePaisa);
    }

    for (const tx of result) {
      finalBalances.set(tx.fromUserId, finalBalances.get(tx.fromUserId) + tx.amountPaisa);
      finalBalances.set(tx.toUserId, finalBalances.get(tx.toUserId) - tx.amountPaisa);
    }

    for (const remaining of finalBalances.values()) {
      expect(remaining).toBe(0);
    }
  });

  it('should detect and cancel circular debts in graph', () => {
    const graph = new Map();
    graph.set('userA', new Map([['userB', 150000]]));
    graph.set('userB', new Map([['userC', 100000]]));
    graph.set('userC', new Map([['userA', 100000]]));

    const simplified = engine.cancelDebtCycles(graph);

    expect(simplified.length).toBe(1);
    expect(simplified[0].from).toBe('userA');
    expect(simplified[0].to).toBe('userB');
    expect(simplified[0].amountPaisa).toBe(50000);
  });
});
