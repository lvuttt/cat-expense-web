<script lang="ts">
  import type { ExpenseFormData, Category, DialogMode } from '$lib/types';
  import { CATEGORIES, CATEGORY_CONFIG } from '$lib/constants';
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

  // svelte-ignore state_referenced_locally
  const initialValues = getInitialValues(mode);
  let name = $state(initialValues.name);
  let category = $state<Category | ''>(initialValues.category);
  let amount = $state(initialValues.amount);
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

<form class="expense-dialog__form" onsubmit={handleFormSubmit} novalidate>
  <!-- Item Name -->
  <div
    class="expense-dialog__field {errors.name
      ? 'expense-dialog__field--error'
      : ''}"
  >
    <label
      class="expense-dialog__label expense-dialog__label--required"
      for="expense-name"
    >
      Item Name
    </label>
    <input
      class="expense-dialog__input"
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
        class="expense-dialog__error-message"
        id="expense-name-error"
        role="alert"
      >
        {errors.name}
      </p>
    {/if}
  </div>

  <!-- Category -->
  <div
    class="expense-dialog__field {errors.category
      ? 'expense-dialog__field--error'
      : ''}"
  >
    <label
      class="expense-dialog__label expense-dialog__label--required"
      for="expense-category"
    >
      Category
    </label>
    <select
      class="expense-dialog__select"
      id="expense-category"
      bind:value={category}
      aria-invalid={!!errors.category}
      aria-describedby={errors.category ? 'expense-category-error' : undefined}
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
        class="expense-dialog__error-message"
        id="expense-category-error"
        role="alert"
      >
        {errors.category}
      </p>
    {/if}
  </div>

  <!-- Amount -->
  <div
    class="expense-dialog__field {errors.amount
      ? 'expense-dialog__field--error'
      : ''}"
  >
    <label
      class="expense-dialog__label expense-dialog__label--required"
      for="expense-amount"
    >
      Amount ($)
    </label>
    <input
      class="expense-dialog__input"
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
        class="expense-dialog__error-message"
        id="expense-amount-error"
        role="alert"
      >
        {errors.amount}
      </p>
    {/if}
  </div>

  <!-- Actions -->
  <div class="expense-dialog__actions">
    <button
      class="expense-dialog__submit"
      type="submit"
      id="dialog-submit-button"
    >
      {submitLabel}
    </button>
  </div>
</form>
