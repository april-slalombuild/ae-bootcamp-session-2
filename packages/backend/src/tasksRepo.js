function rowToTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    priority: row.priority,
    completed: row.completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function create(db, { title, description = null, dueDate = null, priority = 'medium' }) {
  const now = nowIso();
  const stmt = db.prepare(
    `INSERT INTO tasks (title, description, due_date, priority, completed, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, ?, ?)`,
  );
  const result = stmt.run(title.trim(), description, dueDate || null, priority, now, now);
  return get(db, result.lastInsertRowid);
}

function get(db, id) {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  return rowToTask(row);
}

function list(db, filters = {}) {
  const where = [];
  const params = {};

  if (filters.status === 'active') where.push('completed = 0');
  else if (filters.status === 'completed') where.push('completed = 1');

  if (filters.priority) {
    where.push('priority = @priority');
    params.priority = filters.priority;
  }

  if (filters.q) {
    where.push('(LOWER(title) LIKE @q OR LOWER(IFNULL(description, "")) LIKE @q)');
    params.q = `%${filters.q.toLowerCase()}%`;
  }

  if (filters.due === 'overdue') {
    where.push("due_date IS NOT NULL AND date(due_date) < date('now') AND completed = 0");
  } else if (filters.due === 'today') {
    where.push("due_date IS NOT NULL AND date(due_date) = date('now')");
  } else if (filters.due === 'week') {
    where.push("due_date IS NOT NULL AND date(due_date) BETWEEN date('now') AND date('now', '+7 days')");
  }

  const sql = `SELECT * FROM tasks ${where.length ? 'WHERE ' + where.join(' AND ') : ''}`;
  const rows = db.prepare(sql).all(params);
  const tasks = rows.map(rowToTask);
  return sortTasks(tasks, filters.sort, filters.order);
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function sortTasks(tasks, sort = 'default', order = 'asc') {
  const dir = order === 'desc' ? -1 : 1;
  const sorted = [...tasks];

  if (sort === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title) * dir);
  } else if (sort === 'priority') {
    sorted.sort((a, b) => (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]) * dir);
  } else if (sort === 'created') {
    sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt) * dir);
  } else if (sort === 'due') {
    sorted.sort((a, b) => compareDueDates(a.dueDate, b.dueDate) * dir);
  } else {
    // Default: incomplete first, then by due (asc, nulls last), priority, then created desc
    sorted.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const dueCmp = compareDueDates(a.dueDate, b.dueDate);
      if (dueCmp !== 0) return dueCmp;
      const pCmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (pCmp !== 0) return pCmp;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }
  return sorted;
}

function compareDueDates(a, b) {
  if (!a && !b) return 0;
  if (!a) return 1; // nulls last
  if (!b) return -1;
  return a.localeCompare(b);
}

function update(db, id, patch) {
  const existing = get(db, id);
  if (!existing) return null;

  const fields = [];
  const params = { id };
  if (patch.title !== undefined) {
    fields.push('title = @title');
    params.title = patch.title.trim();
  }
  if (patch.description !== undefined) {
    fields.push('description = @description');
    params.description = patch.description;
  }
  if (patch.dueDate !== undefined) {
    fields.push('due_date = @dueDate');
    params.dueDate = patch.dueDate || null;
  }
  if (patch.priority !== undefined) {
    fields.push('priority = @priority');
    params.priority = patch.priority;
  }
  if (patch.completed !== undefined) {
    fields.push('completed = @completed');
    params.completed = patch.completed ? 1 : 0;
  }

  if (fields.length === 0) return existing;

  fields.push('updated_at = @updatedAt');
  params.updatedAt = nowIso();

  db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = @id`).run(params);
  return get(db, id);
}

function remove(db, id) {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
}

function removeCompleted(db) {
  const result = db.prepare('DELETE FROM tasks WHERE completed = 1').run();
  return result.changes;
}

module.exports = { create, get, list, update, remove, removeCompleted, sortTasks };
