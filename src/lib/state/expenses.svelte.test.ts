import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ExpensesTestHost from '../test/ExpensesTestHost.svelte';
import { createExpenses } from './expenses.svelte';
import type { IStorageService } from '../services/storageService';
import type { Expense } from '../types/models';

const mockStorage = (
  initialData: Expense[] = [],
): IStorageService<Expense[]> => {
  let data = initialData;
  return {
    load: () => data,
    save: (newData) => {
      data = newData;
    },
    clear: () => {
      data = [];
    },
  };
};

describe('expenses state manager', () => {
  it('loads initial data from storage', () => {
    const initial = [
      {
        id: '1',
        name: 'Kibble',
        category: 'Food' as const,
        amount: 20,
        createdAt: '2026-05-26T00:00:00.000Z',
      },
    ];
    const storage = mockStorage(initial);

    render(ExpensesTestHost, {
      props: {
        storage,
        testFn: (store: ReturnType<typeof createExpenses>) => {
          expect(store.expenses).toEqual(initial);
          expect(store.totalAmount).toBe(20);
          expect(store.categoryTotals.get('Food')).toBe(20);
        },
      },
    });
  });

  it('adds an expense', () => {
    const storage = mockStorage([]);

    render(ExpensesTestHost, {
      props: {
        storage,
        testFn: (store: ReturnType<typeof createExpenses>) => {
          store.addExpense({
            name: 'Toys',
            category: 'Accessory',
            amount: 15.5,
          });

          expect(store.expenses).toHaveLength(1);
          expect(store.expenses[0].name).toBe('Toys');
          expect(store.expenses[0].amount).toBe(15.5);
          expect(store.totalAmount).toBe(15.5);
        },
      },
    });
  });

  it('updates an expense', () => {
    const initial = [
      {
        id: '1',
        name: 'Kibble',
        category: 'Food' as const,
        amount: 20,
        createdAt: '2026-05-26T00:00:00.000Z',
      },
    ];
    const storage = mockStorage(initial);

    render(ExpensesTestHost, {
      props: {
        storage,
        testFn: (store: ReturnType<typeof createExpenses>) => {
          store.updateExpense('1', {
            name: 'Super Kibble',
            category: 'Food',
            amount: 25.5,
          });

          expect(store.expenses[0].name).toBe('Super Kibble');
          expect(store.expenses[0].amount).toBe(25.5);
          expect(store.totalAmount).toBe(25.5);
        },
      },
    });
  });

  it('deletes expenses', () => {
    const initial = [
      {
        id: '1',
        name: 'Kibble',
        category: 'Food' as const,
        amount: 20,
        createdAt: '2026-05-26T00:00:00.000Z',
      },
      {
        id: '2',
        name: 'Catnip',
        category: 'Food' as const,
        amount: 5,
        createdAt: '2026-05-26T00:00:00.000Z',
      },
    ];
    const storage = mockStorage(initial);

    render(ExpensesTestHost, {
      props: {
        storage,
        testFn: (store: ReturnType<typeof createExpenses>) => {
          store.deleteExpenses(new Set(['1']));

          expect(store.expenses).toHaveLength(1);
          expect(store.expenses[0].id).toBe('2');
          expect(store.totalAmount).toBe(5);
        },
      },
    });
  });

  it('duplicates an expense', () => {
    const initial = [
      {
        id: '1',
        name: 'Kibble',
        category: 'Food' as const,
        amount: 20,
        createdAt: '2026-05-26T00:00:00.000Z',
      },
    ];
    const storage = mockStorage(initial);

    render(ExpensesTestHost, {
      props: {
        storage,
        testFn: (store: ReturnType<typeof createExpenses>) => {
          store.duplicateExpense('1');

          expect(store.expenses).toHaveLength(2);
          expect(store.expenses[1].name).toBe('Kibble');
          expect(store.expenses[1].amount).toBe(20);
          expect(store.totalAmount).toBe(40);
        },
      },
    });
  });
});
