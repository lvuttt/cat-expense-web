import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { SpendingChart } from './SpendingChart';
import type { Expense, Category } from '../../types';

const makeExpense = (id: string, category: Category, amount: number): Expense => ({
  id,
  name: `Expense ${id}`,
  category,
  amount,
  createdAt: new Date().toISOString(),
});

const expenses: Expense[] = [
  makeExpense('1', 'Food', 60),
  makeExpense('2', 'Food', 40),         // Food total: 100
  makeExpense('3', 'Furniture', 100),   // Furniture total: 100 (tied with Food)
  makeExpense('4', 'Accessory', 50),    // Accessory total: 50
];
const topCategories = new Set<Category>(['Food', 'Furniture']);

describe('SpendingChart component', () => {
  afterEach(cleanup);

  it('should render nothing when expenses list is empty', () => {
    const { container } = render(
      <SpendingChart expenses={[]} topCategories={new Set()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render the chart section with accessible label', () => {
    render(<SpendingChart expenses={expenses} topCategories={topCategories} />);
    expect(screen.getByRole('region', { name: /Spending by category/i })).toBeDefined();
  });

  it('should render a row for each category that has expenses', () => {
    render(<SpendingChart expenses={expenses} topCategories={topCategories} />);
    const items = screen.getAllByRole('listitem');
    // Food, Furniture, Accessory — all 3 have expenses
    expect(items).toHaveLength(3);
  });

  it('should not render a row for a category with zero spending', () => {
    const onlyFood: Expense[] = [makeExpense('1', 'Food', 50)];
    render(<SpendingChart expenses={onlyFood} topCategories={new Set(['Food'])} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(1);
  });

  it('should display formatted total amounts for each category', () => {
    render(<SpendingChart expenses={expenses} topCategories={topCategories} />);
    // Food: $100, Furniture: $100, Accessory: $50
    const totals = screen.getAllByText(/\$\d/);
    expect(totals.length).toBeGreaterThanOrEqual(3);
  });

  it('should apply the top modifier class to top-spending category rows', () => {
    const { container } = render(
      <SpendingChart expenses={expenses} topCategories={topCategories} />
    );
    const topRows = container.querySelectorAll('.spending-chart__row--top');
    expect(topRows).toHaveLength(2); // Food and Furniture are tied
  });

  it('should render ARIA progressbar roles for each category bar', () => {
    render(<SpendingChart expenses={expenses} topCategories={topCategories} />);
    const bars = screen.getAllByRole('progressbar');
    expect(bars).toHaveLength(3);
  });

  it('should set aria-valuenow on each progressbar reflecting percentage', () => {
    render(<SpendingChart expenses={expenses} topCategories={topCategories} />);
    const bars = screen.getAllByRole('progressbar');
    // Total: 250. Food=100 (40%), Furniture=100 (40%), Accessory=50 (20%)
    const values = bars.map((b) => Number(b.getAttribute('aria-valuenow')));
    expect(values).toContain(40);  // Food
    expect(values).toContain(40);  // Furniture
    expect(values).toContain(20);  // Accessory
  });

  it('should display percentage labels', () => {
    render(<SpendingChart expenses={expenses} topCategories={topCategories} />);
    expect(screen.getAllByText(/\d+%/)).toHaveLength(3);
  });
});
