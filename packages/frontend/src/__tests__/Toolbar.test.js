import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toolbar from '../components/Toolbar';

const baseFilters = { status: 'all', q: '', sort: 'default', order: 'asc' };

describe('Toolbar', () => {
  it('emits a status change when a filter button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Toolbar filters={baseFilters} onChange={onChange} onClearCompleted={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Active' }));
    expect(onChange).toHaveBeenCalledWith({ ...baseFilters, status: 'active' });
  });

  it('marks the active status segment as pressed', () => {
    render(
      <Toolbar
        filters={{ ...baseFilters, status: 'completed' }}
        onChange={() => {}}
        onClearCompleted={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Completed' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Active' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('emits a search change as the user types', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Toolbar filters={baseFilters} onChange={onChange} onClearCompleted={() => {}} />);

    await user.type(screen.getByRole('searchbox', { name: /search tasks/i }), 'a');
    expect(onChange).toHaveBeenLastCalledWith({ ...baseFilters, q: 'a' });
  });

  it('toggles sort order when the order button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Toolbar filters={baseFilters} onChange={onChange} onClearCompleted={() => {}} />);

    await user.click(screen.getByRole('button', { name: /sort ascending/i }));
    expect(onChange).toHaveBeenCalledWith({ ...baseFilters, order: 'desc' });
  });

  it('changes the sort field when a new option is selected', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<Toolbar filters={baseFilters} onChange={onChange} onClearCompleted={() => {}} />);

    await user.selectOptions(screen.getByRole('combobox', { name: /sort tasks by/i }), 'priority');
    expect(onChange).toHaveBeenCalledWith({ ...baseFilters, sort: 'priority' });
  });

  it('invokes onClearCompleted when the clear button is clicked', async () => {
    const user = userEvent.setup();
    const onClear = jest.fn();
    render(<Toolbar filters={baseFilters} onChange={() => {}} onClearCompleted={onClear} />);

    await user.click(screen.getByRole('button', { name: /clear completed/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
