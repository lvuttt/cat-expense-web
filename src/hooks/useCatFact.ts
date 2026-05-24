/**
 * useCatFact — Hook for fetching random cat facts.
 *
 * Single Responsibility: manages the async lifecycle of a cat fact request.
 * Delegates the actual fetch to catFactService.
 * Handles loading, error, and fallback states for offline tolerance.
 *
 * Offline fallback priority:
 *   1. A random fact from the localStorage cache (if any exist)
 *   2. The hardcoded FALLBACK_CAT_FACT constant
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchCatFact, getCachedFacts } from '../services/catFactService';
import { FALLBACK_CAT_FACT } from '../constants';

interface UseCatFactReturn {
  readonly fact: string;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly refetch: () => void;
}

/** Picks a random fact from the cache, or returns the static fallback. */
function getOfflineFact(): string {
  const cached = getCachedFacts();
  if (cached.length === 0) return FALLBACK_CAT_FACT;
  const idx = Math.floor(Math.random() * cached.length);
  return cached[idx];
}

export function useCatFact(): UseCatFactReturn {
  const [fact, setFact] = useState<string>(FALLBACK_CAT_FACT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const refetch = useCallback(() => {
    // Cancel any in-flight request
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    fetchCatFact(controller.signal)
      .then((newFact) => {
        if (!controller.signal.aborted) {
          setFact(newFact);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;

        const message =
          err instanceof Error ? err.message : 'Failed to fetch cat fact';
        console.warn('[useCatFact] API error, using offline fallback:', message);
        setFact(getOfflineFact());
        setError(message);
        setIsLoading(false);
      });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { fact, isLoading, error, refetch };
}
