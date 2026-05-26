<script lang="ts">
  import type {
    ExpenseFormData,
    Category,
    DialogMode,
  } from '$lib/types/models';
  import { CATEGORIES, CATEGORY_CONFIG } from '$lib/constants/app';
  import {
    validateExpenseForm,
    hasErrors,
    type ValidationErrors,
  } from '$lib/utils/validationUtils';

  interface Props {
    mode: DialogMode;
    onSubmit: (data: ExpenseFormData) => void;
    nameInputRef?: HTMLInputElement | null;
  }

  let { mode, onSubmit, nameInputRef = $bindable() }: Props = $props();

  function getInitialValues(mode: DialogMode) {
    if (mode.type === 'edit') {
      return {
        name: mode.expense.name,
        category: mode.expense.category,
        amount: String(mode.expense.amount),
      };
    }
    return { name: '', category: '' as Category | '', amount: '' };
  }

  let name = $state('');
  let category = $state<Category | ''>('');
  let amount = $state('');
  let errors = $state<ValidationErrors>({});
  let hasSubmitted = $state(false);

  // Sync form values if mode changes
  $effect(() => {
    const values = getInitialValues(mode);
    name = values.name;
    category = values.category;
    amount = values.amount;
    errors = {};
    hasSubmitted = false;
  });

  // Live validation
  $effect(() => {
    if (!hasSubmitted) return;

    const formData: Partial<ExpenseFormData> = {
      name: name.trim(),
      category: category || undefined,
      amount: amount ? Number(amount) : undefined,
    };
    errors = validateExpenseForm(formData);
  });

  function handleFormSubmit(e: Event) {
    e.preventDefault();
    hasSubmitted = true;

    const formData: Partial<ExpenseFormData> = {
      name: name.trim(),
      category: category || undefined,
      amount: amount ? Number(amount) : undefined,
    };

    const validationErrors = validateExpenseForm(formData);

    if (hasErrors(validationErrors)) {
      errors = validationErrors;
      return;
    }

    onSubmit({
      name: name.trim(),
      category: category as Category,
      amount: Number(amount),
    });
  }

  const isEditMode = $derived(mode.type === 'edit');
  const submitLabel = $derived(isEditMode ? 'Update' : 'Submit');
</script>

<form class="expense-form" onsubmit={handleFormSubmit} novalidate>
  <div class="expense-form__body-inputs">
    <!-- Item Name -->
    <div
      class="expense-form__field {errors.name
        ? 'expense-form__field--error'
        : ''}"
    >
      <label
        class="expense-form__label expense-form__label--required"
        for="expense-name"
      >
        Item Name
      </label>
      <input
        class="expense-form__input"
        id="expense-name"
        bind:this={nameInputRef}
        type="text"
        bind:value={name}
        placeholder="e.g., Premium Cat Food"
        aria-invalid={!!errors.name}
        aria-describedby={errors.name ? 'expense-name-error' : undefined}
        autocomplete="off"
      />
      {#if errors.name}
        <p
          class="expense-form__error-message"
          id="expense-name-error"
          role="alert"
        >
          {errors.name}
        </p>
      {/if}
    </div>

    <!-- Category -->
    <div
      class="expense-form__field {errors.category
        ? 'expense-form__field--error'
        : ''}"
    >
      <label
        class="expense-form__label expense-form__label--required"
        for="expense-category"
      >
        Category
      </label>
      <select
        class="expense-form__select"
        id="expense-category"
        bind:value={category}
        aria-invalid={!!errors.category}
        aria-describedby={errors.category
          ? 'expense-category-error'
          : undefined}
      >
        <option value="" disabled> Select a category </option>
        {#each CATEGORIES as cat (cat)}
          <option value={cat}>
            {CATEGORY_CONFIG[cat].emoji}
            {CATEGORY_CONFIG[cat].label}
          </option>
        {/each}
      </select>
      {#if errors.category}
        <p
          class="expense-form__error-message"
          id="expense-category-error"
          role="alert"
        >
          {errors.category}
        </p>
      {/if}
    </div>

    <!-- Amount -->
    <div
      class="expense-form__field {errors.amount
        ? 'expense-form__field--error'
        : ''}"
    >
      <label
        class="expense-form__label expense-form__label--required"
        for="expense-amount"
      >
        Amount ($)
      </label>
      <input
        class="expense-form__input"
        id="expense-amount"
        type="text"
        inputmode="decimal"
        bind:value={amount}
        placeholder="0.00"
        aria-invalid={!!errors.amount}
        aria-describedby={errors.amount ? 'expense-amount-error' : undefined}
      />
      {#if errors.amount}
        <p
          class="expense-form__error-message"
          id="expense-amount-error"
          role="alert"
        >
          {errors.amount}
        </p>
      {/if}
    </div>
  </div>

  <!-- Actions -->
  <div class="expense-form__actions">
    <button
      class="expense-form__submit"
      type="submit"
      id="dialog-submit-button"
    >
      {submitLabel}
    </button>
  </div>
</form>

<style lang="scss">
  .expense-form {
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;

    &__field {
      margin-bottom: var(--space-md);

      &--error {
        .expense-form__input,
        .expense-form__select {
          border-color: var(--color-danger);
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
      }
    }

    &__label {
      display: block;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-xs);

      &--required::after {
        content: ' *';
        color: var(--color-danger);
      }
    }

    &__input,
    &__select {
      width: 100%;
      padding: var(--space-sm) var(--space-md);
      background: var(--color-bg-tertiary);
      border: 1px solid var(--color-bg-glass-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-family: var(--font-family);
      font-size: var(--font-size-md);
      transition:
        border-color var(--transition-fast),
        box-shadow var(--transition-fast);
      height: var(--input-height);

      &:focus {
        outline: none;
        border-color: var(--color-accent-start);
        box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
      }
    }

    &__input::placeholder {
      color: var(--color-text-muted);
    }

    &__select {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 36px;

      option {
        background: var(--color-bg-tertiary);
        color: var(--color-text-primary);
      }
    }

    &__error-message {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      margin-top: var(--space-xs);
      font-size: var(--font-size-xs);
      color: var(--color-danger);
    }

    &__actions {
      display: flex;
      gap: var(--space-sm);
      padding: var(--space-md) 0 0;
      justify-content: flex-end;
      margin-top: auto;
    }

    &__submit {
      padding: var(--space-sm) var(--space-xl);
      background: var(--color-accent-gradient);
      border: none;
      border-radius: var(--radius-md);
      color: white;
      font-family: var(--font-family);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      cursor: pointer;
      box-shadow: var(--shadow-accent);
      transition:
        box-shadow var(--transition-fast),
        transform var(--transition-fast);
      height: var(--button-height);

      &:hover {
        box-shadow: 0 6px 24px rgba(168, 85, 247, 0.4);
        transform: translateY(-1px);
      }

      &:active {
        transform: scale(0.97);
      }
    }

    @media (max-width: 767px) {
      &__actions {
        flex-direction: column-reverse;
        gap: var(--space-sm);
        padding: var(--space-md) 0 0;
      }

      &__submit {
        width: 100%;
        justify-content: center;
      }
    }
  }
</style>
