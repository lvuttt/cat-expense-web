/**
 * Available fields for sorting expenses.
 */
export type SortField = 'name' | 'category' | 'amount';

/**
 * Sort direction — ascending or descending.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Complete sort configuration combining field and direction.
 */
export interface SortConfig {
  readonly field: SortField;
  readonly direction: SortDirection;
}
