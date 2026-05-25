/**
 * Application-wide constants.
 * All magic strings and numbers are extracted here to avoid duplication
 * and enable easy modification.
 */

/** LocalStorage key for persisting expenses. */
export const STORAGE_KEY = 'cat-expense-data';

/** Cat Facts API endpoint — returns a random cat fact. */
export const CAT_FACT_API_URL = 'https://catfact.ninja/fact';

/** Fallback cat fact displayed when the API is unavailable (offline tolerance). */
export const FALLBACK_CAT_FACT =
  'Cats sleep for about 13–16 hours a day, making them one of the sleepiest animals! 😴';

/** LocalStorage key for persisting the cat fact offline cache. */
export const CAT_FACT_CACHE_KEY = 'cat-fact-cache';

/** Maximum number of cat facts to store in the offline cache. */
export const CAT_FACT_CACHE_MAX = 10;

/** Form validation constraints. */
export const VALIDATION = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  AMOUNT_MIN: 0.01,
  AMOUNT_MAX: 999_999.99,
  AMOUNT_DECIMALS: 2,
} as const;

export { CATEGORIES, CATEGORY_CONFIG } from './categories';
