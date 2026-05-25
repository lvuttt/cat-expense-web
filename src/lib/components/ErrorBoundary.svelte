<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  let hasError = $state(false);
  let error = $state<Error | null>(null);

  function handleError(event: ErrorEvent) {
    event.preventDefault();
    hasError = true;
    error = event.error;
    console.error('[ErrorBoundary] Caught an error:', event.error);
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('error', handleError);
  }

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', handleError);
    }
  });

  function handleRetry() {
    hasError = false;
    error = null;
  }
</script>

{#if hasError}
  <div
    role="alert"
    style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 32px; text-align: center; color: var(--color-text-primary);"
  >
    <span style="font-size: 4rem; margin-bottom: 16px;">😿</span>
    <h1 style="font-size: 1.5rem; margin-bottom: 8px;">
      Something went wrong
    </h1>
    <p
      style="color: var(--color-text-secondary); margin-bottom: 24px; max-width: 400px;"
    >
      The cat knocked something over. Please try again.
    </p>
    <button
      onclick={handleRetry}
      style="padding: 10px 24px; border-radius: 8px; border: none; background: var(--color-accent-gradient); color: white; font-weight: 600; cursor: pointer; font-size: 1rem;"
    >
      Try Again
    </button>
  </div>
{:else}
  {@render children()}
{/if}
