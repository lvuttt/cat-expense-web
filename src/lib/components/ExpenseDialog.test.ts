import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ExpenseDialog from './ExpenseDialog.svelte';
import { sampleExpense } from '$lib/test/fixtures';

vi.mock('$lib/state/catFact.svelte', () => ({
  createCatFact: () => ({
    get fact() {
      return 'Mock cat fact for tests.';
    },
    get isLoading() {
      return false;
    },
    get error() {
      return null;
    },
    refetch: vi.fn(),
  }),
}));

describe('ExpenseDialog', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  it('renders nothing when closed', () => {
    render(ExpenseDialog, {
      props: {
        isOpen: false,
        mode: { type: 'add' },
        onClose: vi.fn(),
        onSubmit: vi.fn(),
      },
    });

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders add dialog with form and cat fact when open', () => {
    render(ExpenseDialog, {
      props: {
        isOpen: true,
        mode: { type: 'add' },
        onClose: vi.fn(),
        onSubmit: vi.fn(),
      },
    });

    expect(screen.getByRole('dialog', { name: 'Add Expense' })).toBeTruthy();
    expect(screen.getByLabelText(/Item Name/)).toBeTruthy();
    expect(screen.getByText('Mock cat fact for tests.')).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('renders edit dialog title when in edit mode', () => {
    render(ExpenseDialog, {
      props: {
        isOpen: true,
        mode: { type: 'edit', expense: sampleExpense },
        onClose: vi.fn(),
        onSubmit: vi.fn(),
      },
    });

    expect(screen.getByRole('dialog', { name: 'Edit Expense' })).toBeTruthy();
    expect((screen.getByLabelText(/Item Name/) as HTMLInputElement).value).toBe(
      'Premium kibble',
    );
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();

    render(ExpenseDialog, {
      props: {
        isOpen: true,
        mode: { type: 'add' },
        onClose,
        onSubmit: vi.fn(),
      },
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Close dialog' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();

    render(ExpenseDialog, {
      props: {
        isOpen: true,
        mode: { type: 'add' },
        onClose,
        onSubmit: vi.fn(),
      },
    });

    await fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledOnce();
  });
});
