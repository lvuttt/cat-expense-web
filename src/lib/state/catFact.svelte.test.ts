import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCatFact } from './catFact.svelte';
import { fetchCatFact, getCachedFacts } from '../services/catFactService';
import { FALLBACK_CAT_FACT } from '../constants/app';

// Mock onDestroy from Svelte to avoid component context requirements during state testing
vi.mock('svelte', async (importOriginal) => {
  const original = await importOriginal<typeof import('svelte')>();
  return {
    ...original,
    onDestroy: vi.fn(),
  };
});

vi.mock('../services/catFactService', () => ({
  fetchCatFact: vi.fn(),
  getCachedFacts: vi.fn(() => []),
}));

describe('catFact.svelte', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default states', () => {
    const state = createCatFact();
    expect(state.fact).toBe(FALLBACK_CAT_FACT);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should fetch and update fact successfully', async () => {
    const mockFact = 'Cats have nine lives.';
    vi.mocked(fetchCatFact).mockResolvedValue(mockFact);

    const state = createCatFact();
    state.refetch();

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();

    await vi.waitFor(() => {
      expect(state.isLoading).toBe(false);
    });

    expect(state.fact).toBe(mockFact);
    expect(state.error).toBeNull();
  });

  it('should handle fetch failure and use cached facts or fallback', async () => {
    vi.mocked(fetchCatFact).mockRejectedValue(new Error('Network error'));
    vi.mocked(getCachedFacts).mockReturnValue(['Cached fact 1']);

    const state = createCatFact();
    state.refetch();

    await vi.waitFor(() => {
      expect(state.isLoading).toBe(false);
    });

    expect(state.fact).toBe('Cached fact 1');
    expect(state.error).toBe('Network error');
  });

  it('should abort previous fetch on subsequent refetch', async () => {
    let resolveFirstFetch!: (val: string) => void;
    const firstFetchPromise = new Promise<string>((resolve) => {
      resolveFirstFetch = resolve;
    });

    vi.mocked(fetchCatFact)
      .mockImplementationOnce((signal) => {
        return new Promise<string>((resolve, reject) => {
          signal?.addEventListener('abort', () => {
            reject(new DOMException('Aborted', 'AbortError'));
          });
          firstFetchPromise.then(resolve);
        });
      })
      .mockResolvedValueOnce('Second fetch fact');

    const state = createCatFact();

    // First refetch
    state.refetch();

    // Second refetch (should abort the first)
    state.refetch();

    resolveFirstFetch('First fetch fact');

    await vi.waitFor(() => {
      expect(state.isLoading).toBe(false);
    });

    expect(state.fact).toBe('Second fetch fact');
  });

  it('should abort fetch and reset loading state when abort is called', async () => {
    vi.mocked(fetchCatFact).mockImplementation((signal) => {
      return new Promise<string>((_resolve, reject) => {
        signal?.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });

    const state = createCatFact();
    state.refetch();

    expect(state.isLoading).toBe(true);

    state.abort();

    expect(state.isLoading).toBe(false);
  });
});
