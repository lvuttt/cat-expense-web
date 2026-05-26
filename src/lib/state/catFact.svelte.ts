import { onDestroy } from 'svelte';
import { fetchCatFact, getCachedFacts } from '../services/catFactService';
import { FALLBACK_CAT_FACT } from '../constants/app';

const getOfflineFact = (): string => {
  const cached = getCachedFacts();
  if (cached.length === 0) return FALLBACK_CAT_FACT;
  const idx = Math.floor(Math.random() * cached.length);
  return cached[idx];
};

export const createCatFact = () => {
  let fact = $state<string>(FALLBACK_CAT_FACT);
  let isLoading = $state<boolean>(false);
  let error = $state<string | null>(null);
  let abortController: AbortController | null = null;

  const refetch = async (): Promise<void> => {
    abortController?.abort();

    const controller = new AbortController();
    abortController = controller;

    isLoading = true;
    error = null;

    try {
      const newFact = await fetchCatFact(controller.signal);
      if (!controller.signal.aborted) {
        fact = newFact;
        isLoading = false;
      }
    } catch (err: unknown) {
      if (controller.signal.aborted) return;

      const message =
        err instanceof Error ? err.message : 'Failed to fetch cat fact';
      console.warn(
        '[createCatFact] API error, using offline fallback:',
        message,
      );
      fact = getOfflineFact();
      error = message;
      isLoading = false;
    }
  };

  const abort = (): void => {
    abortController?.abort();
    abortController = null;
    isLoading = false;
  };

  onDestroy(() => {
    abort();
  });

  return {
    get fact() {
      return fact;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    refetch,
    abort,
  };
};
