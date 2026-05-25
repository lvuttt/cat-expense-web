import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ExpenseTable from './ExpenseTable.svelte';
import { sampleExpense } from '$lib/test/fixtures';
import type { SortConfig } from '$lib/types/models';

const defaultSort: SortConfig = { field: 'name', direction: 'asc' };

function renderTable(
  overrides: Partial<{
    expenses: (typeof sampleExpense)[];
    sortConfig: SortConfig;
    isAllSelected: boolean;
    isSomeSelected: boolean;
  }> = {},
) {
  const onSort = vi.fn();
  const onToggleAll = vi.fn();
  const onToggleSelect = vi.fn();
  const onEdit = vi.fn();
  const onDuplicate = vi.fn();

  render(ExpenseTable, {
    props: {
      expenses: [],
      topCategories: new Set(),
      sortConfig: defaultSort,
      onSort,
      isAllSelected: false,
      isSomeSelected: false,
      onToggleAll,
      isSelected: () => false,
      onToggleSelect,
      onEdit,
      onDuplicate,
      ...overrides,
    },
  });

  return { onSort, onToggleAll, onToggleSelect, onEdit, onDuplicate };
}

describe('ExpenseTable', () => {
  it('renders empty state when there are no expenses', () => {
    renderTable();

    expect(screen.getByText('No expenses yet')).toBeTruthy();
    expect(
      screen.getByText(
        'Click "Add Expense" to start tracking your cat\'s spending!',
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole('checkbox', { name: 'Select all expenses' }),
    ).toHaveProperty('disabled', true);
  });

  it('renders expense rows when data is provided', () => {
    renderTable({ expenses: [sampleExpense] });

    expect(screen.getByText('Premium kibble')).toBeTruthy();
    expect(screen.queryByText('No expenses yet')).toBeNull();
  });

  it('calls onSort when a sortable column header is clicked', async () => {
    const { onSort } = renderTable({ expenses: [sampleExpense] });

    await fireEvent.click(screen.getByRole('columnheader', { name: /Amount/ }));

    expect(onSort).toHaveBeenCalledWith('amount');
  });

  it('calls onToggleAll when the header checkbox is changed', async () => {
    const { onToggleAll } = renderTable({ expenses: [sampleExpense] });

    await fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select all expenses' }),
    );

    expect(onToggleAll).toHaveBeenCalledOnce();
  });

  it('marks the active sort column with aria-sort', () => {
    renderTable({
      expenses: [sampleExpense],
      sortConfig: { field: 'amount', direction: 'desc' },
    });

    const amountHeader = screen.getByRole('columnheader', { name: /Amount/ });
    expect(amountHeader.getAttribute('aria-sort')).toBe('descending');
  });
});
