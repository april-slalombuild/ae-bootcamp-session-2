const request = require('supertest');
const { createApp } = require('../src/app');
const { createDatabase } = require('../src/db');

describe('app', () => {
  let app;
  let db;

  beforeEach(() => {
    db = createDatabase(':memory:');
    ({ app } = createApp({ db }));
  });

  afterEach(() => {
    db.close();
  });

  it('responds to the root health check', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });

  it('responds to /healthz', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('mounts the tasks router under /api/tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('parses JSON request bodies', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Content-Type', 'application/json')
      .send({ title: 'From JSON' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('From JSON');
  });

  it('returns JSON 404-style error for unknown task ids', async () => {
    const res = await request(app).get('/api/tasks/9999');
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty('message');
  });

  it('creates its own in-memory database when none is provided', async () => {
    const standalone = createApp();
    const res = await request(standalone.app).get('/healthz');
    expect(res.status).toBe(200);
    standalone.db.close();
  });
});
