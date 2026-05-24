/**
 * Storage service abstraction — Dependency Inversion Principle.
 *
 * High-level hooks depend on IStorageService<T> (abstraction),
 * not on localStorage (concrete implementation).
 * This makes hooks testable with mock storage and enables
 * future migration to IndexedDB or other backends.
 */

/**
 * Generic storage interface.
 * Any storage backend must implement this contract.
 */
export interface IStorageService<T> {
  load(): T | null;
  save(data: T): void;
  clear(): void;
}

/**
 * LocalStorage-based implementation of IStorageService.
 * Handles JSON serialization/deserialization with error recovery.
 */
export class LocalStorageService<T> implements IStorageService<T> {
  readonly key: string;

  constructor(key: string) {
    this.key = key;
  }

  load(): T | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(
        `[StorageService] Failed to load data for key "${this.key}":`,
        error,
      );
      return null;
    }
  }

  save(data: T): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (error) {
      console.error(
        `[StorageService] Failed to save data for key "${this.key}":`,
        error,
      );
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error(
        `[StorageService] Failed to clear key "${this.key}":`,
        error,
      );
    }
  }
}
