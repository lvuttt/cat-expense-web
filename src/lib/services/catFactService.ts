/**
 * Cat Facts API service — Single Responsibility Principle.
 *
 * Sole responsibility: fetching random cat facts from the external API.
 * Returns the fact string on success, throws on failure.
 * AbortSignal support enables proper cleanup on component unmount.
 *
 * Offline cache: successfully fetched facts are stored in localStorage
 * (up to CAT_FACT_CACHE_MAX entries) so that callers can display a
 * previously-seen fact when the network is unavailable.
 */

import {
  CAT_FACT_API_URL,
  CAT_FACT_CACHE_KEY,
  CAT_FACT_CACHE_MAX,
} from '../constants/app';

/** Shape of the response from catfact.ninja/fact */
interface CatFactApiResponse {
  readonly fact: string;
  readonly length: number;
}

/**
 * Returns the current array of cached cat facts stored in localStorage.
 * Returns an empty array if the cache is empty or corrupt.
 */
export function getCachedFacts(): string[] {
  try {
    const raw = localStorage.getItem(CAT_FACT_CACHE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')) {
      return parsed as string[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Adds a fact to the localStorage cache. Keeps only the most recent
 * CAT_FACT_CACHE_MAX facts to avoid unbounded growth.
 * Deduplicates — already-cached facts are not re-added.
 */
export function cacheFact(fact: string): void {
  try {
    const current = getCachedFacts();
    if (current.includes(fact)) return;
    const updated = [...current, fact].slice(-CAT_FACT_CACHE_MAX);
    localStorage.setItem(CAT_FACT_CACHE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable — silent failure is acceptable for a cache
  }
}

/**
 * Fetches a random cat fact from the Cat Facts API and caches it.
 *
 * @param signal - Optional AbortSignal for cancellation
 * @returns The cat fact string
 * @throws Error if the request fails or response is invalid
 */
export async function fetchCatFact(signal?: AbortSignal): Promise<string> {
  const response = await fetch(CAT_FACT_API_URL, { signal });

  if (!response.ok) {
    throw new Error(`Cat fact API returned HTTP ${response.status}`);
  }

  const data: CatFactApiResponse = await response.json();
  cacheFact(data.fact);
  return data.fact;
}
