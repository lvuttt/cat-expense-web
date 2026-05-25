/**
 * Barrel file — re-exports all type definitions for convenient imports.
 *
 * Usage:
 *   import type { Expense, Category, SortConfig, DialogMode } from '../types';
 */
export type {
  Expense,
  Category,
  CategoryMeta,
  ExpenseFormData,
} from './expense';
export type { SortField, SortDirection, SortConfig } from './sort';
export type { DialogMode } from './dialog';
