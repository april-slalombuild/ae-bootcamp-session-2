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

    it('rejects a title longer than 200 characters', () => {
      expect(validateForUpdate({ title: 'x'.repeat(201) })).toHaveProperty('title');
    });

    it('rejects a non-string description', () => {
      expect(validateForUpdate({ description: 123 })).toHaveProperty('description');
    });

    it('rejects a description longer than 1000 characters', () => {
      expect(validateForUpdate({ description: 'x'.repeat(1001) })).toHaveProperty('description');
    });

    it('rejects an invalid due date string', () => {
      expect(validateForUpdate({ dueDate: 'not-a-date' })).toHaveProperty('dueDate');
    });

    it('rejects an invalid priority', () => {
      expect(validateForUpdate({ priority: 'urgent' })).toHaveProperty('priority');
    });

    it('rejects non-boolean completed', () => {
      expect(validateForUpdate({ completed: 'yes' })).toHaveProperty('completed');
    });

    it('rejects a missing body', () => {
      expect(validateForUpdate(null)).toHaveProperty('_');
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

    it('sorts by priority high → low', () => {
      const result = repo.list(db, { sort: 'priority', order: 'asc' });
      expect(result.map((t) => t.priority)).toEqual(['high', 'medium', 'low']);
    });

    it('sorts by due date ascending with nulls last', () => {
      const result = repo.list(db, { sort: 'due', order: 'asc' });
      expect(result.map((t) => t.dueDate)).toEqual([
        '2026-01-01',
        '2026-12-01',
        null,
      ]);
    });
  });

  describe('update with all field types', () => {
    it('patches description, due date, and priority independently', () => {
      const created = repo.create(db, { title: 'Initial' });
      const updated = repo.update(db, created.id, {
        description: 'Now described',
        dueDate: '2026-06-15',
        priority: 'high',
      });
      expect(updated.description).toBe('Now described');
      expect(updated.dueDate).toBe('2026-06-15');
      expect(updated.priority).toBe('high');
    });

    it('returns the existing task unchanged when patch is empty', () => {
      const created = repo.create(db, { title: 'Stable' });
      const updated = repo.update(db, created.id, {});
      expect(updated).toEqual(created);
    });
  });

  describe('due date filters', () => {
    let todayId;
    let overdueId;
    let weekId;
    let farId;

    beforeEach(() => {
      const fmt = (offset) => {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        return d.toISOString().slice(0, 10);
      };
      todayId = repo.create(db, { title: 'Today task', dueDate: fmt(0) }).id;
      overdueId = repo.create(db, { title: 'Overdue task', dueDate: fmt(-3) }).id;
      weekId = repo.create(db, { title: 'This week', dueDate: fmt(3) }).id;
      farId = repo.create(db, { title: 'Far future', dueDate: fmt(60) }).id;
    });

    it('filters due=today', () => {
      const ids = repo.list(db, { due: 'today' }).map((t) => t.id);
      expect(ids).toEqual([todayId]);
    });

    it('filters due=overdue and excludes completed', () => {
      const ids = repo.list(db, { due: 'overdue' }).map((t) => t.id);
      expect(ids).toEqual([overdueId]);

      repo.update(db, overdueId, { completed: true });
      expect(repo.list(db, { due: 'overdue' })).toHaveLength(0);
    });

    it('filters due=week to next 7 days', () => {
      const ids = repo.list(db, { due: 'week' }).map((t) => t.id).sort();
      expect(ids).toEqual([todayId, weekId].sort());
      expect(ids).not.toContain(farId);
    });
  });
});
