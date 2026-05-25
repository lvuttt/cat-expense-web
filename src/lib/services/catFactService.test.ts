import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchCatFact, getCachedFacts, cacheFact } from './catFactService';
import { CAT_FACT_CACHE_KEY, CAT_FACT_CACHE_MAX } from '../constants/app';

describe('catFactService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('fetchCatFact', () => {
    it('should return a cat fact on a successful API response', async () => {
      const mockFact = 'Cats are clean animals.';
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ fact: mockFact, length: mockFact.length }),
      } as Response);

      const result = await fetchCatFact();
      expect(result).toBe(mockFact);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('should cache the fetched fact in localStorage', async () => {
      const mockFact = 'Cats purr at healing frequencies.';
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ fact: mockFact, length: mockFact.length }),
      } as Response);

      await fetchCatFact();
      expect(getCachedFacts()).toContain(mockFact);
    });

    it('should throw an error when response is not ok', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(fetchCatFact()).rejects.toThrow(
        'Cat fact API returned HTTP 500',
      );
    });

    it('should pass the abort signal to the fetch call', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ fact: 'Test fact', length: 9 }),
      } as Response);

      const controller = new AbortController();
      await fetchCatFact(controller.signal);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ signal: controller.signal }),
      );
    });
  });

  describe('getCachedFacts', () => {
    it('should return an empty array when cache is empty', () => {
      expect(getCachedFacts()).toEqual([]);
    });

    it('should return the stored array of facts', () => {
      localStorage.setItem(
        CAT_FACT_CACHE_KEY,
        JSON.stringify(['fact one', 'fact two']),
      );
      expect(getCachedFacts()).toEqual(['fact one', 'fact two']);
    });

    it('should return an empty array if localStorage contains malformed JSON', () => {
      localStorage.setItem(CAT_FACT_CACHE_KEY, 'not-json');
      expect(getCachedFacts()).toEqual([]);
    });

    it('should return an empty array if stored value is not a string array', () => {
      localStorage.setItem(
        CAT_FACT_CACHE_KEY,
        JSON.stringify({ fact: 'wrong shape' }),
      );
      expect(getCachedFacts()).toEqual([]);
    });
  });

  describe('cacheFact', () => {
    it('should store a new fact in localStorage', () => {
      cacheFact('Cats have whiskers.');
      expect(getCachedFacts()).toEqual(['Cats have whiskers.']);
    });

    it('should not duplicate an already-cached fact', () => {
      cacheFact('Cats have whiskers.');
      cacheFact('Cats have whiskers.');
      expect(getCachedFacts()).toHaveLength(1);
    });

    it(`should keep only the most recent ${CAT_FACT_CACHE_MAX} facts`, () => {
      for (let i = 1; i <= CAT_FACT_CACHE_MAX + 3; i++) {
        cacheFact(`Fact ${i}`);
      }
      const cached = getCachedFacts();
      expect(cached).toHaveLength(CAT_FACT_CACHE_MAX);
      // Oldest facts (1, 2, 3) should be evicted
      expect(cached).not.toContain('Fact 1');
      expect(cached).not.toContain('Fact 2');
      expect(cached).not.toContain('Fact 3');
    });
  });
});
