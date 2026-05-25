<script lang="ts">
  import type { ExpenseFormData, DialogMode } from '$lib/types';
  import { createCatFact } from '$lib/state/catFact.svelte';
  import { focusTrap } from '$lib/utils/focusTrap';
  import CatFactPanel from '$lib/components/CatFactPanel.svelte';
  import ExpenseForm from '$lib/components/ExpenseForm.svelte';

  interface Props {
    isOpen: boolean;
    mode: DialogMode;
    onClose: () => void;
    onSubmit: (data: ExpenseFormData) => void;
  }

  let { isOpen, mode, onClose, onSubmit }: Props = $props();

  const catFactState = createCatFact();

  let nameInputEl = $state<HTMLInputElement | null>(null);

  // Manage body scroll lock
  $effect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  });

  // Track visualViewport for mobile resize
  let viewportStyle = $state<string>('');
  let contentMaxHeight = $state<string>('');

  $effect(() => {
    const visualViewport =
      typeof window !== 'undefined' ? window.visualViewport : null;
    if (!isOpen || !visualViewport) {
      viewportStyle = '';
      contentMaxHeight = '';
      return;
    }

    const handleResize = () => {
      if (window.innerWidth < 500) {
        viewportStyle = `
          position: fixed;
          top: ${visualViewport.offsetTop}px;
          left: ${visualViewport.offsetLeft}px;
          height: ${visualViewport.height}px;
          width: ${visualViewport.width}px;
          align-items: flex-end;
          padding: 0;
        `;
        contentMaxHeight = `max-height: ${visualViewport.height - 16}px;`;
      } else {
        viewportStyle = '';
        contentMaxHeight = '';
      }
    };

    visualViewport.addEventListener('resize', handleResize);
    visualViewport.addEventListener('scroll', handleResize);

    handleResize();

    return () => {
      visualViewport.removeEventListener('resize', handleResize);
      visualViewport.removeEventListener('scroll', handleResize);
    };
  });

  // Reset form / fact on dialog open or mode change
  $effect(() => {
    if (isOpen) {
      catFactState.refetch();
      requestAnimationFrame(() => {
        nameInputEl?.focus();
      });
    }
  });

  // Close on Escape key
  function handleKeyDown(e: KeyboardEvent) {
    if (isOpen && e.key === 'Escape') {
      onClose();
    }
  }

  function handleOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  const isEditMode = $derived(mode.type === 'edit');
  const title = $derived(isEditMode ? 'Edit Expense' : 'Add Expense');
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div
    class="expense-dialog__overlay"
    onclick={handleOverlayClick}
    role="dialog"
    aria-modal="true"
    aria-label={title}
    id="expense-dialog"
    style={viewportStyle}
  >
    <div
      class="expense-dialog__content"
      use:focusTrap={isOpen}
      style={contentMaxHeight}
    >
      <!-- Header -->
      <div class="expense-dialog__header">
        <h2 class="expense-dialog__title">{title}</h2>
        <button
          class="expense-dialog__close"
          onclick={onClose}
          type="button"
          aria-label="Close dialog"
          id="dialog-close-button"
        >
          ✕
        </button>
      </div>

      <!-- Dialog Body containing form and fact panel -->
      <div class="expense-dialog__body">
        <ExpenseForm {mode} {onSubmit} bind:nameInputRef={nameInputEl} />

        <CatFactPanel
          fact={catFactState.fact}
          isLoading={catFactState.isLoading}
          onRefetch={catFactState.refetch}
        />
      </div>
    </div>
  </div>
{/if}

<style>
  /*
   * ExpenseDialog — BEM Block: .expense-dialog
   */

  /* Overlay */
  .expense-dialog__overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-modal);
    animation: fadeIn var(--transition-fast) ease;
    padding: var(--space-md);
  }

  /* Dialog content */
  .expense-dialog__content {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-bg-glass-border);
    border-radius: var(--radius-xl);
    width: 100%;
    max-width: 740px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
    animation: scaleIn var(--transition-base) ease;
  }

  /* Header */
  .expense-dialog__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-lg) var(--space-lg) var(--space-md);
  }

  .expense-dialog__title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
  }

  .expense-dialog__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--close-btn-size);
    height: var(--close-btn-size);
    border: none;
    background: transparent;
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: var(--color-text-secondary);
    font-size: var(--font-size-lg);
    transition:
      background-color var(--transition-fast),
      color var(--transition-fast);
  }

  .expense-dialog__close:hover {
    background: var(--color-bg-glass-hover);
    color: var(--color-text-primary);
  }

  /* Cat fact Wisdom Card */
  :global(.expense-dialog__cat-fact) {
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
  }

  :global(.expense-dialog__cat-fact-icon-wrapper) {
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

  :global(.expense-dialog__cat-fact-icon) {
    font-size: 1.5rem;
  }

  :global(.expense-dialog__cat-fact-title) {
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
    margin: 0;
  }

  :global(.expense-dialog__cat-fact-text) {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
    font-style: italic;
    margin: 0;
    max-width: var(--cat-fact-text-max-width);
  }

  :global(.expense-dialog__cat-fact--loading)
    :global(.expense-dialog__cat-fact-text) {
    background: linear-gradient(
      90deg,
      var(--color-bg-glass) 25%,
      rgba(255, 255, 255, 0.08) 50%,
      var(--color-bg-glass) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--radius-xs);
    color: transparent;
    user-select: none;
    min-height: 1.2em;
  }

  /* Cat fact header: title + refresh button row */
  :global(.expense-dialog__cat-fact-header) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs);
  }

  /* Refresh button */
  :global(.expense-dialog__cat-fact-refresh) {
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
  }

  :global(.expense-dialog__cat-fact-refresh:hover:not(:disabled)) {
    background: var(--color-bg-glass-hover);
    color: var(--color-text-primary);
    transform: rotate(30deg);
  }

  :global(.expense-dialog__cat-fact-refresh:disabled) {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  :global(.expense-dialog__cat-fact-refresh--spinning) {
    animation: spin 0.8s linear infinite;
  }

  /* Form styles (targeting descendant children) */
  :global(.expense-dialog__form) {
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  /* Dialog body layout */
  .expense-dialog__body {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: var(--space-lg);
    padding: 0 var(--space-lg) var(--space-lg);
    align-items: stretch;
  }

  :global(.expense-dialog__field) {
    margin-bottom: var(--space-md);
  }

  :global(.expense-dialog__label) {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-xs);
  }

  :global(.expense-dialog__label--required::after) {
    content: ' *';
    color: var(--color-danger);
  }

  :global(.expense-dialog__input),
  :global(.expense-dialog__select) {
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
  }

  :global(.expense-dialog__input::placeholder) {
    color: var(--color-text-muted);
  }

  :global(.expense-dialog__input:focus),
  :global(.expense-dialog__select:focus) {
    outline: none;
    border-color: var(--color-accent-start);
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
  }

  :global(.expense-dialog__select) {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
  }

  :global(.expense-dialog__select option) {
    background: var(--color-bg-tertiary);
    color: var(--color-text-primary);
  }

  /* Error state */
  :global(.expense-dialog__field--error) :global(.expense-dialog__input),
  :global(.expense-dialog__field--error) :global(.expense-dialog__select) {
    border-color: var(--color-danger);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  :global(.expense-dialog__field--error) {
    animation: shake 0.4s ease;
  }

  :global(.expense-dialog__error-message) {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    margin-top: var(--space-xs);
    font-size: var(--font-size-xs);
    color: var(--color-danger);
  }

  /* Action buttons */
  :global(.expense-dialog__actions) {
    display: flex;
    gap: var(--space-sm);
    padding: var(--space-md) 0 0;
    justify-content: flex-end;
    margin-top: auto;
  }

  :global(.expense-dialog__submit) {
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
  }

  :global(.expense-dialog__submit:hover) {
    box-shadow: 0 6px 24px rgba(168, 85, 247, 0.4);
    transform: translateY(-1px);
  }

  :global(.expense-dialog__submit:active) {
    transform: scale(0.97);
  }

  /* Responsive layout changes under 768px screen width */
  @media (max-width: 767px) {
    .expense-dialog__body {
      display: flex;
      flex-direction: column-reverse;
      gap: var(--space-md);
    }

    :global(.expense-dialog__cat-fact) {
      flex-direction: row;
      align-items: center;
      text-align: left;
      padding: var(--space-md);
      min-height: auto;
      gap: var(--space-sm);
    }

    :global(.expense-dialog__cat-fact-icon-wrapper) {
      width: 36px;
      height: 36px;
      margin-bottom: 0;
    }

    :global(.expense-dialog__cat-fact-icon) {
      font-size: 1.1rem;
    }

    :global(.expense-dialog__cat-fact-title) {
      display: none;
    }

    :global(.expense-dialog__cat-fact-text) {
      max-width: none;
    }

    :global(.expense-dialog__actions) {
      flex-direction: column-reverse;
      gap: var(--space-sm);
      padding: var(--space-md) 0 0;
    }

    :global(.expense-dialog__submit) {
      width: 100%;
      justify-content: center;
    }
  }

  /* Mid-range tablet (500px – 767px): Center the dialog on screen like desktop, rather than a bottom-sheet */
  @media (min-width: 500px) and (max-width: 767px) {
    .expense-dialog__overlay {
      align-items: center;
      padding: var(--space-md);
    }

    .expense-dialog__content {
      max-width: 540px;
      border-radius: var(--radius-xl);
      max-height: 90vh;
    }
  }

  /* Small mobile (< 500px): Position dialog as a bottom-sheet */
  @media (max-width: 499px) {
    .expense-dialog__overlay {
      align-items: flex-end;
      padding: 0;
    }

    .expense-dialog__content {
      max-width: none;
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      max-height: 85vh;
    }
  }

  @media (min-width: 1400px) {
    .expense-dialog__content {
      max-width: 840px;
    }
  }

  @media (min-width: 1800px) {
    .expense-dialog__content {
      max-width: 960px;
    }
  }

  @media (min-width: 2200px) {
    .expense-dialog__content {
      max-width: 1080px;
    }
  }
</style>
