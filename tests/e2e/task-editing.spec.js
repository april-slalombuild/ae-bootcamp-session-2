// @ts-check
const { test, expect } = require('@playwright/test');
const { TasksPage, TaskFormDialog } = require('./pages/TasksPage');
const { resetBackend } = require('./helpers/reset');

test.describe('Task editing', () => {
  test.beforeEach(async () => {
    await resetBackend();
  });

  test('user can edit a task title and priority', async ({ page }) => {
    const tasks = new TasksPage(page);
    const form = new TaskFormDialog(page);

    await tasks.goto();
    await tasks.openNewTask();
    await form.fill({ title: 'Original' });
    await form.submit();
    await expect(tasks.taskRow('Original')).toBeVisible();

    await tasks.editButton('Original').click();
    await form.fill({ title: 'Renamed', priority: 'high' });
    await form.submit();

    await expect(tasks.taskRow('Renamed')).toBeVisible();
    await expect(tasks.taskRow('Renamed').getByText('High')).toBeVisible();
  });
});
