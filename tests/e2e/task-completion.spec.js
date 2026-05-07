// @ts-check
const { test, expect } = require('@playwright/test');
const { TasksPage, TaskFormDialog } = require('./pages/TasksPage');
const { resetBackend } = require('./helpers/reset');

test.describe('Task completion', () => {
  test.beforeEach(async () => {
    await resetBackend();
  });

  test('user can toggle a task complete and back', async ({ page }) => {
    const tasks = new TasksPage(page);
    const form = new TaskFormDialog(page);

    await tasks.goto();
    await tasks.openNewTask();
    await form.fill({ title: 'Walk the dog' });
    await form.submit();

    await tasks.taskCheckbox('Walk the dog').click();
    await expect(tasks.taskRow('Walk the dog')).toHaveClass(/task-item--completed/);

    await tasks.taskCheckbox('Walk the dog').click();
    await expect(tasks.taskRow('Walk the dog')).not.toHaveClass(/task-item--completed/);
  });
});
