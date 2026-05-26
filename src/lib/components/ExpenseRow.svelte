<script lang="ts">
  import type { Expense } from '$lib/types/models';
  import { CATEGORY_CONFIG } from '$lib/constants/app';
  import { formatCurrency } from '$lib/utils/formatUtils';

  interface Props {
    expense: Expense;
    isHighlighted: boolean;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    onEdit: (expense: Expense) => void;
    onDuplicate: (id: string) => void;
  }

  let {
    expense,
    isHighlighted,
    isSelected,
    onToggleSelect,
    onEdit,
    onDuplicate,
  }: Props = $props();

  let categoryMeta = $derived(CATEGORY_CONFIG[expense.category]);

  let nameRef = $state<HTMLSpanElement | null>(null);
  let showTooltip = $state(false);

  function handleMouseEnter() {
    if (nameRef) {
      const isOverflowing = nameRef.scrollWidth > nameRef.clientWidth;
      showTooltip = isOverflowing;
    }
  }

  function handleMouseLeave() {
    showTooltip = false;
  }

  let rowClasses = $derived(
    [
      'expense-row',
      isHighlighted ? 'expense-row--highlighted' : '',
      isSelected ? 'expense-row--selected' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  let badgeClass = $derived(
    `expense-row__category-badge expense-row__category-badge--${categoryMeta.cssClass}`,
  );

  function handleRowClick() {
    onEdit(expense);
  }
</script>

<div
  class={rowClasses}
  role="row"
  aria-selected={isSelected}
  data-expense-id={expense.id}
  onclick={handleRowClick}
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick();
    }
  }}
  tabindex="0"
>
  <div class="expense-row__cell expense-row__cell--checkbox" role="cell">
    <input
      class="expense-row__checkbox"
      type="checkbox"
      checked={isSelected}
      onclick={(e) => e.stopPropagation()}
      onchange={() => onToggleSelect(expense.id)}
      aria-label={`Select ${expense.name}`}
      id={`select-${expense.id}`}
    />
  </div>

  <div
    class="expense-row__cell expense-row__cell--name"
    role="cell"
    data-tooltip={showTooltip ? expense.name : undefined}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
    tabindex="-1"
  >
    <span bind:this={nameRef} class="expense-row__name-text"
      >{expense.name}</span
    >
  </div>

  <div class="expense-row__cell expense-row__cell--category" role="cell">
    <span class={badgeClass}>
      <span aria-hidden="true">{categoryMeta.emoji}</span>
      {categoryMeta.label}
    </span>
  </div>

  <div class="expense-row__cell expense-row__cell--amount" role="cell">
    {formatCurrency(expense.amount)}
  </div>

  <div class="expense-row__cell expense-row__cell--actions" role="cell">
    <button
      class="expense-row__action-button expense-row__action-button--edit"
      onclick={(e) => {
        e.stopPropagation();
        onEdit(expense);
      }}
      type="button"
      aria-label={`Edit ${expense.name}`}
      data-tooltip="Edit"
    >
      <span class="expense-row__action-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="expense-row__svg-icon"
          aria-hidden="true"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </span>
    </button>
    <button
      class="expense-row__action-button expense-row__action-button--duplicate"
      onclick={(e) => {
        e.stopPropagation();
        onDuplicate(expense.id);
      }}
      type="button"
      aria-label={`Duplicate ${expense.name}`}
      data-tooltip="Duplicate"
    >
      <span class="expense-row__action-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="expense-row__svg-icon"
          aria-hidden="true"
        >
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
      </span>
    </button>
  </div>
</div>

<style lang="scss">
  /*
   * ExpenseRow — BEM Block: .expense-row
   */

  .expense-row {
    display: grid;
    grid-template-columns:
      var(--col-checkbox) 1fr var(--col-category) var(--col-amount)
      var(--col-actions);
    column-gap: var(--space-md);
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    height: 100%;
    box-sizing: border-box;
    cursor: pointer;
    transition:
      background-color var(--transition-fast),
      box-shadow var(--transition-fast);

    &:hover {
      background: var(--color-bg-glass-hover);
    }

    /* Highlighted — belongs to top spending category */
    &--highlighted {
      background: var(--color-highlight-bg);

      &:hover {
        background: rgba(168, 85, 247, 0.16);
      }
    }

    /* Selected via checkbox */
    &--selected {
      background: rgba(168, 85, 247, 0.06);

      &.expense-row--highlighted {
        background: rgba(168, 85, 247, 0.2);
      }
    }

    /* Cells */
    &__cell {
      display: flex;
      align-items: center;

      &--checkbox {
        justify-content: center;
      }

      &--name {
        position: relative;
        min-width: 0;
        width: 100%;
      }

      &--amount {
        font-weight: var(--font-weight-semibold);
        font-variant-numeric: tabular-nums;
        color: var(--color-text-primary);
        justify-content: flex-start;
      }

      &--actions {
        justify-content: flex-start;
        gap: var(--space-xs);
      }
    }

    &__name-text {
      display: block;
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: var(--space-sm);
      width: 100%;
    }

    /* Checkbox */
    &__checkbox {
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

      &:checked {
        background: var(--color-accent-start);
        border-color: var(--color-accent-start);

        &::after {
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
      }
    }

    /* Category badge */
    &__category-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-2xs) var(--space-sm);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      white-space: nowrap;

      &--food {
        background: var(--color-category-food-bg);
        color: var(--color-category-food);
      }

      &--furniture {
        background: var(--color-category-furniture-bg);
        color: var(--color-category-furniture);
      }

      &--accessory {
        background: var(--color-category-accessory-bg);
        color: var(--color-category-accessory);
      }
    }

    /* Action buttons */
    &__action-button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--action-btn-size);
      height: var(--action-btn-size);
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      transition:
        background-color var(--transition-fast),
        color var(--transition-fast);

      &:hover {
        background: var(--color-bg-glass-hover);
        color: var(--color-text-primary);
      }

      &--edit:hover {
        color: var(--color-accent-start);
      }

      &--duplicate:hover {
        color: var(--color-success);
      }
    }

    &__action-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--action-btn-size);
      height: var(--action-btn-size);
      flex-shrink: 0;
    }

    &__svg-icon {
      width: calc(var(--action-btn-size) * 0.5);
      height: calc(var(--action-btn-size) * 0.5);
      display: block;
    }

    /* Mid-range tablet (500px – 767px): compressed single-row grid, matches header columns */
    @media (min-width: 500px) and (max-width: 767px) {
      grid-template-columns: 36px 1fr 100px 90px 80px;
      column-gap: var(--space-sm);
      padding: var(--space-xs) var(--space-sm);

      .expense-row__category-badge {
        padding: var(--space-2xs) var(--space-xs);
        font-size: 0.7rem;
      }
    }

    /* Small mobile (< 500px): compact single-row grid, matches header columns */
    @media (max-width: 499px) {
      grid-template-columns: 36px 1fr 1fr 75px;
      column-gap: var(--space-xs);
      padding: var(--space-xs) var(--space-sm);

      .expense-row__cell--actions {
        display: none;
      }
    }
  }

  /* Premium Custom Tooltips */
  [data-tooltip] {
    position: relative;

    &::before,
    &::after {
      position: absolute;
      left: 50%;
      transform: translateX(-50%) translateY(0);
      opacity: 0;
      pointer-events: none;
      transition:
        opacity var(--transition-fast),
        transform var(--transition-fast);
      z-index: var(--z-dropdown);
    }

    /* Tooltip bubble */
    &::after {
      content: attr(data-tooltip);
      bottom: calc(100% + 6px);
      background: rgba(26, 26, 46, 0.95);
      backdrop-filter: blur(4px);
      color: var(--color-text-primary);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-bg-glass-border);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      width: max-content;
      max-width: 280px;
      white-space: normal;
      overflow-wrap: break-word;
      text-align: center;
    }

    /* Tooltip arrow */
    &::before {
      content: '';
      bottom: calc(100% + 1px);
      border-width: 5px 5px 0 5px;
      border-style: solid;
      border-color: rgba(26, 26, 46, 0.95) transparent transparent transparent;
    }

    /* Hover state */
    &:hover::before,
    &:hover::after {
      opacity: 1;
      transform: translateX(-50%) translateY(-6px);
    }
  }
</style>
