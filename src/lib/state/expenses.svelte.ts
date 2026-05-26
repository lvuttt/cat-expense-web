import type { Expense, ExpenseFormData } from '../types/models';
import type { IStorageService } from '../services/storageService';
import {
  createExpense,
  duplicateExpenseItem,
  sumByCategory,
  calculateTotal,
  getTopSpendingCategories,
} from '../utils/expenseUtils';

export const createExpenses = (storage: IStorageService<Expense[]>) => {
  let expenses = $state<Expense[]>([]);

  // Load initial value
  expenses = storage.load() ?? [];

  // Save changes to storage whenever expenses change
  $effect(() => {
    storage.save(expenses);
  });

  const categoryTotals = $derived(sumByCategory(expenses));
  const totalAmount = $derived(calculateTotal(expenses));
  const topCategories = $derived(getTopSpendingCategories(expenses));

  function addExpense(formData: ExpenseFormData): void {
    const newExpense = createExpense(formData);
    expenses = [...expenses, newExpense];
  }

  function updateExpense(id: string, formData: ExpenseFormData): void {
    const newAmount = Number(formData.amount.toFixed(2));
    expenses = expenses.map((expense) =>
      expense.id === id
        ? {
            ...expense,
            name: formData.name.trim(),
            category: formData.category,
            amount: newAmount,
          }
        : expense,
    );
  }

  function deleteExpenses(ids: Set<string>): void {
    expenses = expenses.filter((expense) => !ids.has(expense.id));
  }

  function duplicateExpense(id: string): void {
    const target = expenses.find((expense) => expense.id === id);
    if (!target) return;
    const newExp = duplicateExpenseItem(target);
    expenses = [...expenses, newExp];
  }

  return {
    get expenses() {
      return expenses;
    },
    set expenses(val) {
      expenses = val;
    },
    get topCategories() {
      return topCategories;
    },
    get totalAmount() {
      return totalAmount;
    },
    get categoryTotals() {
      return categoryTotals;
    },
    addExpense,
    updateExpense,
    deleteExpenses,
    duplicateExpense,
  };
};
