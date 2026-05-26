<script lang="ts">
  import type { ExpenseFormData, DialogMode } from '$lib/types/models';
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

  const isEditMode = $derived(mode.type === 'edit');
  const title = $derived(isEditMode ? 'Edit Expense' : 'Add Expense');
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if isOpen}
  <div
    class="expense-dialog expense-dialog__overlay"
    id="expense-dialog"
    style={viewportStyle}
  >
    <button
      class="expense-dialog__backdrop"
      onclick={onClose}
      aria-label="Close dialog backdrop"
      tabindex="-1"
      type="button"
    ></button>
    <div
      class="expense-dialog__content"
      use:focusTrap={isOpen}
      style={contentMaxHeight}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <!-- Header -->
      <div class="expense-dialog__header">
        <h2 id="dialog-title" class="expense-dialog__title">{title}</h2>
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

<style lang="scss">
  /*
   * ExpenseDialog — BEM Block: .expense-dialog
   */

  .expense-dialog {
    /* Overlay container */
    &__overlay {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal);
      padding: var(--space-md);

      /* Small mobile (< 500px): Position dialog as a bottom-sheet */
      @media (max-width: 499px) {
        align-items: flex-end;
        padding: 0;
      }

      /* Mid-range tablet (500px – 767px): Center the dialog on screen like desktop, rather than a bottom-sheet */
      @media (min-width: 500px) and (max-width: 767px) {
        align-items: center;
        padding: var(--space-md);
      }
    }

    /* Backdrop button */
    &__backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: none;
      cursor: pointer;
      padding: 0;
      margin: 0;
      width: 100%;
      height: 100%;
    }

    /* Dialog content container */
    &__content {
      position: relative;
      z-index: 1;
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-bg-glass-border);
      border-radius: var(--radius-xl);
      width: 100%;
      max-width: 740px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);

      /* Small mobile (< 500px): Position dialog as a bottom-sheet */
      @media (max-width: 499px) {
        max-width: none;
        border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        max-height: 85vh;
      }

      /* Mid-range tablet (500px – 767px) */
      @media (min-width: 500px) and (max-width: 767px) {
        max-width: 540px;
        border-radius: var(--radius-xl);
        max-height: 90vh;
      }

      @media (min-width: 1400px) {
        max-width: 840px;
      }

      @media (min-width: 1800px) {
        max-width: 960px;
      }

      @media (min-width: 2200px) {
        max-width: 1080px;
      }
    }

    /* Header */
    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-lg) var(--space-lg) var(--space-md);
    }

    &__title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-primary);
    }

    &__close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--close-btn-size);
      height: var(--close-btn-size);
      padding: 0;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      color: var(--color-text-secondary);
      font-size: var(--font-size-lg);
      transition:
        background-color var(--transition-fast),
        color var(--transition-fast);

      &:hover {
        background: var(--color-bg-glass-hover);
        color: var(--color-text-primary);
      }
    }

    /* Dialog body layout */
    &__body {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: var(--space-lg);
      padding: 0 var(--space-lg) var(--space-lg);
      align-items: stretch;

      /* Responsive layout changes under 768px screen width */
      @media (max-width: 767px) {
        display: flex;
        flex-direction: column-reverse;
        gap: var(--space-md);
      }
    }
  }
</style>
