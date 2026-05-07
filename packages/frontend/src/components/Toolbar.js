import React from 'react';
import './Toolbar.css';

const STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const SORTS = [
  { value: 'default', label: 'Default' },
  { value: 'due', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'created', label: 'Created' },
  { value: 'title', label: 'Title' },
];

export default function Toolbar({ filters, onChange, onClearCompleted }) {
  const update = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="toolbar" role="toolbar" aria-label="Task filters">
      <div className="toolbar__group" role="group" aria-label="Status">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            className="toolbar__segment"
            aria-pressed={filters.status === s.value}
            onClick={() => update({ status: s.value })}
          >
            {s.label}
          </button>
        ))}
      </div>

      <input
        type="search"
        className="toolbar__search"
        placeholder="Search tasks…"
        aria-label="Search tasks"
        value={filters.q || ''}
        onChange={(e) => update({ q: e.target.value })}
      />

      <label className="toolbar__select-wrapper">
        <span className="visually-hidden">Sort</span>
        <select
          className="toolbar__select"
          aria-label="Sort tasks by"
          value={filters.sort || 'default'}
          onChange={(e) => update({ sort: e.target.value })}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>Sort: {s.label}</option>
          ))}
        </select>
      </label>

      <button
        type="button"
        className="toolbar__segment"
        aria-label={filters.order === 'desc' ? 'Sort descending (click for ascending)' : 'Sort ascending (click for descending)'}
        onClick={() => update({ order: filters.order === 'desc' ? 'asc' : 'desc' })}
      >
        {filters.order === 'desc' ? '↓' : '↑'}
      </button>

      <button type="button" className="btn btn--text" onClick={onClearCompleted}>
        Clear completed
      </button>
    </div>
  );
}
