import type { Expense } from '$lib/types/models';

export const sampleExpense: Expense = {
  id: 'exp-1',
  name: 'Premium kibble',
  category: 'Food',
  amount: 24.99,
  createdAt: '2026-05-23T12:00:00.000Z',
};

export const furnitureExpense: Expense = {
  id: 'exp-2',
  name: 'Cat tree',
  category: 'Furniture',
  amount: 150,
  createdAt: '2026-05-24T12:00:00.000Z',
};
