// @ts-check
const { test, expect } = require('@playwright/test');
const { TasksPage, TaskFormDialog, ConfirmDialog } = require('./pages/TasksPage');
const { resetBackend } = require('./helpers/reset');

test.describe('Task deletion', () => {
  test.beforeEach(async () => {
    await resetBackend();
  });

  test('user must confirm before a task is deleted', async ({ page }) => {
    const tasks = new TasksPage(page);
    const form = new TaskFormDialog(page);
    const confirm = new ConfirmDialog(page);

    await tasks.goto();
    await tasks.openNewTask();
    await form.fill({ title: 'Delete me' });
    await form.submit();
    await expect(tasks.taskRow('Delete me')).toBeVisible();

    await tasks.deleteButton('Delete me').click();
    await expect(confirm.dialog).toBeVisible();
    await confirm.confirm.click();

    await expect(tasks.taskRow('Delete me')).toHaveCount(0);
  });

  test('clear completed removes only completed tasks', async ({ page }) => {
    const tasks = new TasksPage(page);
    const form = new TaskFormDialog(page);

    await tasks.goto();
    for (const title of ['Keep', 'Done']) {
      await tasks.openNewTask();
      await form.fill({ title });
      await form.submit();
    }
    await tasks.taskCheckbox('Done').click();
    await tasks.clearCompletedButton.click();

    await expect(tasks.taskRow('Done')).toHaveCount(0);
    await expect(tasks.taskRow('Keep')).toBeVisible();
  });
});
