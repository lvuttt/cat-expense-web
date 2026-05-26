<script lang="ts">
  interface Props {
    fact: string;
    isLoading: boolean;
    onRefetch: () => void;
  }

  let { fact, isLoading, onRefetch }: Props = $props();

  let catFactClasses = $derived(
    ['cat-fact-panel', isLoading ? 'cat-fact-panel--loading' : '']
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={catFactClasses} aria-live="polite">
  <div class="cat-fact-panel__icon-wrapper">
    <span class="cat-fact-panel__icon" aria-hidden="true"> 🐾 </span>
  </div>
  <div class="cat-fact-panel__header">
    <h3 class="cat-fact-panel__title">Random cat fact</h3>
    <button
      class="cat-fact-panel__refresh {isLoading
        ? 'cat-fact-panel__refresh--spinning'
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
  <p class="cat-fact-panel__text">
    {isLoading ? 'Loading a purr-fect fact...' : fact}
  </p>
</div>

<style lang="scss">
  .cat-fact-panel {
    margin: 0;
    padding: var(--space-lg);
    background: linear-gradient(
      135deg,
      var(--color-bg-glass) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border: 1px solid var(--color-bg-glass-border);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: var(--space-sm);
    min-height: var(--cat-fact-min-height);

    &__icon-wrapper {
      width: var(--cat-fact-icon-wrapper-size);
      height: var(--cat-fact-icon-wrapper-size);
      border-radius: 50%;
      background: rgba(168, 85, 247, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--space-xs);
      flex-shrink: 0;
    }

    &__icon {
      font-size: 1.5rem;
    }

    &__header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-xs);
    }

    &__title {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }

    &__refresh {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      color: var(--color-text-muted);
      font-size: var(--font-size-md);
      cursor: pointer;
      transition:
        color var(--transition-fast),
        background-color var(--transition-fast),
        transform var(--transition-fast);
      line-height: 1;

      &:hover:not(:disabled) {
        background: var(--color-bg-glass-hover);
        color: var(--color-text-primary);
        transform: rotate(30deg);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    &__text {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      font-style: italic;
      margin: 0;
      max-width: var(--cat-fact-text-max-width);
    }

    &--loading {
      .cat-fact-panel__text {
        background: linear-gradient(
          90deg,
          var(--color-bg-glass) 25%,
          rgba(255, 255, 255, 0.08) 50%,
          var(--color-bg-glass) 75%
        );
        background-size: 200% 100%;
        border-radius: var(--radius-xs);
        color: transparent;
        user-select: none;
        min-height: 1.2em;
      }
    }

    @media (max-width: 767px) {
      flex-direction: row;
      align-items: center;
      text-align: left;
      padding: var(--space-md);
      min-height: auto;
      gap: var(--space-sm);

      .cat-fact-panel__icon-wrapper {
        width: 36px;
        height: 36px;
        margin-bottom: 0;
      }

      .cat-fact-panel__icon {
        font-size: 1.1rem;
      }

      .cat-fact-panel__title {
        display: none;
      }

      .cat-fact-panel__text {
        max-width: none;
      }
    }
  }
</style>
