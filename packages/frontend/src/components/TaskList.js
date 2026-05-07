import React from 'react';
import './TaskList.css';

function formatDueLabel(dueDate) {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: 'Due today', variant: 'due-today' };
  if (diffDays < 0) return { label: `Overdue (${Math.abs(diffDays)}d)`, variant: 'overdue' };
  if (diffDays === 1) return { label: 'Due tomorrow', variant: 'default' };
  if (diffDays <= 7) return { label: `In ${diffDays} days`, variant: 'default' };
  return { label: due.toLocaleDateString(), variant: 'default' };
}

function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const due = formatDueLabel(task.dueDate);
  const showOverdue = due?.variant === 'overdue' && !task.completed;
  const className = `task-item ${task.completed ? 'task-item--completed' : ''}`;

  return (
    <li className={className}>
      <input
        type="checkbox"
        className="task-item__checkbox"
        checked={task.completed}
        onChange={() => onToggle(task)}
        aria-label={task.completed ? `Mark "${task.title}" as incomplete` : `Mark "${task.title}" as complete`}
      />
      <div className="task-item__body">
        <div className="task-item__title">{task.title}</div>
        {task.description && <div className="task-item__description">{task.description}</div>}
        <div className="task-item__meta">
          {task.priority === 'high' && <span className="chip chip--priority-high">⚑ High</span>}
          {task.priority === 'medium' && <span className="chip">Medium</span>}
          {task.priority === 'low' && <span className="chip">Low</span>}
          {due && !showOverdue && due.variant === 'due-today' && (
            <span className="chip chip--due-today">⏰ {due.label}</span>
          )}
          {due && !showOverdue && due.variant === 'default' && (
            <span className="chip">📅 {due.label}</span>
          )}
          {showOverdue && <span className="chip chip--overdue">⚠ {due.label}</span>}
        </div>
      </div>
      <div className="task-item__actions">
        <button
          type="button"
          className="task-item__icon-button"
          onClick={() => onEdit(task)}
          aria-label={`Edit "${task.title}"`}
        >
          ✎
        </button>
        <button
          type="button"
          className="task-item__icon-button"
          onClick={() => onDelete(task)}
          aria-label={`Delete "${task.title}"`}
        >
          🗑
        </button>
      </div>
    </li>
  );
}

export default function TaskList({ tasks, onToggle, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="empty-state" role="status">
        <p className="empty-state__title">No tasks yet</p>
        <p>Add your first task to get started.</p>
      </div>
    );
  }

  return (
    <ul className="task-list" aria-label="Tasks">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
