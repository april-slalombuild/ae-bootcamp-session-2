const express = require('express');
const repo = require('./tasksRepo');
const { validateForCreate, validateForUpdate, PRIORITIES } = require('./tasksValidation');

function createTasksRouter(db) {
  const router = express.Router();

  router.get('/', (req, res, next) => {
    try {
      const filters = parseFilters(req.query);
      res.json(repo.list(db, filters));
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      if (id === null) return badRequest(res, 'Invalid id');
      const task = repo.get(db, id);
      if (!task) return notFound(res);
      res.json(task);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', (req, res, next) => {
    try {
      const errors = validateForCreate(req.body);
      if (errors) return validationError(res, errors);
      const task = repo.create(db, req.body);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id', (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      if (id === null) return badRequest(res, 'Invalid id');
      const errors = validateForUpdate(req.body);
      if (errors) return validationError(res, errors);
      const task = repo.update(db, id, req.body);
      if (!task) return notFound(res);
      res.json(task);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/', (req, res, next) => {
    try {
      if (req.query.completed === 'true') {
        const count = repo.removeCompleted(db);
        return res.json({ deleted: count });
      }
      return badRequest(res, 'Specify ?completed=true to clear completed tasks');
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', (req, res, next) => {
    try {
      const id = parseId(req.params.id);
      if (id === null) return badRequest(res, 'Invalid id');
      const removed = repo.remove(db, id);
      if (!removed) return notFound(res);
      res.json({ id });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function parseId(raw) {
  const n = Number.parseInt(raw, 10);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function parseFilters(query) {
  const filters = {};
  if (['active', 'completed', 'all'].includes(query.status)) {
    filters.status = query.status;
  }
  if (PRIORITIES.includes(query.priority)) {
    filters.priority = query.priority;
  }
  if (['today', 'week', 'overdue'].includes(query.due)) {
    filters.due = query.due;
  }
  if (typeof query.q === 'string' && query.q.trim() !== '') {
    filters.q = query.q.trim();
  }
  if (['due', 'priority', 'created', 'title', 'default'].includes(query.sort)) {
    filters.sort = query.sort;
  }
  if (['asc', 'desc'].includes(query.order)) {
    filters.order = query.order;
  }
  return filters;
}

function badRequest(res, message) {
  return res.status(400).json({ error: { message } });
}

function notFound(res) {
  return res.status(404).json({ error: { message: 'Task not found' } });
}

function validationError(res, fields) {
  return res.status(400).json({ error: { message: 'Validation failed', fields } });
}

module.exports = { createTasksRouter };
