/**
 * useExpenses — Central expense state management hook.
 *
 * Single Responsibility: orchestrates state transitions.
 * Delegates business logic to utility functions and storage to the injected service.
 * Dependency Inversion: accepts IStorageService, not localStorage directly.
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Expense, ExpenseFormData, Category } from '../types';
import type { IStorageService } from '../services/storageService';
import {
  createExpense,
  duplicateExpenseItem,
  getTopSpendingCategories,
  calculateTotal,
} from '../utils/expenseUtils';

interface UseExpensesReturn {
  readonly expenses: Expense[];
  readonly topCategories: Set<Category>;
  readonly totalAmount: number;
  readonly addExpense: (formData: ExpenseFormData) => void;
  readonly updateExpense: (id: string, formData: ExpenseFormData) => void;
  readonly deleteExpenses: (ids: Set<string>) => void;
  readonly duplicateExpense: (id: string) => void;
}

export function useExpenses(
  storage: IStorageService<Expense[]>,
): UseExpensesReturn {
  const [expenses, setExpenses] = useState<Expense[]>(
    () => storage.load() ?? [],
  );

  // Persist expenses to storage on every change
  useEffect(() => {
    storage.save(expenses);
  }, [expenses, storage]);

  const addExpense = useCallback((formData: ExpenseFormData) => {
    const newExpense = createExpense(formData);
    setExpenses((prev) => [...prev, newExpense]);
  }, []);

  const updateExpense = useCallback(
    (id: string, formData: ExpenseFormData) => {
      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === id
            ? {
                ...expense,
                name: formData.name.trim(),
                category: formData.category,
                amount: Number(formData.amount.toFixed(2)),
              }
            : expense,
        ),
      );
    },
    [],
  );

  const deleteExpenses = useCallback((ids: Set<string>) => {
    setExpenses((prev) => prev.filter((expense) => !ids.has(expense.id)));
  }, []);

  const duplicateExpense = useCallback((id: string) => {
    setExpenses((prev) => {
      const target = prev.find((expense) => expense.id === id);
      if (!target) return prev;
      return [...prev, duplicateExpenseItem(target)];
    });
  }, []);

  // Derived state — computed from expenses, not stored separately
  const topCategories = useMemo(
    () => getTopSpendingCategories(expenses),
    [expenses],
  );

  const totalAmount = useMemo(() => calculateTotal(expenses), [expenses]);

  return {
    expenses,
    topCategories,
    totalAmount,
    addExpense,
    updateExpense,
    deleteExpenses,
    duplicateExpense,
  };
}
