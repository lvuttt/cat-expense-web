import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ExpenseForm from './ExpenseForm.svelte';
import { sampleExpense } from '$lib/test/fixtures';

describe('ExpenseForm', () => {
  it('renders empty fields and Submit label in add mode', () => {
    render(ExpenseForm, {
      props: {
        mode: { type: 'add' },
        onSubmit: vi.fn(),
      },
    });

    expect((screen.getByLabelText(/Item Name/) as HTMLInputElement).value).toBe(
      '',
    );
    expect((screen.getByLabelText(/Category/) as HTMLSelectElement).value).toBe(
      '',
    );
    expect((screen.getByLabelText(/Amount/) as HTMLInputElement).value).toBe(
      '',
    );
    expect(screen.getByRole('button', { name: 'Submit' })).toBeTruthy();
  });

  it('prefills fields and shows Update label in edit mode', () => {
    render(ExpenseForm, {
      props: {
        mode: { type: 'edit', expense: sampleExpense },
        onSubmit: vi.fn(),
      },
    });

    expect((screen.getByLabelText(/Item Name/) as HTMLInputElement).value).toBe(
      'Premium kibble',
    );
    expect((screen.getByLabelText(/Category/) as HTMLSelectElement).value).toBe(
      'Food',
    );
    expect((screen.getByLabelText(/Amount/) as HTMLInputElement).value).toBe(
      '24.99',
    );
    expect(screen.getByRole('button', { name: 'Update' })).toBeTruthy();
  });

  it('shows validation errors when submitting an empty form', async () => {
    render(ExpenseForm, {
      props: {
        mode: { type: 'add' },
        onSubmit: vi.fn(),
      },
    });

    await fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.getByText('Item name is required.')).toBeTruthy();
    expect(screen.getByText('Please select a category.')).toBeTruthy();
    expect(screen.getByText('Amount is required.')).toBeTruthy();
  });

  it('calls onSubmit with valid form data', async () => {
    const onSubmit = vi.fn();

    render(ExpenseForm, {
      props: {
        mode: { type: 'add' },
        onSubmit,
      },
    });

    await fireEvent.input(screen.getByLabelText(/Item Name/), {
      target: { value: 'Treats' },
    });
    await fireEvent.change(screen.getByLabelText(/Category/), {
      target: { value: 'Food' },
    });
    await fireEvent.input(screen.getByLabelText(/Amount/), {
      target: { value: '9.5' },
    });
    await fireEvent.submit(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Treats',
      category: 'Food',
      amount: 9.5,
    });
  });
});
