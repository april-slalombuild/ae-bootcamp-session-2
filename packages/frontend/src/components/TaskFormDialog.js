import React, { useEffect, useRef, useState } from 'react';
import './Dialog.css';

const EMPTY = { title: '', description: '', dueDate: '', priority: 'medium' };

function toFormState(task) {
  if (!task) return EMPTY;
  return {
    title: task.title || '',
    description: task.description || '',
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    priority: task.priority || 'medium',
  };
}

export default function TaskFormDialog({ open, task, onClose, onSubmit }) {
  const [values, setValues] = useState(toFormState(task));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValues(toFormState(task));
      setErrors({});
      setTimeout(() => titleRef.current?.focus(), 0);
    }
  }, [open, task]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleChange = (key) => (e) => {
    setValues({ ...values, [key]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await onSubmit({
        title: values.title,
        description: values.description || null,
        dueDate: values.dueDate || null,
        priority: values.priority,
      });
      onClose();
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      else setErrors({ _: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const isEditing = Boolean(task?.id);

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="task-form-title">
      <div className="dialog">
        <h2 id="task-form-title" className="dialog__title">
          {isEditing ? 'Edit task' : 'Add task'}
        </h2>
        <form className="dialog__form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="task-title">Title</label>
            <input
              id="task-title"
              ref={titleRef}
              className="field__input"
              type="text"
              maxLength={200}
              value={values.title}
              onChange={handleChange('title')}
              required
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'task-title-error' : undefined}
            />
            {errors.title && (
              <div id="task-title-error" className="field__error" role="alert">
                {errors.title}
              </div>
            )}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              className="field__textarea"
              maxLength={1000}
              value={values.description}
              onChange={handleChange('description')}
            />
            {errors.description && <div className="field__error" role="alert">{errors.description}</div>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="task-due">Due date</label>
            <input
              id="task-due"
              className="field__input"
              type="date"
              value={values.dueDate}
              onChange={handleChange('dueDate')}
            />
            {errors.dueDate && <div className="field__error" role="alert">{errors.dueDate}</div>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              className="field__select"
              value={values.priority}
              onChange={handleChange('priority')}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {errors._ && <div className="field__error" role="alert">{errors._}</div>}

          <div className="dialog__actions">
            <button type="button" className="btn btn--text" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--filled" disabled={submitting}>
              {isEditing ? 'Save changes' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
