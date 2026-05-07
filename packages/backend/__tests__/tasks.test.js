const { createDatabase } = require('../src/db');
const repo = require('../src/tasksRepo');
const { validateForCreate, validateForUpdate } = require('../src/tasksValidation');

describe('tasksValidation', () => {
  describe('validateForCreate', () => {
    it('requires a non-empty title', () => {
      expect(validateForCreate({})).toEqual({ title: expect.any(String) });
      expect(validateForCreate({ title: '   ' })).toEqual({ title: expect.any(String) });
    });

    it('rejects titles longer than 200 characters', () => {
      const errors = validateForCreate({ title: 'x'.repeat(201) });
      expect(errors).toHaveProperty('title');
    });

    it('rejects descriptions longer than 1000 characters', () => {
      const errors = validateForCreate({ title: 'ok', description: 'x'.repeat(1001) });
      expect(errors).toHaveProperty('description');
    });

    it('rejects an invalid priority', () => {
      const errors = validateForCreate({ title: 'ok', priority: 'urgent' });
      expect(errors).toHaveProperty('priority');
    });

    it('rejects an invalid due date', () => {
      const errors = validateForCreate({ title: 'ok', dueDate: 'not-a-date' });
      expect(errors).toHaveProperty('dueDate');
    });

    it('returns null for valid input', () => {
      expect(
        validateForCreate({ title: 'Buy milk', priority: 'high', dueDate: '2026-06-01' }),
      ).toBeNull();
    });
  });

  describe('validateForUpdate', () => {
    it('rejects an empty title when title is provided', () => {
      expect(validateForUpdate({ title: '' })).toHaveProperty('title');
    });

    it('rejects non-boolean completed', () => {
      expect(validateForUpdate({ completed: 'yes' })).toHaveProperty('completed');
    });

    it('returns null for valid partial update', () => {
      expect(validateForUpdate({ completed: true })).toBeNull();
    });
  });
});

describe('tasksRepo', () => {
  let db;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('creates and retrieves a task', () => {
    const created = repo.create(db, { title: 'Write tests' });
    expect(created).toMatchObject({ title: 'Write tests', priority: 'medium', completed: false });
    expect(repo.get(db, created.id)).toEqual(created);
  });

  it('updates a task', () => {
    const created = repo.create(db, { title: 'Initial' });
    const updated = repo.update(db, created.id, { title: 'Renamed', completed: true });
    expect(updated.title).toBe('Renamed');
    expect(updated.completed).toBe(true);
  });

  it('returns null when updating a missing task', () => {
    expect(repo.update(db, 9999, { title: 'x' })).toBeNull();
  });

  it('removes a task', () => {
    const created = repo.create(db, { title: 'Remove me' });
    expect(repo.remove(db, created.id)).toBe(true);
    expect(repo.get(db, created.id)).toBeNull();
    expect(repo.remove(db, created.id)).toBe(false);
  });

  it('removes only completed tasks', () => {
    repo.create(db, { title: 'a' });
    const b = repo.create(db, { title: 'b' });
    repo.update(db, b.id, { completed: true });
    expect(repo.removeCompleted(db)).toBe(1);
    expect(repo.list(db)).toHaveLength(1);
  });

  describe('list filters and sort', () => {
    beforeEach(() => {
      repo.create(db, { title: 'Apple', priority: 'low', dueDate: '2026-12-01' });
      repo.create(db, { title: 'banana', priority: 'high', dueDate: '2026-01-01' });
      const c = repo.create(db, { title: 'Cherry', priority: 'medium' });
      repo.update(db, c.id, { completed: true });
    });

    it('filters by status', () => {
      expect(repo.list(db, { status: 'active' })).toHaveLength(2);
      expect(repo.list(db, { status: 'completed' })).toHaveLength(1);
    });

    it('filters by priority', () => {
      expect(repo.list(db, { priority: 'high' })).toHaveLength(1);
    });

    it('searches title case-insensitively', () => {
      expect(repo.list(db, { q: 'apple' })).toHaveLength(1);
      expect(repo.list(db, { q: 'BAN' })).toHaveLength(1);
    });

    it('sorts alphabetically by title', () => {
      const result = repo.list(db, { sort: 'title', order: 'asc' });
      expect(result.map((t) => t.title)).toEqual(['Apple', 'banana', 'Cherry']);
    });

    it('default sort puts incomplete tasks first', () => {
      const result = repo.list(db);
      expect(result[result.length - 1].completed).toBe(true);
    });
  });
});
