const request = require('supertest');
const { createApp } = require('../../src/app');
const { createDatabase } = require('../../src/db');

describe('Tasks API', () => {
  let app;
  let db;

  beforeEach(() => {
    db = createDatabase(':memory:');
    ({ app } = createApp({ db }));
  });

  afterEach(() => {
    db.close();
  });

  describe('POST /api/tasks', () => {
    it('creates a task with defaults', async () => {
      const res = await request(app).post('/api/tasks').send({ title: 'Buy milk' });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: 'Buy milk',
        priority: 'medium',
        completed: false,
      });
      expect(res.body.id).toEqual(expect.any(Number));
      expect(res.body.createdAt).toEqual(expect.any(String));
    });

    it('returns 400 with field errors for invalid input', async () => {
      const res = await request(app).post('/api/tasks').send({ title: '' });
      expect(res.status).toBe(400);
      expect(res.body.error.fields).toHaveProperty('title');
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      await request(app).post('/api/tasks').send({ title: 'Active task', priority: 'high' });
      const completed = await request(app).post('/api/tasks').send({ title: 'Done task' });
      await request(app).patch(`/api/tasks/${completed.body.id}`).send({ completed: true });
    });

    it('returns all tasks by default', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('filters by status=active', async () => {
      const res = await request(app).get('/api/tasks?status=active');
      expect(res.body).toHaveLength(1);
      expect(res.body[0].completed).toBe(false);
    });

    it('searches by query string', async () => {
      const res = await request(app).get('/api/tasks?q=done');
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Done task');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('updates an existing task', async () => {
      const created = await request(app).post('/api/tasks').send({ title: 'Initial' });
      const res = await request(app)
        .patch(`/api/tasks/${created.body.id}`)
        .send({ title: 'Renamed', priority: 'high' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ title: 'Renamed', priority: 'high' });
    });

    it('returns 404 for missing task', async () => {
      const res = await request(app).patch('/api/tasks/9999').send({ title: 'x' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('deletes an existing task', async () => {
      const created = await request(app).post('/api/tasks').send({ title: 'Delete me' });
      const res = await request(app).delete(`/api/tasks/${created.body.id}`);
      expect(res.status).toBe(200);
      const after = await request(app).get(`/api/tasks/${created.body.id}`);
      expect(after.status).toBe(404);
    });

    it('returns 404 when deleting a missing task', async () => {
      const res = await request(app).delete('/api/tasks/9999');
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks?completed=true', () => {
    it('clears all completed tasks', async () => {
      const a = await request(app).post('/api/tasks').send({ title: 'a' });
      const b = await request(app).post('/api/tasks').send({ title: 'b' });
      await request(app).patch(`/api/tasks/${a.body.id}`).send({ completed: true });
      await request(app).patch(`/api/tasks/${b.body.id}`).send({ completed: true });

      const res = await request(app).delete('/api/tasks?completed=true');
      expect(res.status).toBe(200);
      expect(res.body.deleted).toBe(2);

      const list = await request(app).get('/api/tasks');
      expect(list.body).toHaveLength(0);
    });
  });

  describe('GET /healthz', () => {
    it('returns ok', async () => {
      const res = await request(app).get('/healthz');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });
});
