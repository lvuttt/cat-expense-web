import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ExpenseRow } from './ExpenseRow';
import type { Expense } from '../../types';

describe('ExpenseRow component', () => {
  afterEach(() => {
    cleanup();
  });

  const mockExpense: Expense = {
    id: 'exp-1',
    name: 'Tuna Premium',
    category: 'Food',
    amount: 14.99,
    createdAt: '2026-05-23T12:00:00Z',
  };

  it('should render expense details correctly', () => {
    render(
      <ExpenseRow
        expense={mockExpense}
        isHighlighted={false}
        isSelected={false}
        onToggleSelect={() => {}}
        onEdit={() => {}}
        onDuplicate={() => {}}
      />
    );

    expect(screen.getByText('Tuna Premium')).toBeDefined();
    expect(screen.getByText('🍕')).toBeDefined();
    expect(screen.getByText('Food')).toBeDefined();
    expect(screen.getByText('$14.99')).toBeDefined();
  });

  it('should toggle selection status when checkbox clicked', () => {
    const onToggleSelect = vi.fn();
    render(
      <ExpenseRow
        expense={mockExpense}
        isHighlighted={false}
        isSelected={false}
        onToggleSelect={onToggleSelect}
        onEdit={() => {}}
        onDuplicate={() => {}}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Select Tuna Premium' });
    expect((checkbox as HTMLInputElement).checked).toBe(false);
    checkbox.click();

    expect(onToggleSelect).toHaveBeenCalledWith('exp-1');
  });

  it('should render selected state with checked attribute and class modifier', () => {
    const { container } = render(
      <ExpenseRow
        expense={mockExpense}
        isHighlighted={false}
        isSelected={true}
        onToggleSelect={() => {}}
        onEdit={() => {}}
        onDuplicate={() => {}}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Select Tuna Premium' });
    expect((checkbox as HTMLInputElement).checked).toBe(true);

    const row = container.querySelector('.expense-row');
    expect(row?.classList.contains('expense-row--selected')).toBe(true);
  });

  it('should render highlighted class when isHighlighted is true', () => {
    const { container } = render(
      <ExpenseRow
        expense={mockExpense}
        isHighlighted={true}
        isSelected={false}
        onToggleSelect={() => {}}
        onEdit={() => {}}
        onDuplicate={() => {}}
      />
    );

    const row = container.querySelector('.expense-row');
    expect(row?.classList.contains('expense-row--highlighted')).toBe(true);
  });

  it('should trigger onEdit callback when edit button clicked', () => {
    const onEdit = vi.fn();
    render(
      <ExpenseRow
        expense={mockExpense}
        isHighlighted={false}
        isSelected={false}
        onToggleSelect={() => {}}
        onEdit={onEdit}
        onDuplicate={() => {}}
      />
    );

    const editBtn = screen.getByRole('button', { name: 'Edit Tuna Premium' });
    editBtn.click();

    expect(onEdit).toHaveBeenCalledWith(mockExpense);
  });

  it('should trigger onDuplicate callback when duplicate button clicked', () => {
    const onDuplicate = vi.fn();
    render(
      <ExpenseRow
        expense={mockExpense}
        isHighlighted={false}
        isSelected={false}
        onToggleSelect={() => {}}
        onEdit={() => {}}
        onDuplicate={onDuplicate}
      />
    );

    const duplicateBtn = screen.getByRole('button', { name: 'Duplicate Tuna Premium' });
    duplicateBtn.click();

    expect(onDuplicate).toHaveBeenCalledWith('exp-1');
  });
});
