<script lang="ts">
  import { page } from '$app/stores';
</script>

<svelte:head>
  <title>Oops! An Error Occurred</title>
</svelte:head>

<div class="error-page">
  <div class="error-page__card">
    <div class="error-page__icon-wrapper">
      <span class="error-page__icon" role="img" aria-label="Sad cat">😿</span>
    </div>

    <h1 class="error-page__status">{$page.status || 500}</h1>
    <h2 class="error-page__title">Something went wrong</h2>

    <p class="error-page__message">
      {$page.error?.message ||
        "We couldn't load the page. The cat might have knocked something over! 🐾"}
    </p>

    <div class="error-page__actions">
      <a href="/" class="error-page__button" id="error-back-button">
        Return to Dashboard
      </a>
    </div>
  </div>
</div>

<style lang="scss">
  .error-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
    padding: var(--space-lg);
    font-family: var(--font-family);
    color: var(--color-text-primary);

    &__card {
      background: var(--color-bg-secondary);
      border: 1px solid var(--color-bg-glass-border);
      border-radius: var(--radius-xl);
      padding: var(--space-2xl) var(--space-xl);
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: var(--shadow-lg);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    &__icon-wrapper {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-lg);
    }

    &__icon {
      font-size: 2.5rem;
    }

    &__status {
      font-size: 4rem;
      font-weight: var(--font-weight-bold);
      background: var(--color-danger);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0 0 var(--space-xs);
      line-height: 1;
    }

    &__title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-sm);
    }

    &__message {
      font-size: var(--font-size-md);
      color: var(--color-text-secondary);
      line-height: var(--line-height-relaxed);
      margin: 0 0 var(--space-xl);
    }

    &__actions {
      display: flex;
      justify-content: center;
    }

    &__button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-md) var(--space-2xl);
      background: var(--color-accent-gradient);
      border: none;
      border-radius: var(--radius-md);
      color: white;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      text-decoration: none;
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
  }
</style>
