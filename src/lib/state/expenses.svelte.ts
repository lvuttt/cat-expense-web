import type { Expense, ExpenseFormData } from '../types';
import type { IStorageService } from '../services/storageService';
import {
  createExpense,
  duplicateExpenseItem,
  getTopSpendingCategories,
  calculateTotal,
} from '../utils/expenseUtils';

export const createExpenses = (storage: IStorageService<Expense[]>) => {
  let expenses = $state<Expense[]>([]);

  // Load initial value
  expenses = storage.load() ?? [];

  // Save changes to storage whenever expenses change
  $effect(() => {
    storage.save(expenses);
  });

  const topCategories = $derived.by(() => getTopSpendingCategories(expenses));
  const totalAmount = $derived.by(() => calculateTotal(expenses));

  function addExpense(formData: ExpenseFormData): void {
    const newExpense = createExpense(formData);
    expenses = [...expenses, newExpense];
  }

  function updateExpense(id: string, formData: ExpenseFormData): void {
    expenses = expenses.map((expense) =>
      expense.id === id
        ? {
            ...expense,
            name: formData.name.trim(),
            category: formData.category,
            amount: Number(formData.amount.toFixed(2)),
          }
        : expense
    );
  }

  function deleteExpenses(ids: Set<string>): void {
    expenses = expenses.filter((expense) => !ids.has(expense.id));
  }

  function duplicateExpense(id: string): void {
    const target = expenses.find((expense) => expense.id === id);
    if (!target) return;
    expenses = [...expenses, duplicateExpenseItem(target)];
  }

  return {
    get expenses() { return expenses; },
    set expenses(val) { expenses = val; },
    get topCategories() { return topCategories; },
    get totalAmount() { return totalAmount; },
    addExpense,
    updateExpense,
    deleteExpenses,
    duplicateExpense,
  };
}
