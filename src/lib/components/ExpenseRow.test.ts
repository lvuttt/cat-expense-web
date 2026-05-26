import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import type { Expense } from '$lib/types/models';
import { sampleExpense } from '$lib/test/fixtures';
import ExpenseRow from './ExpenseRow.svelte';

const renderRow = (
  overrides: Partial<{
    expense: Expense;
    isHighlighted: boolean;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    onEdit: (expense: Expense) => void;
    onDuplicate: (id: string) => void;
  }> = {},
) => {
  const onToggleSelect = vi.fn();
  const onEdit = vi.fn();
  const onDuplicate = vi.fn();

  render(ExpenseRow, {
    props: {
      expense: sampleExpense,
      isHighlighted: false,
      isSelected: false,
      onToggleSelect,
      onEdit,
      onDuplicate,
      ...overrides,
    },
  });

  return { onToggleSelect, onEdit, onDuplicate };
};

describe('ExpenseRow', () => {
  it('renders expense name, category label, and formatted amount', () => {
    renderRow();

    expect(screen.getByText('Premium kibble')).toBeTruthy();
    expect(screen.getByText('Food')).toBeTruthy();
    expect(screen.getByText('$24.99')).toBeTruthy();
    expect(screen.getByText('🍕')).toBeTruthy();
  });

  it('applies highlighted and selected row modifiers', () => {
    const { container } = render(ExpenseRow, {
      props: {
        expense: sampleExpense,
        isHighlighted: true,
        isSelected: true,
        onToggleSelect: vi.fn(),
        onEdit: vi.fn(),
        onDuplicate: vi.fn(),
      },
    });

    const row = container.querySelector('[data-expense-id="exp-1"]');
    expect(row?.className).toContain('expense-row--highlighted');
    expect(row?.className).toContain('expense-row--selected');
    expect(row?.getAttribute('aria-selected')).toBe('true');
  });

  it('calls onToggleSelect when the checkbox is changed', async () => {
    const { onToggleSelect } = renderRow();

    await fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select Premium kibble' }),
    );

    expect(onToggleSelect).toHaveBeenCalledWith('exp-1');
  });

  it('calls onEdit when the row is clicked', async () => {
    const { onEdit } = renderRow();

    await fireEvent.click(screen.getByRole('row'));

    expect(onEdit).toHaveBeenCalledWith(sampleExpense);
  });

  it('calls onEdit when the edit button is clicked', async () => {
    const { onEdit } = renderRow();

    await fireEvent.click(
      screen.getByRole('button', { name: 'Edit Premium kibble' }),
    );

    expect(onEdit).toHaveBeenCalledWith(sampleExpense);
  });

  it('calls onDuplicate when the duplicate button is clicked', async () => {
    const { onDuplicate } = renderRow();

    await fireEvent.click(
      screen.getByRole('button', { name: 'Duplicate Premium kibble' }),
    );

    expect(onDuplicate).toHaveBeenCalledWith('exp-1');
  });
});
