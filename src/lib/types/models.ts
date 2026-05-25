/**
 * Re-exports domain type definitions for convenient imports.
 *
 * Usage:
 *   import type { Expense, Category, SortConfig, DialogMode } from '$lib/types/models';
 */
export type {
  Expense,
  Category,
  CategoryMeta,
  ExpenseFormData,
} from './expense';
export type { SortField, SortDirection, SortConfig } from './sort';
export type { DialogMode } from './dialog';
