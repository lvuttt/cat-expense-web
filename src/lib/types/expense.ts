import { CATEGORIES } from '../constants/categories';

/**
 * Core expense entity — represents a single tracked expense item.
 */
export interface Expense {
  readonly id: string;
  readonly name: string;
  readonly category: Category;
  readonly amount: number;
  readonly createdAt: string; // ISO 8601 date string
}

/**
 * Derived union type from the CATEGORIES constant array.
 * Adding a new category to CATEGORIES automatically extends this type.
 */
export type Category = (typeof CATEGORIES)[number];

/**
 * Metadata associated with each category for display purposes.
 */
export interface CategoryMeta {
  readonly label: string;
  readonly emoji: string;
  readonly cssClass: string;
}

/**
 * Form data submitted when creating or updating an expense.
 * Intentionally excludes `id` and `createdAt` — those are assigned by the system.
 * Follows ISP: components only receive what they need to collect.
 */
export interface ExpenseFormData {
  readonly name: string;
  readonly category: Category;
  readonly amount: number;
}
