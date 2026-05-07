import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

let store;

const server = setupServer(
  rest.get('/api/tasks', (_req, res, ctx) => res(ctx.status(200), ctx.json(store))),
  rest.post('/api/tasks', async (req, res, ctx) => {
    const body = await req.json();
    if (!body.title || body.title.trim() === '') {
      return res(ctx.status(400), ctx.json({ error: { message: 'Validation failed', fields: { title: 'Title is required' } } }));
    }
    const task = {
      id: store.length + 1,
      title: body.title,
      description: body.description ?? null,
      dueDate: body.dueDate ?? null,
      priority: body.priority ?? 'medium',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.push(task);
    return res(ctx.status(201), ctx.json(task));
  }),
  rest.patch('/api/tasks/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const body = await req.json();
    const task = store.find((t) => t.id === id);
    if (!task) return res(ctx.status(404), ctx.json({ error: { message: 'Not found' } }));
    Object.assign(task, body, { updatedAt: new Date().toISOString() });
    return res(ctx.status(200), ctx.json(task));
  }),
  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    const idx = store.findIndex((t) => t.id === id);
    if (idx === -1) return res(ctx.status(404), ctx.json({ error: { message: 'Not found' } }));
    store.splice(idx, 1);
    return res(ctx.status(200), ctx.json({ id }));
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  store = [
    {
      id: 1,
      title: 'Existing task',
      description: null,
      dueDate: null,
      priority: 'medium',
      completed: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
});

describe('App', () => {
  test('renders the page heading', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /tasks/i, level: 1 })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Existing task')).toBeInTheDocument());
  });

  test('shows empty state when there are no tasks', async () => {
    store = [];
    render(<App />);
    await waitFor(() => expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument());
  });

  test('creates a new task via the dialog', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getByText('Existing task')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /new task/i }));
    const titleInput = await screen.findByLabelText(/title/i);
    await user.type(titleInput, 'Buy milk');
    await user.click(screen.getByRole('button', { name: /^add task$/i }));

    await waitFor(() => expect(screen.getByText('Buy milk')).toBeInTheDocument());
  });

  test('shows validation error when title is whitespace', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getByText('Existing task')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /new task/i }));
    const titleInput = await screen.findByLabelText(/title/i);
    await user.type(titleInput, '   ');
    await user.click(screen.getByRole('button', { name: /^add task$/i }));

    await waitFor(() => expect(screen.getByText(/title is required/i)).toBeInTheDocument());
  });

  test('toggles task completion', async () => {
    const user = userEvent.setup();
    render(<App />);
    const checkbox = await screen.findByRole('checkbox', { name: /mark "existing task" as complete/i });
    await user.click(checkbox);
    await waitFor(() =>
      expect(screen.getByRole('checkbox', { name: /mark "existing task" as incomplete/i })).toBeChecked(),
    );
  });

  test('deletes a task after confirming', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getByText('Existing task')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /delete "existing task"/i }));
    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    await waitFor(() => expect(screen.queryByText('Existing task')).not.toBeInTheDocument());
  });
});
