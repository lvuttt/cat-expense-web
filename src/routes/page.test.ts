import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Page from './+page.svelte';
import { STORAGE_KEY } from '$lib/constants/app';

function mockCatFactFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        fact: 'Cats have five toes on their front paws.',
        length: 38,
      }),
    } as Response),
  );
}

describe('+page.svelte', () => {
  beforeEach(() => {
    localStorage.clear();
    mockCatFactFetch();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.style.overflow = '';
  });

  it('renders the dashboard shell with an empty state', () => {
    render(Page);

    expect(screen.getByRole('heading', { name: 'Cat Expense' })).toBeTruthy();
    expect(screen.getByText('No expenses yet')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Export all expenses as CSV' }),
    ).toHaveProperty('disabled', true);
  });

  it('opens the add expense dialog when Add Expense is clicked', async () => {
    render(Page);

    await fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));

    expect(screen.getByRole('dialog', { name: 'Add Expense' })).toBeTruthy();
    expect(screen.getByLabelText(/Item Name/)).toBeTruthy();
  });

  it('persists a new expense to localStorage after submit', async () => {
    render(Page);

    await fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
    await fireEvent.input(screen.getByLabelText(/Item Name/), {
      target: { value: 'Catnip' },
    });
    await fireEvent.change(screen.getByLabelText(/Category/), {
      target: { value: 'Accessory' },
    });
    await fireEvent.input(screen.getByLabelText(/Amount/), {
      target: { value: '5' },
    });
    await fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('Catnip')).toBeTruthy();

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Catnip');
    expect(stored[0].category).toBe('Accessory');
    expect(stored[0].amount).toBe(5);
  });
});
