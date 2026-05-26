/**
 * Pure utility functions for expense operations.
 * No side effects — easily unit-testable.
 */

import { v4 as uuidv4 } from 'uuid';
import type { Expense, Category, ExpenseFormData } from '../types/models';

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
export function sumByCategory(
  expenses: readonly Expense[],
): Map<Category, number> {
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
export function getTopSpendingCategories(
  expenses: readonly Expense[],
): Set<Category> {
  if (expenses.length === 0) return new Set();

  const categorySums = sumByCategory(expenses);
  const maxAmount = Math.max(...categorySums.values());

  const topCategories = new Set<Category>();
  for (const [category, amount] of categorySums) {
    if (Math.round(amount * 100) === Math.round(maxAmount * 100)) {
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
 * Generates a unique identifier.
 * Uses uuid v4.
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Creates a new Expense entity from form data.
 * Assigns a unique ID and creation timestamp.
 */
export function createExpense(formData: ExpenseFormData): Expense {
  return {
    id: generateId(),
    name: formData.name.trim(),
    category: formData.category,
    amount: Number(formData.amount.toFixed(2)),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Creates a duplicate of an existing expense.
 * Generates a new ID and keeps the name identical.
 */
export function duplicateExpenseItem(expense: Expense): Expense {
  return {
    ...expense,
    id: generateId(),
    name: expense.name,
    createdAt: new Date().toISOString(),
  };
}
