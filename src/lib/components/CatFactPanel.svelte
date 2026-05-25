<script lang="ts">
  interface Props {
    fact: string;
    isLoading: boolean;
    onRefetch: () => void;
  }

  let { fact, isLoading, onRefetch }: Props = $props();

  let catFactClasses = $derived(
    [
      'expense-dialog__cat-fact',
      isLoading ? 'expense-dialog__cat-fact--loading' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={catFactClasses} aria-live="polite">
  <div class="expense-dialog__cat-fact-icon-wrapper">
    <span class="expense-dialog__cat-fact-icon" aria-hidden="true"> 🐾 </span>
  </div>
  <div class="expense-dialog__cat-fact-header">
    <h3 class="expense-dialog__cat-fact-title">Random cat fact</h3>
    <button
      class="expense-dialog__cat-fact-refresh {isLoading
        ? 'expense-dialog__cat-fact-refresh--spinning'
        : ''}"
      type="button"
      onclick={onRefetch}
      disabled={isLoading}
      aria-label="Refresh cat fact"
      id="dialog-refresh-fact-button"
    >
      ↻
    </button>
  </div>
  <p class="expense-dialog__cat-fact-text">
    {isLoading ? 'Loading a purr-fect fact...' : fact}
  </p>
</div>
