/**
 * App — Top-level orchestrator component.
 *
 * SRP: composes child components and manages dialog state.
 * Business logic lives in hooks (useExpenses, useSelection, useSort).
 * No direct DOM manipulation, no direct localStorage access, no API calls.
 */

import { useState, useCallback, useMemo } from 'react';
import type { Expense, ExpenseFormData, DialogMode } from './types';
import { STORAGE_KEY } from './constants';
import { LocalStorageService } from './services/storageService';
import { useExpenses } from './hooks/useExpenses';
import { useSelection } from './hooks/useSelection';
import { useSort } from './hooks/useSort';
import { sortExpenses } from './utils/sortUtils';
import { exportExpensesToCsv } from './utils/csvUtils';
import { Header } from './components/Header/Header';
import { ActionBar } from './components/ActionBar/ActionBar';
import { SpendingChart } from './components/SpendingChart/SpendingChart';
import { ExpenseTable } from './components/ExpenseTable/ExpenseTable';
import { ExpenseDialog } from './components/ExpenseDialog/ExpenseDialog';
import './App.css';

/** Storage service instance — created once, passed to hook via DIP. */
const expenseStorage = new LocalStorageService<Expense[]>(STORAGE_KEY);

function App() {
  // --- State management via hooks ---
  const {
    expenses,
    topCategories,
    addExpense,
    updateExpense,
    deleteExpenses,
    duplicateExpense,
  } = useExpenses(expenseStorage);

  const { sortConfig, handleSort } = useSort('name');

  const sortedExpenses = useMemo(
    () => sortExpenses(expenses, sortConfig),
    [expenses, sortConfig],
  );

  const expenseIds = useMemo(
    () => sortedExpenses.map((e) => e.id),
    [sortedExpenses],
  );

  const {
    selectedCount,
    isAllSelected,
    isSomeSelected,
    isSelected,
    toggle: toggleSelect,
    toggleAll,
    clearSelection,
  } = useSelection(expenseIds);

  // --- Dialog state ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>({ type: 'add' });

  const handleAddClick = useCallback(() => {
    setDialogMode({ type: 'add' });
    setIsDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((expense: Expense) => {
    setDialogMode({ type: 'edit', expense });
    setIsDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
  }, []);

  const handleDialogSubmit = useCallback(
    (formData: ExpenseFormData) => {
      if (dialogMode.type === 'edit') {
        updateExpense(dialogMode.expense.id, formData);
      } else {
        addExpense(formData);
      }
      setIsDialogOpen(false);
    },
    [dialogMode, addExpense, updateExpense],
  );

  const handleDeleteClick = useCallback(() => {
    if (selectedCount === 0) return;

    // Build set of selected IDs that still exist
    const idsToDelete = new Set(
      expenseIds.filter((id) => isSelected(id)),
    );

    deleteExpenses(idsToDelete);
    clearSelection();
  }, [selectedCount, expenseIds, isSelected, deleteExpenses, clearSelection]);

  const handleExportClick = useCallback(() => {
    exportExpensesToCsv(sortedExpenses);
  }, [sortedExpenses]);

  return (
    <div className="app">
      <div className="app__container">
        <Header />

        <main className="app__main" id="main-content">

          <ActionBar
            onAddClick={handleAddClick}
            onDeleteClick={handleDeleteClick}
            onExportClick={handleExportClick}
            selectedCount={selectedCount}
            isDeleteDisabled={selectedCount === 0}
            isExportDisabled={expenses.length === 0}
          />

          <SpendingChart expenses={expenses} topCategories={topCategories} />

          <ExpenseTable
            expenses={sortedExpenses}
            topCategories={topCategories}
            sortConfig={sortConfig}
            onSort={handleSort}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
            onToggleAll={toggleAll}
            isSelected={isSelected}
            onToggleSelect={toggleSelect}
            onEdit={handleEditClick}
            onDuplicate={duplicateExpense}
          />
        </main>

        <footer className="app__footer">
          Made with <span className="app__footer-heart" aria-label="love">❤️</span> for cats everywhere
        </footer>
      </div>

      <ExpenseDialog
        isOpen={isDialogOpen}
        mode={dialogMode}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
      />
    </div>
  );
}

export default App;
