/**
 * Thin wrapper around fetch for the tasks API.
 * Throws ApiError on non-2xx responses; otherwise returns parsed JSON.
 */

export class ApiError extends Error {
  constructor(message, { status, fields } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let body = null;
  if (response.status !== 204) {
    try {
      body = await response.json();
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const message = body?.error?.message || response.statusText || 'Request failed';
    throw new ApiError(message, {
      status: response.status,
      fields: body?.error?.fields,
    });
  }
  return body;
}

function buildQuery(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const tasksApi = {
  list: (filters) => request(`/api/tasks${buildQuery(filters)}`),
  create: (task) => request('/api/tasks', { method: 'POST', body: JSON.stringify(task) }),
  update: (id, patch) =>
    request(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  remove: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
  clearCompleted: () => request('/api/tasks?completed=true', { method: 'DELETE' }),
};
