import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import SpendingChart from './SpendingChart.svelte';
import { furnitureExpense, sampleExpense } from '$lib/test/fixtures';

describe('SpendingChart', () => {
  it('renders nothing when there are no expenses', () => {
    const { container } = render(SpendingChart, {
      props: {
        expenses: [],
        topCategories: new Set(),
        categoryTotals: new Map(),
      },
    });

    expect(container.querySelector('#spending-chart')).toBeNull();
  });

  it('renders category breakdown for expenses with totals', () => {
    render(SpendingChart, {
      props: {
        expenses: [sampleExpense, furnitureExpense],
        topCategories: new Set(['Furniture']),
        categoryTotals: new Map([
          ['Food', 24.99],
          ['Furniture', 150.0],
        ]),
      },
    });

    expect(
      screen.getByRole('region', { name: 'Spending by category' }),
    ).toBeTruthy();
    expect(screen.getByText('Spending Breakdown')).toBeTruthy();
    expect(screen.getByText('Food')).toBeTruthy();
    expect(screen.getByText('Furniture')).toBeTruthy();
    expect(screen.getByText('$24.99')).toBeTruthy();
    expect(screen.getByText('$150.00')).toBeTruthy();
    expect(screen.getByLabelText('Top spending category')).toBeTruthy();
  });

  it('omits categories with zero spending', () => {
    render(SpendingChart, {
      props: {
        expenses: [sampleExpense],
        topCategories: new Set(['Food']),
        categoryTotals: new Map([['Food', 24.99]]),
      },
    });

    expect(screen.getByText('Food')).toBeTruthy();
    expect(screen.queryByText('Accessory')).toBeNull();
  });
});
