import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ExpenseDialog } from './ExpenseDialog';
import { useCatFact } from '../../hooks/useCatFact';
import type { DialogMode } from '../../types';

vi.mock('../../hooks/useCatFact', () => ({
  useCatFact: vi.fn(),
}));

describe('ExpenseDialog component', () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCatFact).mockReturnValue({
      fact: 'Cats are cool.',
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should render nothing when isOpen is false', () => {
    const { container } = render(
      <ExpenseDialog
        isOpen={false}
        mode={{ type: 'add' }}
        onClose={() => { }}
        onSubmit={() => { }}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render add mode elements and empty fields', () => {
    render(
      <ExpenseDialog
        isOpen={true}
        mode={{ type: 'add' }}
        onClose={() => { }}
        onSubmit={() => { }}
      />
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Add Expense' })).toBeDefined();
    expect((screen.getByLabelText('Item Name') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Category') as HTMLSelectElement).value).toBe('');
    expect((screen.getByLabelText('Amount ($)') as HTMLInputElement).value).toBe('');
    expect(screen.getByText('Cats are cool.')).toBeDefined();
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it('should render edit mode elements and prefilled fields', () => {
    const editMode: DialogMode = {
      type: 'edit',
      expense: { id: '1', name: 'Premium Fish', category: 'Food', amount: 25.5, createdAt: '' },
    };

    render(
      <ExpenseDialog
        isOpen={true}
        mode={editMode}
        onClose={() => { }}
        onSubmit={() => { }}
      />
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Edit Expense' })).toBeDefined();
    expect((screen.getByLabelText('Item Name') as HTMLInputElement).value).toBe('Premium Fish');
    expect((screen.getByLabelText('Category') as HTMLSelectElement).value).toBe('Food');
    expect((screen.getByLabelText('Amount ($)') as HTMLInputElement).value).toBe('25.5');
  });

  it('should trigger onSubmit with form values when submit is clicked with valid inputs', () => {
    const onSubmit = vi.fn();
    render(
      <ExpenseDialog
        isOpen={true}
        mode={{ type: 'add' }}
        onClose={() => { }}
        onSubmit={onSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText('Item Name'), { target: { value: 'Cat Toy' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Accessory' } });
    fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '8.99' } });

    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Cat Toy',
      category: 'Accessory',
      amount: 8.99,
    });
  });

  it('should render validation errors when submitting invalid fields', () => {
    render(
      <ExpenseDialog
        isOpen={true}
        mode={{ type: 'add' }}
        onClose={() => { }}
        onSubmit={() => { }}
      />
    );

    // Click submit empty
    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.getByText('Item name is required.')).toBeDefined();
    expect(screen.getByText('Please select a category.')).toBeDefined();
    expect(screen.getByText('Amount is required.')).toBeDefined();
  });

  it('should call onClose when clicking close button', () => {
    const onClose = vi.fn();
    render(
      <ExpenseDialog
        isOpen={true}
        mode={{ type: 'add' }}
        onClose={onClose}
        onSubmit={() => { }}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
