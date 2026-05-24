import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCatFact } from './useCatFact';
import { fetchCatFact, getCachedFacts } from '../services/catFactService';
import { FALLBACK_CAT_FACT, CAT_FACT_CACHE_KEY } from '../constants';

vi.mock('../services/catFactService', () => ({
  fetchCatFact: vi.fn(),
  getCachedFacts: vi.fn(),
}));

describe('useCatFact hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // By default, simulate empty cache
    vi.mocked(getCachedFacts).mockReturnValue([]);
  });

  it('should initialize with default fallback fact, isLoading false, and error null', () => {
    const { result } = renderHook(() => useCatFact());
    expect(result.current.fact).toBe(FALLBACK_CAT_FACT);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update fact when refetch succeeds', async () => {
    const mockFact = 'Cats sleep 70% of their lives.';
    vi.mocked(fetchCatFact).mockResolvedValueOnce(mockFact);

    const { result } = renderHook(() => useCatFact());

    act(() => {
      result.current.refetch();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.fact).toBe(mockFact);
    expect(result.current.error).toBeNull();
  });

  it('should use the hardcoded fallback when refetch fails and cache is empty', async () => {
    vi.mocked(fetchCatFact).mockRejectedValueOnce(new Error('Network error'));
    vi.mocked(getCachedFacts).mockReturnValue([]);

    const { result } = renderHook(() => useCatFact());

    act(() => {
      result.current.refetch();
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.fact).toBe(FALLBACK_CAT_FACT);
    expect(result.current.error).toBe('Network error');
  });

  it('should use a cached fact when refetch fails and cache has entries', async () => {
    const cachedFact = 'Cats can rotate their ears 180 degrees.';
    vi.mocked(fetchCatFact).mockRejectedValueOnce(new Error('Offline'));
    vi.mocked(getCachedFacts).mockReturnValue([cachedFact]);

    const { result } = renderHook(() => useCatFact());

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.fact).toBe(cachedFact);
    expect(result.current.error).toBe('Offline');
  });

  it('should abort pending requests on unmount', () => {
    let signalPassed: AbortSignal | undefined;
    vi.mocked(fetchCatFact).mockImplementationOnce((sig) => {
      signalPassed = sig;
      return new Promise(() => {}); // never resolves
    });

    const { result, unmount } = renderHook(() => useCatFact());

    act(() => {
      result.current.refetch();
    });

    expect(signalPassed).toBeDefined();
    expect(signalPassed?.aborted).toBe(false);

    unmount();

    expect(signalPassed?.aborted).toBe(true);
  });

  it('should expose a refetch function', () => {
    const { result } = renderHook(() => useCatFact());
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should not store CAT_FACT_CACHE_KEY via the hook itself', () => {
    renderHook(() => useCatFact());
    // The hook does not directly write to localStorage — caching is the service's job
    expect(localStorage.getItem(CAT_FACT_CACHE_KEY)).toBeNull();
  });
});
