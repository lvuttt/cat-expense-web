import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageService } from './storageService';

describe('LocalStorageService', () => {
  const TEST_KEY = 'test-key';
  let storage: LocalStorageService<{ name: string }>;

  beforeEach(() => {
    localStorage.clear();
    storage = new LocalStorageService<{ name: string }>(TEST_KEY);
    vi.restoreAllMocks();
  });

  it('should save data to localStorage as a JSON string', () => {
    const data = { name: 'Garfield' };
    storage.save(data);

    const raw = localStorage.getItem(TEST_KEY);
    expect(raw).toBe(JSON.stringify(data));
  });

  it('should load data and parse it back to an object', () => {
    const data = { name: 'Garfield' };
    localStorage.setItem(TEST_KEY, JSON.stringify(data));

    const result = storage.load();
    expect(result).toEqual(data);
  });

  it('should return null if there is no data stored under the key', () => {
    expect(storage.load()).toBeNull();
  });

  it('should return null and log an error if JSON parsing fails', () => {
    localStorage.setItem(TEST_KEY, 'invalid-json-{');

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = storage.load();

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should clear data from localStorage', () => {
    localStorage.setItem(TEST_KEY, JSON.stringify({ name: 'Garfield' }));
    storage.clear();

    expect(localStorage.getItem(TEST_KEY)).toBeNull();
  });

  it('should handle exceptions gracefully in save and clear', () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    storage.save({ name: 'Garfield' });

    expect(consoleSpy).toHaveBeenCalled();
    setItemSpy.mockRestore();
  });
});
