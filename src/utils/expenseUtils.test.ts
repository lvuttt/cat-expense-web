import { describe, it, expect, vi } from 'vitest';
import type { Expense, Category } from '../types';
import {
  calculateTotal,
  sumByCategory,
  getTopSpendingCategories,
  isInTopCategory,
  createExpense,
  duplicateExpenseItem,
  generateId,
} from './expenseUtils';

describe('expenseUtils', () => {
  describe('calculateTotal', () => {
    it('should return 0 for an empty list of expenses', () => {
      expect(calculateTotal([])).toBe(0);
    });

    it('should sum amounts using cents to avoid floating point drift', () => {
      const expenses: Expense[] = [
        { id: '1', name: 'a', category: 'Food', amount: 0.1, createdAt: '' },
        { id: '2', name: 'b', category: 'Food', amount: 0.2, createdAt: '' },
      ];
      expect(calculateTotal(expenses)).toBe(0.3); // 0.1 + 0.2 is exactly 0.3
    });

    it('should handle large amounts correctly', () => {
      const expenses: Expense[] = [
        { id: '1', name: 'a', category: 'Furniture', amount: 999999.99, createdAt: '' },
        { id: '2', name: 'b', category: 'Furniture', amount: 0.01, createdAt: '' },
      ];
      expect(calculateTotal(expenses)).toBe(1000000.0);
    });
  });

  describe('sumByCategory', () => {
    it('should sum and group expenses by category accurately', () => {
      const expenses: Expense[] = [
        { id: '1', name: 'a', category: 'Food', amount: 10.5, createdAt: '' },
        { id: '2', name: 'b', category: 'Food', amount: 20.25, createdAt: '' },
        { id: '3', name: 'c', category: 'Accessory', amount: 5.0, createdAt: '' },
      ];
      const sums = sumByCategory(expenses);
      expect(sums.get('Food')).toBe(30.75);
      expect(sums.get('Accessory')).toBe(5.0);
      expect(sums.get('Furniture')).toBeUndefined();
    });
  });

  describe('getTopSpendingCategories', () => {
    it('should return an empty set if there are no expenses', () => {
      const expenses: Expense[] = [];
      const result = getTopSpendingCategories(expenses);
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });

    it('should return the single category with the highest total spending', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          name: 'Premium Tuna',
          category: 'Food',
          amount: 50.0,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Scratching Post',
          category: 'Furniture',
          amount: 30.0,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Catnip Toy',
          category: 'Accessory',
          amount: 15.0,
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Dry Kibble',
          category: 'Food',
          amount: 20.0,
          createdAt: new Date().toISOString(),
        },
      ];

      // Food total: $70
      // Furniture total: $30
      // Accessory total: $15
      const result = getTopSpendingCategories(expenses);
      expect(result.size).toBe(1);
      expect(result.has('Food')).toBe(true);
      expect(result.has('Furniture')).toBe(false);
      expect(result.has('Accessory')).toBe(false);
    });

    it('should return all categories tied for the highest total spending', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          name: 'Cat Tree',
          category: 'Furniture',
          amount: 100.0,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Laser Pointer',
          category: 'Accessory',
          amount: 40.0,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Feather Wand',
          category: 'Accessory',
          amount: 60.0,
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Wet Canned Food',
          category: 'Food',
          amount: 50.0,
          createdAt: new Date().toISOString(),
        },
      ];

      // Furniture total: $100
      // Accessory total: $100 (40 + 60)
      // Food total: $50
      const result = getTopSpendingCategories(expenses);
      expect(result.size).toBe(2);
      expect(result.has('Furniture')).toBe(true);
      expect(result.has('Accessory')).toBe(true);
      expect(result.has('Food')).toBe(false);
    });
  });

  describe('isInTopCategory', () => {
    it('should return true if the expense category is in the top set, false otherwise', () => {
      const topSet = new Set<Category>(['Food', 'Furniture']);

      const expenseInTop: Expense = {
        id: '1',
        name: 'Tuna',
        category: 'Food',
        amount: 10.0,
        createdAt: new Date().toISOString(),
      };

      const expenseNotInTop: Expense = {
        id: '2',
        name: 'Collar',
        category: 'Accessory',
        amount: 5.0,
        createdAt: new Date().toISOString(),
      };

      expect(isInTopCategory(expenseInTop, topSet)).toBe(true);
      expect(isInTopCategory(expenseNotInTop, topSet)).toBe(false);
    });
  });

  describe('createExpense', () => {
    it('should create an expense object with assigned ID, trimmed name, parsed amount, and current ISO timestamp', () => {
      const form = { name: '  Premium Kibble  ', category: 'Food' as const, amount: 25.999 };
      const expense = createExpense(form);
      expect(expense.id).toBeDefined();
      expect(expense.id.length).toBeGreaterThan(10);
      expect(expense.name).toBe('Premium Kibble');
      expect(expense.category).toBe('Food');
      expect(expense.amount).toBe(26.0); // 25.999 rounded to 2 decimals
      expect(expense.createdAt).toBeDefined();
      expect(() => new Date(expense.createdAt)).not.toThrow();
    });
  });

  describe('duplicateExpenseItem', () => {
    it('should create a copy of the expense with a new ID, current timestamp, and the identical name', () => {
      const original: Expense = {
        id: 'old-id',
        name: 'Feather Toy',
        category: 'Accessory',
        amount: 8.5,
        createdAt: '2026-05-23T12:00:00Z',
      };
      const copy = duplicateExpenseItem(original);
      expect(copy.id).not.toBe(original.id);
      expect(copy.name).toBe('Feather Toy');
      expect(copy.category).toBe(original.category);
      expect(copy.amount).toBe(original.amount);
      expect(copy.createdAt).not.toBe(original.createdAt);
    });
  });

  describe('generateId', () => {
    it('should generate a valid UUID shape even if crypto.randomUUID is not available', () => {
      // Temporarily mock crypto.randomUUID to undefined
      const originalUUID = crypto.randomUUID;
      Object.defineProperty(crypto, 'randomUUID', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      try {
        const id = generateId();
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      } finally {
        // Restore
        Object.defineProperty(crypto, 'randomUUID', {
          value: originalUUID,
          writable: true,
          configurable: true,
        });
      }
    });

    it('should use crypto.randomUUID when available', () => {
      const originalUUID = crypto.randomUUID;
      if (typeof originalUUID === 'function') {
        const spy = vi.spyOn(crypto, 'randomUUID');
        const id = generateId();
        expect(spy).toHaveBeenCalled();
        expect(id).toBeDefined();
        spy.mockRestore();
      }
    });
  });
});
