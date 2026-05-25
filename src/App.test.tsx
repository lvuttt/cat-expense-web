import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import App from './App';
import { useCatFact } from './hooks/useCatFact';
import { exportExpensesToCsv } from './utils/csvUtils';

vi.mock('./hooks/useCatFact', () => ({
  useCatFact: vi.fn(),
}));

vi.mock('./utils/csvUtils', () => ({
  exportExpensesToCsv: vi.fn(),
}));

describe('App Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(useCatFact).mockReturnValue({
      fact: 'Cats have 30 teeth.',
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should render header, actions, empty table, and footer', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Cat Expense' })).toBeDefined();
    expect(screen.getByRole('button', { name: /Add Expense/i })).toBeDefined();
    expect(screen.getByText('No expenses yet')).toBeDefined();
    expect(screen.getByText(/Made with/i)).toBeDefined();
  });

  it('should open add dialog, fill form, submit, and display the new expense', async () => {
    render(<App />);

    // Check table is initially empty
    expect(screen.queryByText('Tuna Fish')).toBeNull();

    // Click "Add Expense" button
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));

    // Dialog should be open
    expect(screen.getByRole('heading', { level: 2, name: 'Add Expense' })).toBeDefined();

    // Fill the form
    fireEvent.change(screen.getByLabelText('Item Name'), { target: { value: 'Tuna Fish' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Food' } });
    fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '12.99' } });

    // Submit form
    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    // Wait for dialog to close and row to appear
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    expect(screen.getByText('Tuna Fish')).toBeDefined();
    // Amount now appears in the expense row AND the SpendingChart summary
    expect(screen.getAllByText('$12.99').length).toBeGreaterThanOrEqual(1);
  });

  it('should support selecting and deleting an expense', async () => {
    render(<App />);

    // 1. Add an expense
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    fireEvent.change(screen.getByLabelText('Item Name'), { target: { value: 'Scratching Post' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Furniture' } });
    fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '35.00' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('Scratching Post')).toBeDefined();
    });

    // Delete button should be disabled initially
    const deleteBtn = screen.getByRole('button', { name: /Delete 0 selected expenses/i });
    expect(deleteBtn.hasAttribute('disabled')).toBe(true);

    // 2. Select the expense row
    const checkbox = screen.getByRole('checkbox', { name: 'Select Scratching Post' });
    fireEvent.click(checkbox);

    // Delete button should now be enabled and show badge
    expect(deleteBtn.hasAttribute('disabled')).toBe(false);
    expect(screen.getByText('1')).toBeDefined();

    // 3. Click delete
    fireEvent.click(deleteBtn);

    // Row should be gone
    await waitFor(() => {
      expect(screen.queryByText('Scratching Post')).toBeNull();
    });
    expect(screen.getByText('No expenses yet')).toBeDefined();
  });

  it('should disable the export button when empty and invoke exportExpensesToCsv when clicked with data', async () => {
    render(<App />);

    // 1. Initially disabled
    const exportBtn = screen.getByRole('button', { name: /Export all expenses as CSV/i });
    expect(exportBtn.hasAttribute('disabled')).toBe(true);

    // 2. Add an expense
    fireEvent.click(screen.getByRole('button', { name: /Add Expense/i }));
    fireEvent.change(screen.getByLabelText('Item Name'), { target: { value: 'Catnip Toy' } });
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'Accessory' } });
    fireEvent.change(screen.getByLabelText('Amount ($)'), { target: { value: '5.99' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('Catnip Toy')).toBeDefined();
    });

    // 3. Now enabled
    expect(exportBtn.hasAttribute('disabled')).toBe(false);

    // 4. Click export and verify call
    fireEvent.click(exportBtn);
    expect(exportExpensesToCsv).toHaveBeenCalled();
  });
});

