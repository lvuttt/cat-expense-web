import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ExpenseTable } from './ExpenseTable';
import type { Expense, SortConfig } from '../../types';

describe('ExpenseTable component', () => {
  afterEach(() => {
    cleanup();
  });

  const mockExpenses: Expense[] = [
    { id: '1', name: 'Tuna', category: 'Food', amount: 15.0, createdAt: '2026-05-23T12:00:00Z' },
    { id: '2', name: 'Scratcher', category: 'Furniture', amount: 50.0, createdAt: '2026-05-23T12:00:00Z' },
  ];

  const defaultSort: SortConfig = { field: 'name', direction: 'asc' };

  it('should render empty state when no expenses exist', () => {
    render(
      <ExpenseTable
        expenses={[]}
        topCategories={new Set()}
        sortConfig={defaultSort}
        onSort={() => {}}
        isAllSelected={false}
        isSomeSelected={false}
        onToggleAll={() => {}}
        isSelected={() => false}
        onToggleSelect={() => {}}
        onEdit={() => {}}
        onDuplicate={() => {}}
      />
    );

    expect(screen.getByText('No expenses yet')).toBeDefined();
    expect(screen.getByText(/Click "Add Expense" to start tracking/i)).toBeDefined();
  });

  it('should render rows for each expense', () => {
    render(
      <ExpenseTable
        expenses={mockExpenses}
        topCategories={new Set(['Furniture'])}
        sortConfig={defaultSort}
        onSort={() => {}}
        isAllSelected={false}
        isSomeSelected={false}
        onToggleAll={() => {}}
        isSelected={(id) => id === '1'}
        onToggleSelect={() => {}}
        onEdit={() => {}}
        onDuplicate={() => {}}
      />
    );

    expect(screen.getByText('Tuna')).toBeDefined();
    expect(screen.getByText('Scratcher')).toBeDefined();
  });

  it('should trigger onSort callback when clicking sortable header cells', () => {
    const onSort = vi.fn();
    render(
      <ExpenseTable
        expenses={mockExpenses}
        topCategories={new Set()}
        sortConfig={defaultSort}
        onSort={onSort}
        isAllSelected={false}
        isSomeSelected={false}
        onToggleAll={() => {}}
        isSelected={() => false}
        onToggleSelect={() => {}}
        onEdit={() => {}}
        onDuplicate={() => {}}
      />
    );

    const amountHeader = screen.getByText('Amount');
    fireEvent.click(amountHeader);

    expect(onSort).toHaveBeenCalledWith('amount');
  });

  it('should trigger onToggleAll when clicking the header checkbox', () => {
    const onToggleAll = vi.fn();
    render(
      <ExpenseTable
        expenses={mockExpenses}
        topCategories={new Set()}
        sortConfig={defaultSort}
        onSort={() => {}}
        isAllSelected={false}
        isSomeSelected={true}
        onToggleAll={onToggleAll}
        isSelected={() => false}
        onToggleSelect={() => {}}
        onEdit={() => {}}
        onDuplicate={() => {}}
      />
    );

    const selectAllCheckbox = screen.getByRole('checkbox', { name: 'Select all expenses' });
    fireEvent.click(selectAllCheckbox);

    expect(onToggleAll).toHaveBeenCalledTimes(1);
  });
});
