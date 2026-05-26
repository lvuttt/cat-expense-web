/**
 * Sort utility functions using the Strategy pattern.
 * Open/Closed Principle: add new sort fields by adding a strategy entry,
 * no existing component logic needs to change.
 */

import type { Expense } from '../types/models';
import type { SortField, SortDirection, SortConfig } from '../types/models';

/** Comparison function signature. */
type CompareFn = (a: Expense, b: Expense) => number;

/**
 * Strategy map — each sort field maps to its comparison function.
 * Extend this record to support new sortable fields.
 */
const SORT_STRATEGIES: Record<SortField, CompareFn> = {
  name: (a, b) => a.name.localeCompare(b.name),
  category: (a, b) => a.category.localeCompare(b.category),
  amount: (a, b) => a.amount - b.amount,
};

/**
 * Sorts an array of expenses according to the given configuration.
 * Returns a new sorted array — does NOT mutate the input.
 */
export const sortExpenses = (
  expenses: Expense[],
  config: SortConfig,
): Expense[] => {
  const compareFn = SORT_STRATEGIES[config.field];
  const sorted = [...expenses].sort(compareFn);
  return config.direction === 'desc' ? sorted.reverse() : sorted;
};

/**
 * Toggles sort direction between ascending and descending.
 */
export const toggleSortDirection = (current: SortDirection): SortDirection => {
  return current === 'asc' ? 'desc' : 'asc';
};
