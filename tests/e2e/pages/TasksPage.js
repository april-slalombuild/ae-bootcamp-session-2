// @ts-check

class TasksPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Tasks', level: 1 });
    this.newTaskButton = page.getByRole('button', { name: 'New task' });
    this.searchInput = page.getByRole('searchbox', { name: 'Search tasks' });
    this.sortSelect = page.getByRole('combobox', { name: 'Sort tasks by' });
    this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
  }

  async goto() {
    await this.page.goto('/');
    await this.heading.waitFor();
  }

  async openNewTask() {
    await this.newTaskButton.click();
  }

  async setStatusFilter(label) {
    await this.page.getByRole('button', { name: label, exact: true }).click();
  }

  taskRow(title) {
    return this.page.locator('.task-item', { hasText: title });
  }

  taskCheckbox(title) {
    return this.page.getByRole('checkbox', { name: new RegExp(`"${title}"`, 'i') });
  }

  editButton(title) {
    return this.page.getByRole('button', { name: `Edit "${title}"` });
  }

  deleteButton(title) {
    return this.page.getByRole('button', { name: `Delete "${title}"` });
  }
}

class TaskFormDialog {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.dialog = page.getByRole('dialog');
    this.titleInput = this.dialog.getByLabel('Title');
    this.descriptionInput = this.dialog.getByLabel('Description');
    this.dueDateInput = this.dialog.getByLabel('Due date');
    this.priorityInput = this.dialog.getByLabel('Priority');
    this.submitAdd = this.dialog.getByRole('button', { name: 'Add task' });
    this.submitSave = this.dialog.getByRole('button', { name: 'Save changes' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
  }

  async fill({ title, description, dueDate, priority }) {
    if (title !== undefined) {
      await this.titleInput.fill(title);
    }
    if (description !== undefined) {
      await this.descriptionInput.fill(description);
    }
    if (dueDate !== undefined) {
      await this.dueDateInput.fill(dueDate);
    }
    if (priority !== undefined) {
      await this.priorityInput.selectOption(priority);
    }
  }

  async submit() {
    if (await this.submitAdd.isVisible()) {
      await this.submitAdd.click();
    } else {
      await this.submitSave.click();
    }
  }
}

class ConfirmDialog {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.dialog = page.getByRole('dialog');
    this.confirm = this.dialog.getByRole('button', { name: 'Delete', exact: true });
    this.cancel = this.dialog.getByRole('button', { name: 'Cancel' });
  }
}

module.exports = { TasksPage, TaskFormDialog, ConfirmDialog };
