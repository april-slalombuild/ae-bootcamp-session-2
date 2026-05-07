import React, { useCallback, useEffect, useState } from 'react';
import { tasksApi } from './api/tasks';
import TaskList from './components/TaskList';
import TaskFormDialog from './components/TaskFormDialog';
import ConfirmDialog from './components/ConfirmDialog';
import Toolbar from './components/Toolbar';
import './App.css';

const DEFAULT_FILTERS = { status: 'all', q: '', sort: 'default', order: 'asc' };

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const showFeedback = useCallback((message, variant = 'info') => {
    setFeedback({ message, variant });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  const refresh = useCallback(async (current) => {
    setLoading(true);
    try {
      const list = await tasksApi.list(current);
      setTasks(list);
    } catch (err) {
      showFeedback(`Failed to load tasks: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showFeedback]);

  useEffect(() => {
    refresh(filters);
  }, [filters, refresh]);

  const openAdd = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleSubmit = async (values) => {
    if (editingTask) {
      await tasksApi.update(editingTask.id, values);
      showFeedback('Task updated');
    } else {
      await tasksApi.create(values);
      showFeedback('Task added');
    }
    refresh(filters);
  };

  const handleToggle = async (task) => {
    try {
      await tasksApi.update(task.id, { completed: !task.completed });
      refresh(filters);
    } catch (err) {
      showFeedback(`Failed to update task: ${err.message}`, 'error');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await tasksApi.remove(pendingDelete.id);
      showFeedback('Task deleted');
    } catch (err) {
      showFeedback(`Failed to delete task: ${err.message}`, 'error');
    } finally {
      setPendingDelete(null);
      refresh(filters);
    }
  };

  const handleClearCompleted = async () => {
    try {
      const result = await tasksApi.clearCompleted();
      showFeedback(`${result.deleted} completed task${result.deleted === 1 ? '' : 's'} cleared`);
      refresh(filters);
    } catch (err) {
      showFeedback(`Failed to clear: ${err.message}`, 'error');
    }
  };

  return (
    <div className="app">
      <header className="app__bar">
        <h1 className="app__title">Tasks</h1>
      </header>

      <main className="app__main">
        <Toolbar
          filters={filters}
          onChange={setFilters}
          onClearCompleted={handleClearCompleted}
        />

        {loading ? (
          <p role="status">Loading tasks…</p>
        ) : (
          <TaskList
            tasks={tasks}
            onToggle={handleToggle}
            onEdit={openEdit}
            onDelete={(task) => setPendingDelete(task)}
          />
        )}
      </main>

      <button type="button" className="app__add-fab" onClick={openAdd} aria-label="New task">
        + New task
      </button>

      <TaskFormDialog
        open={formOpen}
        task={editingTask}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete task?"
        message={pendingDelete ? `"${pendingDelete.title}" will be permanently removed.` : ''}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      {feedback && (
        <div
          className={`app__feedback ${feedback.variant === 'error' ? 'app__feedback--error' : ''}`}
          role="status"
          aria-live="polite"
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
