<script lang="ts">
  import type {
    Expense,
    Category,
    SortField,
    SortConfig,
  } from '$lib/types/models';
  import { isInTopCategory } from '$lib/utils/expenseUtils';
  import { createVirtualList } from '$lib/state/virtualList.svelte';
  import ExpenseRow from '$lib/components/ExpenseRow.svelte';

  interface Props {
    expenses: Expense[];
    topCategories: Set<Category>;
    sortConfig: SortConfig;
    onSort: (field: SortField) => void;
    isAllSelected: boolean;
    isSomeSelected: boolean;
    onToggleAll: () => void;
    isSelected: (id: string) => boolean;
    onToggleSelect: (id: string) => void;
    onEdit: (expense: Expense) => void;
    onDuplicate: (id: string) => void;
  }

  let {
    expenses,
    topCategories,
    sortConfig,
    onSort,
    isAllSelected,
    isSomeSelected,
    onToggleAll,
    isSelected,
    onToggleSelect,
    onEdit,
    onDuplicate,
  }: Props = $props();

  const ROW_HEIGHT = 48;

  const SORTABLE_COLUMNS: Array<{
    field: SortField;
    label: string;
    className: string;
  }> = [
    { field: 'name', label: 'Item Name', className: '' },
    { field: 'category', label: 'Category', className: '' },
    {
      field: 'amount',
      label: 'Amount',
      className: 'expense-table__header-cell--amount',
    },
  ];

  let hasExpenses = $derived(expenses.length > 0);

  let containerEl = $state<HTMLDivElement | null>(null);
  let virtualList = createVirtualList(() => expenses, ROW_HEIGHT);

  $effect(() => {
    virtualList.container = containerEl;
  });

  let checkboxEl = $state<HTMLInputElement | null>(null);

  $effect(() => {
    if (checkboxEl) {
      checkboxEl.indeterminate = isSomeSelected && !isAllSelected;
    }
  });
</script>

<div
  class="expense-table"
  id="expense-table"
  role="table"
  aria-label="Expense list"
>
  <!-- Table Header -->
  <div class="expense-table__header" role="row">
    <div
      class="expense-table__header-cell expense-table__header-cell--checkbox"
      role="columnheader"
    >
      <input
        bind:this={checkboxEl}
        class="expense-table__checkbox"
        type="checkbox"
        checked={isAllSelected}
        onchange={onToggleAll}
        aria-label={isAllSelected
          ? 'Deselect all expenses'
          : 'Select all expenses'}
        id="select-all-checkbox"
        disabled={!hasExpenses}
      />
    </div>

    {#each SORTABLE_COLUMNS as { field, label, className } (field)}
      {@const isSorted = sortConfig.field === field}
      <button
        class="expense-table__header-cell expense-table__header-cell--sortable {isSorted
          ? 'expense-table__header-cell--sorted'
          : ''} {className}"
        type="button"
        role="columnheader"
        aria-sort={isSorted
          ? sortConfig.direction === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'}
        onclick={() => onSort(field)}
      >
        {label}
        {#if isSorted}
          <span
            class="expense-table__sort-icon {sortConfig.direction === 'desc'
              ? 'expense-table__sort-icon--desc'
              : ''}"
            aria-hidden="true"
          >
            ▲
          </span>
        {/if}
      </button>
    {/each}

    <div
      class="expense-table__header-cell expense-table__header-cell--actions"
      role="columnheader"
    >
      Actions
    </div>
  </div>

  <!-- Table Body -->
  <div class="expense-table__body" role="rowgroup" bind:this={containerEl}>
    <div
      class="expense-table__inner"
      style="position: relative; height: {hasExpenses
        ? `${virtualList.totalHeight}px`
        : 'auto'};"
    >
      {#if hasExpenses}
        {#each virtualList.visibleItems as { item: expense, originalIndex } (expense.id)}
          <div
            class="expense-table__row-wrapper"
            style="top: {originalIndex * ROW_HEIGHT}px;"
          >
            <ExpenseRow
              {expense}
              isHighlighted={isInTopCategory(expense, topCategories)}
              isSelected={isSelected(expense.id)}
              {onToggleSelect}
              {onEdit}
              {onDuplicate}
            />
          </div>
        {/each}
      {:else}
        <div class="expense-table__empty" role="row">
          <span class="expense-table__empty-icon" aria-hidden="true"> 😺 </span>
          <p class="expense-table__empty-title">No expenses yet</p>
          <p class="expense-table__empty-text">
            Click "Add Expense" to start tracking your cat's spending!
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  /*
   * ExpenseTable — BEM Block: .expense-table
   */

  .expense-table {
    background: var(--color-bg-glass);
    border: 1px solid var(--color-bg-glass-border);
    border-radius: var(--radius-xl);
    overflow: hidden;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    animation: slideUp var(--transition-slow) ease;
    animation-delay: 300ms;
    animation-fill-mode: both;
  }

  /* Header row */
  .expense-table__header {
    display: grid;
    grid-template-columns:
      var(--col-checkbox) 1fr var(--col-category) var(--col-amount)
      var(--col-actions);
    column-gap: var(--space-md);
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid var(--color-bg-glass-border);
  }

  .expense-table__header-cell {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    user-select: none;
  }

  .expense-table__header-cell--checkbox {
    justify-content: center;
  }

  .expense-table__header-cell--amount {
    justify-content: flex-start;
  }

  .expense-table__header-cell--actions {
    justify-content: flex-start;
  }

  /* Sortable header styling */
  .expense-table__header-cell--sortable {
    background: transparent;
    border: none;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
    text-transform: inherit;
    letter-spacing: inherit;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    cursor: pointer;
    transition:
      color var(--transition-fast),
      background var(--transition-fast);
    border-radius: var(--radius-xs);
    padding: var(--space-2xs) var(--space-xs);
    margin: calc(-1 * var(--space-2xs)) calc(-1 * var(--space-xs));
  }

  .expense-table__header-cell--sortable:hover {
    color: var(--color-text-primary);
    background: rgba(255, 255, 255, 0.03);
  }

  .expense-table__header-cell--sorted {
    color: var(--color-accent-start);
  }

  /* Sort icon */
  .expense-table__sort-icon {
    font-size: 10px;
    transition: transform var(--transition-fast);
    display: inline-block;
  }

  .expense-table__sort-icon--desc {
    transform: rotate(180deg);
  }

  /* Checkbox in header */
  .expense-table__checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: var(--checkbox-size);
    height: var(--checkbox-size);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-xs);
    background: var(--color-bg-secondary);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition:
      background-color var(--transition-fast),
      border-color var(--transition-fast);
  }

  .expense-table__checkbox:checked {
    background: var(--color-accent-start);
    border-color: var(--color-accent-start);
  }

  .expense-table__checkbox:checked::after {
    content: '';
    position: absolute;
    width: calc(var(--checkbox-size) * 0.2);
    height: calc(var(--checkbox-size) * 0.4);
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    top: calc(var(--checkbox-size) * 0.1);
    left: calc(var(--checkbox-size) * 0.3);
  }

  .expense-table__checkbox:indeterminate {
    background: var(--color-accent-start);
    border-color: var(--color-accent-start);
  }

  .expense-table__checkbox:indeterminate::after {
    content: '';
    position: absolute;
    width: calc((var(--checkbox-size) - 4px) * 0.5);
    height: 2px;
    background: white;
    top: calc((var(--checkbox-size) - 6px) / 2);
    left: calc((var(--checkbox-size) - 4px) * 0.25);
  }

  /* Body */
  .expense-table__body {
    padding: var(--space-xs) 0;
    max-height: 400px;
    overflow-y: auto;
    position: relative;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  }

  /* Row wrapper for absolute positioning */
  .expense-table__row-wrapper {
    position: absolute;
    left: 0;
    right: 0;
    height: 48px;
  }

  /* Webkit scrollbar styling */
  .expense-table__body::-webkit-scrollbar {
    width: 6px;
  }

  .expense-table__body::-webkit-scrollbar-track {
    background: transparent;
  }

  .expense-table__body::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-full);
  }

  .expense-table__body::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Divider between rows */
  .expense-table__inner > *:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  }

  /* Empty state */
  .expense-table__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-3xl) var(--space-md);
    text-align: center;
  }

  .expense-table__empty-icon {
    font-size: 4rem;
    margin-bottom: var(--space-md);
    opacity: 0.6;
    animation: float 3s ease-in-out infinite;
  }

  .expense-table__empty-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin-bottom: var(--space-xs);
  }

  .expense-table__empty-text {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    max-width: 300px;
  }

  /* Mid-range tablet (500px – 767px): compress grid columns but keep header visible */
  @media (min-width: 500px) and (max-width: 767px) {
    .expense-table {
      border-radius: var(--radius-lg);
    }

    .expense-table__header {
      grid-template-columns: 36px 1fr 100px 90px 80px;
      column-gap: var(--space-sm);
      padding: var(--space-xs) var(--space-sm);
    }
  }

  /* Small mobile (< 500px): show table with 4 columns (checkbox, name, category, amount) */
  @media (max-width: 499px) {
    .expense-table {
      border-radius: var(--radius-lg);
    }

    .expense-table__header {
      display: grid;
      grid-template-columns: 36px 1fr 1fr 75px;
      column-gap: var(--space-xs);
      padding: var(--space-xs) var(--space-sm);
    }

    .expense-table__header-cell--actions {
      display: none;
    }

    .expense-table__body {
      padding: var(--space-xs) 0;
    }

    .expense-table__inner > *:not(:last-child) {
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }
  }
</style>
