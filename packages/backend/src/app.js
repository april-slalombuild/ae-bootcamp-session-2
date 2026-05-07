const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createDatabase } = require('./db');
const { createTasksRouter } = require('./tasksRouter');

function createApp({ db } = {}) {
  const app = express();
  const database = db || createDatabase(':memory:');

  app.use(cors());
  app.use(express.json());
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.get('/', (_req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend server is running' });
  });

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/tasks', createTasksRouter(database));

  // Centralized error handler — boundary-level only, per coding guidelines.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: { message: 'Internal server error' } });
  });

  return { app, db: database };
}

module.exports = { createApp };
