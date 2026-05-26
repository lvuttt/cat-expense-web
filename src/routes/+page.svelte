<script lang="ts">
  import type { Expense, ExpenseFormData, DialogMode } from '$lib/types/models';
  import { STORAGE_KEY } from '$lib/constants/app';
  import { LocalStorageService } from '$lib/services/storageService';
  import { createExpenses } from '$lib/state/expenses.svelte';
  import { createSelection } from '$lib/state/selection.svelte';
  import { createSort } from '$lib/state/sort.svelte';
  import { sortExpenses } from '$lib/utils/sortUtils';
  import { exportExpensesToCsv } from '$lib/utils/csvUtils';
  import Header from '$lib/components/Header.svelte';
  import ActionBar from '$lib/components/ActionBar.svelte';
  import SpendingChart from '$lib/components/SpendingChart.svelte';
  import ExpenseTable from '$lib/components/ExpenseTable.svelte';
  import ExpenseDialog from '$lib/components/ExpenseDialog.svelte';

  const expenseStorage = new LocalStorageService<Expense[]>(STORAGE_KEY);

  const expensesState = createExpenses(expenseStorage);
  const sortState = createSort('name');

  const sortedExpenses = $derived(
    sortExpenses(expensesState.expenses, sortState.sortConfig),
  );
  const expenseIds = $derived(sortedExpenses.map((e) => e.id));

  const selectionState = createSelection(() => expenseIds);

  let isDialogOpen = $state(false);
  let dialogMode = $state<DialogMode>({ type: 'add' });

  const handleAddClick = () => {
    dialogMode = { type: 'add' };
    isDialogOpen = true;
  };

  const handleEditClick = (expense: Expense) => {
    dialogMode = { type: 'edit', expense };
    isDialogOpen = true;
  };

  const handleDialogClose = () => {
    isDialogOpen = false;
  };

  const handleDialogSubmit = (formData: ExpenseFormData) => {
    if (dialogMode.type === 'edit') {
      expensesState.updateExpense(dialogMode.expense.id, formData);
    } else {
      expensesState.addExpense(formData);
    }
    isDialogOpen = false;
  };

  const handleDeleteClick = () => {
    if (selectionState.selectedCount === 0) return;

    const count = selectionState.selectedCount;
    const message =
      count === 1
        ? 'Are you sure you want to delete this expense?'
        : `Are you sure you want to delete these ${count} expenses?`;

    if (!window.confirm(message)) return;

    const idsToDelete = new Set(
      expenseIds.filter((id) => selectionState.isSelected(id)),
    );

    expensesState.deleteExpenses(idsToDelete);
    selectionState.clearSelection();
  };

  const handleExportClick = () => {
    exportExpensesToCsv(sortedExpenses);
  };
</script>

<div class="app">
  <div class="app__container">
    <Header />

    <main class="app__main" id="main-content">
      <ActionBar
        onAddClick={handleAddClick}
        onDeleteClick={handleDeleteClick}
        onExportClick={handleExportClick}
        selectedCount={selectionState.selectedCount}
        isDeleteDisabled={selectionState.selectedCount === 0}
        isExportDisabled={expensesState.expenses.length === 0}
      />

      <SpendingChart
        expenses={expensesState.expenses}
        topCategories={expensesState.topCategories}
        categoryTotals={expensesState.categoryTotals}
      />

      <ExpenseTable
        expenses={sortedExpenses}
        topCategories={expensesState.topCategories}
        sortConfig={sortState.sortConfig}
        onSort={sortState.handleSort}
        isAllSelected={selectionState.isAllSelected}
        isSomeSelected={selectionState.isSomeSelected}
        onToggleAll={selectionState.toggleAll}
        isSelected={selectionState.isSelected}
        onToggleSelect={selectionState.toggle}
        onEdit={handleEditClick}
        onDuplicate={expensesState.duplicateExpense}
      />
    </main>

    <footer class="app__footer">
      Made with <span class="app__footer-heart" aria-label="love">❤️</span> for cats
      everywhere
    </footer>
  </div>

  <ExpenseDialog
    isOpen={isDialogOpen}
    mode={dialogMode}
    onClose={handleDialogClose}
    onSubmit={handleDialogSubmit}
  />
</div>
