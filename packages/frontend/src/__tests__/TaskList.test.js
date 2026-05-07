import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskList from '../components/TaskList';

function makeTask(overrides = {}) {
  return {
    id: 1,
    title: 'Sample task',
    description: null,
    dueDate: null,
    priority: 'medium',
    completed: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const noop = () => {};

function offsetDate(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

describe('TaskList', () => {
  it('renders the empty state when there are no tasks', () => {
    render(<TaskList tasks={[]} onToggle={noop} onEdit={noop} onDelete={noop} />);
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('marks completed tasks with the completed modifier', () => {
    render(
      <TaskList
        tasks={[makeTask({ id: 2, title: 'Done', completed: true })]}
        onToggle={noop}
        onEdit={noop}
        onDelete={noop}
      />,
    );
    expect(screen.getByText('Done').closest('.task-item')).toHaveClass('task-item--completed');
  });

  it('shows an Overdue chip for past-due incomplete tasks', () => {
    render(
      <TaskList
        tasks={[makeTask({ title: 'Late task', dueDate: offsetDate(-2) })]}
        onToggle={noop}
        onEdit={noop}
        onDelete={noop}
      />,
    );
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });

  it('does not show an Overdue chip when the task is completed', () => {
    render(
      <TaskList
        tasks={[
          makeTask({ title: 'Late but done', dueDate: offsetDate(-2), completed: true }),
        ]}
        onToggle={noop}
        onEdit={noop}
        onDelete={noop}
      />,
    );
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
  });

  it('shows a "Due today" chip when the due date is today', () => {
    render(
      <TaskList
        tasks={[makeTask({ title: 'Today', dueDate: offsetDate(0) })]}
        onToggle={noop}
        onEdit={noop}
        onDelete={noop}
      />,
    );
    expect(screen.getByText(/due today/i)).toBeInTheDocument();
  });

  it('emits the right callbacks for toggle, edit, and delete', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    const task = makeTask({ id: 7, title: 'Action target' });

    render(<TaskList tasks={[task]} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByRole('checkbox', { name: /mark "action target" as complete/i }));
    await user.click(screen.getByRole('button', { name: /edit "action target"/i }));
    await user.click(screen.getByRole('button', { name: /delete "action target"/i }));

    expect(onToggle).toHaveBeenCalledWith(task);
    expect(onEdit).toHaveBeenCalledWith(task);
    expect(onDelete).toHaveBeenCalledWith(task);
  });
});
