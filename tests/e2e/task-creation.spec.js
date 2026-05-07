// @ts-check
const { test, expect } = require('@playwright/test');
const { TasksPage, TaskFormDialog } = require('./pages/TasksPage');
const { resetBackend } = require('./helpers/reset');

test.describe('Task creation', () => {
  test.beforeEach(async () => {
    await resetBackend();
  });

  test('user can create a task with just a title', async ({ page }) => {
    const tasks = new TasksPage(page);
    const form = new TaskFormDialog(page);

    await tasks.goto();
    await expect(page.getByText('No tasks yet')).toBeVisible();

    await tasks.openNewTask();
    await form.fill({ title: 'Buy groceries' });
    await form.submit();

    await expect(tasks.taskRow('Buy groceries')).toBeVisible();
  });
});
