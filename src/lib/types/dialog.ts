import type { Expense } from './expense';

/**
 * Discriminated union for dialog mode.
 * Ensures type-safe handling of add vs. edit scenarios
 * without boolean flags or optional properties.
 */
export type DialogMode =
  | { readonly type: 'add' }
  | { readonly type: 'edit'; readonly expense: Expense };
