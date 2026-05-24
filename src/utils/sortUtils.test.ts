import { describe, it, expect } from 'vitest';
import type { Expense } from '../types';
import { sortExpenses, toggleSortDirection } from './sortUtils';

describe('sortUtils', () => {
  const mockExpenses: Expense[] = [
    { id: '1', name: 'Tuna', category: 'Food', amount: 15.0, createdAt: '2026-05-21T10:00:00Z' },
    { id: '2', name: 'Collar', category: 'Accessory', amount: 5.5, createdAt: '2026-05-23T10:00:00Z' },
    { id: '3', name: 'Cat Tree', category: 'Furniture', amount: 120.0, createdAt: '2026-05-22T10:00:00Z' },
  ];

  describe('sortExpenses', () => {
    it('should sort by name in ascending order by default', () => {
      const result = sortExpenses(mockExpenses, { field: 'name', direction: 'asc' });
      expect(result.map(e => e.name)).toEqual(['Cat Tree', 'Collar', 'Tuna']);
    });

    it('should sort by name in descending order', () => {
      const result = sortExpenses(mockExpenses, { field: 'name', direction: 'desc' });
      expect(result.map(e => e.name)).toEqual(['Tuna', 'Collar', 'Cat Tree']);
    });

    it('should sort by category in ascending order', () => {
      const result = sortExpenses(mockExpenses, { field: 'category', direction: 'asc' });
      // Accessory, Food, Furniture
      expect(result.map(e => e.category)).toEqual(['Accessory', 'Food', 'Furniture']);
    });

    it('should sort by category in descending order', () => {
      const result = sortExpenses(mockExpenses, { field: 'category', direction: 'desc' });
      expect(result.map(e => e.category)).toEqual(['Furniture', 'Food', 'Accessory']);
    });

    it('should sort by amount in ascending order', () => {
      const result = sortExpenses(mockExpenses, { field: 'amount', direction: 'asc' });
      // 5.5, 15.0, 120.0
      expect(result.map(e => e.amount)).toEqual([5.5, 15.0, 120.0]);
    });

    it('should sort by amount in descending order', () => {
      const result = sortExpenses(mockExpenses, { field: 'amount', direction: 'desc' });
      expect(result.map(e => e.amount)).toEqual([120.0, 15.0, 5.5]);
    });

    it('should not mutate the original array', () => {
      const originalCopy = [...mockExpenses];
      sortExpenses(mockExpenses, { field: 'amount', direction: 'asc' });
      expect(mockExpenses).toEqual(originalCopy);
    });
  });

  describe('toggleSortDirection', () => {
    it('should toggle asc to desc', () => {
      expect(toggleSortDirection('asc')).toBe('desc');
    });

    it('should toggle desc to asc', () => {
      expect(toggleSortDirection('desc')).toBe('asc');
    });
  });
});
