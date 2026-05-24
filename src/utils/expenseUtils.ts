/**
 * Pure utility functions for expense operations.
 * No side effects — easily unit-testable.
 */

import type { Expense, Category, ExpenseFormData } from '../types';

/**
 * Calculates the total amount across all expenses.
 * Uses fixed-point arithmetic to avoid floating point drift.
 */
export function calculateTotal(expenses: readonly Expense[]): number {
  const totalCents = expenses.reduce(
    (sum, expense) => sum + Math.round(expense.amount * 100),
    0,
  );
  return totalCents / 100;
}

/**
 * Groups expenses by category and sums their amounts.
 * Returns a Map of category → total amount.
 */
export function sumByCategory(expenses: readonly Expense[]): Map<Category, number> {
  const sums = new Map<Category, number>();

  for (const expense of expenses) {
    const currentCents = Math.round((sums.get(expense.category) ?? 0) * 100);
    const addCents = Math.round(expense.amount * 100);
    sums.set(expense.category, (currentCents + addCents) / 100);
  }

  return sums;
}

/**
 * Returns the set of categories with the highest total spending.
 * Handles ties — multiple categories can be "top" if they share the max amount.
 * Returns an empty set if there are no expenses.
 */
export function getTopSpendingCategories(expenses: readonly Expense[]): Set<Category> {
  if (expenses.length === 0) return new Set();

  const categorySums = sumByCategory(expenses);
  const maxAmount = Math.max(...categorySums.values());

  const topCategories = new Set<Category>();
  for (const [category, amount] of categorySums) {
    if (amount === maxAmount) {
      topCategories.add(category);
    }
  }

  return topCategories;
}

/**
 * Checks if an expense belongs to a top-spending category.
 */
export function isInTopCategory(
  expense: Expense,
  topCategories: Set<Category>,
): boolean {
  return topCategories.has(expense.category);
}

/**
 * Creates a new Expense entity from form data.
 * Assigns a unique ID and creation timestamp.
 */
export function createExpense(formData: ExpenseFormData): Expense {
  return {
    id: crypto.randomUUID(),
    name: formData.name.trim(),
    category: formData.category,
    amount: Number(formData.amount.toFixed(2)),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Derives the next copy name for a duplicated expense.
 * Handles suffix incrementing: Name → Name (Copy) → Name (Copy 2) → ...
 */
export function getNextCopyName(name: string): string {
  // Match "Name (Copy)" or "Name (Copy N)"
  const copyMatch = name.match(/^(.*?)\s*\(Copy(?:\s+(\d+))?\)$/);
  if (copyMatch) {
    const base = copyMatch[1];
    const n = copyMatch[2] ? parseInt(copyMatch[2], 10) : 1;
    return `${base} (Copy ${n + 1})`;
  }
  return `${name} (Copy)`;
}

/**
 * Creates a duplicate of an existing expense.
 * Generates a new ID and appends a smart "(Copy N)" suffix to the name.
 */
export function duplicateExpenseItem(expense: Expense): Expense {
  return {
    ...expense,
    id: crypto.randomUUID(),
    name: getNextCopyName(expense.name),
    createdAt: new Date().toISOString(),
  };
}
