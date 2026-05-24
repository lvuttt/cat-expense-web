import { describe, it, expect } from 'vitest';
import type { Expense, Category } from '../types';
import {
  calculateTotal,
  sumByCategory,
  getTopSpendingCategories,
  isInTopCategory,
  createExpense,
  duplicateExpenseItem,
  getNextCopyName,
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

  describe('getNextCopyName', () => {
    it('should append (Copy) to a plain name', () => {
      expect(getNextCopyName('Feather Toy')).toBe('Feather Toy (Copy)');
    });

    it('should increment (Copy) to (Copy 2)', () => {
      expect(getNextCopyName('Feather Toy (Copy)')).toBe('Feather Toy (Copy 2)');
    });

    it('should increment (Copy 2) to (Copy 3)', () => {
      expect(getNextCopyName('Feather Toy (Copy 2)')).toBe('Feather Toy (Copy 3)');
    });

    it('should handle high copy numbers correctly', () => {
      expect(getNextCopyName('Item (Copy 99)')).toBe('Item (Copy 100)');
    });

    it('should not double-append if name already ends with spaces before (Copy)', () => {
      expect(getNextCopyName('Item  (Copy)')).toBe('Item (Copy 2)');
    });
  });

  describe('duplicateExpenseItem', () => {
    it('should create a copy of the expense with a new ID, current timestamp, and (Copy) appended to its name', () => {
      const original: Expense = {
        id: 'old-id',
        name: 'Feather Toy',
        category: 'Accessory',
        amount: 8.5,
        createdAt: '2026-05-23T12:00:00Z',
      };
      const copy = duplicateExpenseItem(original);
      expect(copy.id).not.toBe(original.id);
      expect(copy.name).toBe('Feather Toy (Copy)');
      expect(copy.category).toBe(original.category);
      expect(copy.amount).toBe(original.amount);
      expect(copy.createdAt).not.toBe(original.createdAt);
    });

    it('should produce (Copy 2) when duplicating an item already named with (Copy)', () => {
      const original: Expense = {
        id: 'copy-id',
        name: 'Feather Toy (Copy)',
        category: 'Accessory',
        amount: 8.5,
        createdAt: '2026-05-23T12:00:00Z',
      };
      const copy = duplicateExpenseItem(original);
      expect(copy.name).toBe('Feather Toy (Copy 2)');
    });
  });
});
