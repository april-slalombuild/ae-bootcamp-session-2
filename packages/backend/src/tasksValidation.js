const PRIORITIES = ['low', 'medium', 'high'];
const TITLE_MAX = 200;
const DESCRIPTION_MAX = 1000;

function isIsoDate(value) {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

function validateForCreate(input) {
  const errors = {};
  const { title, description, dueDate, priority } = input || {};

  if (typeof title !== 'string' || title.trim() === '') {
    errors.title = 'Title is required';
  } else if (title.length > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MAX} characters or fewer`;
  }

  if (description != null) {
    if (typeof description !== 'string') {
      errors.description = 'Description must be a string';
    } else if (description.length > DESCRIPTION_MAX) {
      errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer`;
    }
  }

  if (dueDate != null && dueDate !== '' && !isIsoDate(dueDate)) {
    errors.dueDate = 'Due date must be a valid ISO date string';
  }

  if (priority != null && !PRIORITIES.includes(priority)) {
    errors.priority = `Priority must be one of: ${PRIORITIES.join(', ')}`;
  }

  return Object.keys(errors).length ? errors : null;
}

function validateForUpdate(input) {
  if (!input || typeof input !== 'object') {
    return { _: 'Request body is required' };
  }
  const errors = {};
  const { title, description, dueDate, priority, completed } = input;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      errors.title = 'Title is required';
    } else if (title.length > TITLE_MAX) {
      errors.title = `Title must be ${TITLE_MAX} characters or fewer`;
    }
  }
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.description = 'Description must be a string';
    } else if (description.length > DESCRIPTION_MAX) {
      errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer`;
    }
  }
  if (dueDate !== undefined && dueDate !== null && dueDate !== '' && !isIsoDate(dueDate)) {
    errors.dueDate = 'Due date must be a valid ISO date string';
  }
  if (priority !== undefined && !PRIORITIES.includes(priority)) {
    errors.priority = `Priority must be one of: ${PRIORITIES.join(', ')}`;
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    errors.completed = 'Completed must be a boolean';
  }

  return Object.keys(errors).length ? errors : null;
}

module.exports = { PRIORITIES, validateForCreate, validateForUpdate };
