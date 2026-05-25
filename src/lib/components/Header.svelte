<script lang="ts">
</script>

<header class="header" id="app-header">
  <div class="header__logo" aria-hidden="true">🐱</div>
  <h1 class="header__title">Cat Expense</h1>
  <p class="header__subtitle">
    Track your feline friend's expenses with purr-fection
  </p>
</header>

<style>
  /*
   * Header — BEM Block: .header
   */

  .header {
    text-align: center;
    padding: var(--header-padding-top) var(--space-md)
      var(--header-padding-bottom);
    animation: fadeIn var(--transition-slow) ease;
  }

  .header__logo {
    font-size: var(--header-logo-size);
    display: inline-block;
    animation: float 3s ease-in-out infinite;
    margin-bottom: var(--space-sm);
    filter: drop-shadow(0 4px 12px rgba(168, 85, 247, 0.3));
  }

  .header__title {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    background: var(--color-accent-gradient);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: var(--line-height-tight);
    margin-bottom: var(--space-xs);
    letter-spacing: -0.02em;
  }

  .header__subtitle {
    color: var(--color-text-secondary);
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-light);
    letter-spacing: 0.02em;
  }

  /* Mid-range tablet (500px – 767px) */
  @media (min-width: 500px) and (max-width: 767px) {
    .header {
      padding: var(--space-2xl) var(--space-lg) var(--space-lg);
    }

    .header__logo {
      font-size: 3rem;
    }

    .header__title {
      font-size: var(--font-size-3xl);
    }
  }

  /* Small mobile (< 500px) */
  @media (max-width: 499px) {
    .header {
      padding: var(--space-lg) var(--space-md) var(--space-xs);
    }

    .header__logo {
      font-size: 2.2rem;
      margin-bottom: var(--space-2xs);
    }

    .header__title {
      font-size: var(--font-size-2xl);
      letter-spacing: -0.01em;
    }

    .header__subtitle {
      font-size: var(--font-size-xs);
      opacity: 0.85;
    }
  }
</style>
