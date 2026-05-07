# Functional Requirements

This document lists the core functional requirements for the TODO application.

## 1. Task Creation
- The user can create a new task by entering a title and submitting it.
- A task title is required and cannot be empty or whitespace-only.
- A task title must be no longer than 200 characters.
- The user can optionally add a description (up to 1,000 characters) when creating a task.
- The user can optionally set a due date when creating a task.
- The user can optionally set a priority (Low, Medium, High) when creating a task; the default is Medium.
- Each new task is assigned a unique identifier and a creation timestamp by the system.
- New tasks are created in the "incomplete" state by default.

## 2. Viewing Tasks
- The user can view a list of all their tasks on the main page.
- Each task in the list displays its title, due date (if set), priority, and completion state.
- The user can view the full details of a single task, including its description.
- When there are no tasks, the user sees an empty-state message (e.g., "No tasks yet").

## 3. Editing Tasks
- The user can edit the title, description, due date, and priority of any existing task.
- Edits are validated against the same rules as task creation (e.g., title required, length limits).
- The system records and displays a "last updated" timestamp for each edited task.

## 4. Completing Tasks
- The user can mark a task as complete.
- The user can mark a completed task as incomplete (toggle).
- Completed tasks are visually distinguished (e.g., strikethrough, dimmed) from incomplete tasks.

## 5. Deleting Tasks
- The user can delete a single task.
- The user is prompted to confirm before a task is permanently deleted.
- The user can delete all completed tasks at once via a "Clear completed" action.

## 6. Sorting
- Tasks are sorted by default in the following order:
  1. Incomplete tasks first, then completed tasks.
  2. Within each group, tasks with a due date come before tasks without a due date.
  3. Tasks with due dates are sorted by due date ascending (soonest first).
  4. Ties are broken by priority (High → Medium → Low), then by creation date (newest first).
- The user can change the sort order to: due date, priority, creation date, or alphabetical by title.
- The user can toggle ascending/descending order for the selected sort.

## 7. Filtering and Searching
- The user can filter the task list by status: All, Active (incomplete), or Completed.
- The user can filter tasks by priority.
- The user can filter tasks by due-date range (e.g., Today, This Week, Overdue).
- The user can search tasks by keywords matching the title or description (case-insensitive).

## 8. Due Dates and Overdue Behavior
- The user can add, change, or remove a due date on any task.
- Tasks whose due date is in the past and are not yet complete are visually flagged as "Overdue".
- Tasks due today are visually flagged as "Due today".

## 9. Persistence
- All tasks and their attributes are persisted by the backend so they survive page reloads and restarts.
- Changes made by the user (create, edit, complete, delete) are saved automatically.

## 10. Error Handling and Feedback
- The user receives clear feedback when an action succeeds (e.g., task created, task deleted).
- The user receives a clear, actionable error message when an action fails (e.g., network error, validation error).
- Validation errors are shown inline next to the offending field.

## 11. Accessibility and Usability
- All interactive controls are reachable and operable via keyboard.
- Form fields and buttons have descriptive, screen-reader-accessible labels.
- The UI is responsive and usable on common desktop and mobile viewport sizes.
