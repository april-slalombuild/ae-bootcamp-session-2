// @ts-check
/**
 * Test fixture that resets backend state before each test so specs are isolated.
 */
const { request } = require('@playwright/test');

const BACKEND_PORT = process.env.PORT || 3030;
const API_BASE = process.env.API_BASE || `http://localhost:${BACKEND_PORT}`;

async function resetBackend() {
  const ctx = await request.newContext({ baseURL: API_BASE });
  const list = await ctx.get('/api/tasks');
  if (list.ok()) {
    const tasks = await list.json();
    for (const task of tasks) {
      await ctx.delete(`/api/tasks/${task.id}`);
    }
  }
  await ctx.dispose();
}

module.exports = { resetBackend };
