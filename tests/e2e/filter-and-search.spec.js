// @ts-check
const { test, expect } = require('@playwright/test');
const { TasksPage, TaskFormDialog } = require('./pages/TasksPage');
const { resetBackend } = require('./helpers/reset');

test.describe('Filter and search', () => {
  test.beforeEach(async () => {
    await resetBackend();
  });

  test('search narrows the list and filters hide completed', async ({ page }) => {
    const tasks = new TasksPage(page);
    const form = new TaskFormDialog(page);

    await tasks.goto();
    for (const title of ['Apple pie', 'Banana split', 'Cherry cake']) {
      await tasks.openNewTask();
      await form.fill({ title });
      await form.submit();
      await expect(tasks.taskRow(title)).toBeVisible();
    }
    await tasks.taskCheckbox('Cherry cake').click();
    await expect(tasks.taskRow('Cherry cake')).toHaveClass(/task-item--completed/);

    await tasks.searchInput.fill('apple');
    await expect(tasks.taskRow('Apple pie')).toBeVisible();
    await expect(tasks.taskRow('Banana split')).toHaveCount(0);

    await tasks.searchInput.fill('');
    await tasks.setStatusFilter('Active');
    await expect(tasks.taskRow('Cherry cake')).toHaveCount(0);
    await expect(tasks.taskRow('Apple pie')).toBeVisible();
    await expect(tasks.taskRow('Banana split')).toBeVisible();
  });
});
