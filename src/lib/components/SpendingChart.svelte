<script lang="ts">
  import type { Expense, Category } from '$lib/types/models';
  import { CATEGORIES, CATEGORY_CONFIG } from '$lib/constants/app';
  import { formatCurrency } from '$lib/utils/formatUtils';

  interface Props {
    expenses: readonly Expense[];
    topCategories: ReadonlySet<Category>;
    categoryTotals: Map<Category, number>;
  }

  let { expenses, topCategories, categoryTotals }: Props = $props();

  let grandTotalCents = $derived(
    [...categoryTotals.values()].reduce(
      (sum, v) => sum + Math.round(v * 100),
      0,
    ),
  );
  let grandTotal = $derived(grandTotalCents / 100);

  let rows = $derived(
    CATEGORIES.map((cat) => ({
      category: cat,
      total: categoryTotals.get(cat) ?? 0,
      pct:
        grandTotal > 0
          ? ((categoryTotals.get(cat) ?? 0) / grandTotal) * 100
          : 0,
      isTop: topCategories.has(cat),
      meta: CATEGORY_CONFIG[cat],
    })).filter((r) => r.total > 0),
  );
</script>

{#if expenses.length > 0}
  <section
    class="spending-chart"
    aria-label="Spending by category"
    id="spending-chart"
  >
    <h2 class="spending-chart__title">
      <span aria-hidden="true">📊</span> Spending Breakdown
    </h2>

    <div class="spending-chart__bars" role="list">
      {#each rows as { category, total, pct, isTop, meta } (category)}
        <div
          class="spending-chart__row {isTop ? 'spending-chart__row--top' : ''}"
          role="listitem"
        >
          <div class="spending-chart__label">
            <span class="spending-chart__emoji" aria-hidden="true">
              {meta.emoji}
            </span>
            <span class="spending-chart__category-name">{meta.label}</span>
            {#if isTop}
              <span
                class="spending-chart__top-badge"
                aria-label="Top spending category"
              >
                👑
              </span>
            {/if}
          </div>

          <div
            class="spending-chart__track"
            role="progressbar"
            aria-label={`${meta.label} spending`}
            aria-valuenow={Math.round(pct)}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="spending-chart__fill spending-chart__fill--{meta.cssClass}"
              style="width: {pct}%"
            ></div>
          </div>

          <div class="spending-chart__amount">
            <span class="spending-chart__total">{formatCurrency(total)}</span>
            <span class="spending-chart__pct">{Math.round(pct)}%</span>
          </div>
        </div>
      {/each}
    </div>
  </section>
{/if}

<style lang="scss">
  /*
   * SpendingChart — BEM Block: .spending-chart
   */

  .spending-chart {
    margin-bottom: var(--space-lg);
    padding: var(--space-lg);
    background: var(--color-bg-glass);
    border: 1px solid var(--color-bg-glass-border);
    border-radius: var(--radius-lg);

    &__title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: var(--space-md);
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    &__bars {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    /* ---- Row ---- */
    &__row {
      display: grid;
      grid-template-columns: 140px 1fr 120px;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius-sm);
      transition: background var(--transition-fast);

      &--top {
        background: var(--color-highlight-bg);
        border: 1px solid var(--color-highlight-border);
      }
    }

    /* ---- Label ---- */
    &__label {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      min-width: 0;
    }

    &__emoji {
      font-size: var(--font-size-md);
      line-height: 1;
      flex-shrink: 0;
    }

    &__category-name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &__top-badge {
      font-size: var(--font-size-xs);
      line-height: 1;
      flex-shrink: 0;
    }

    /* ---- Progress track ---- */
    &__track {
      height: 8px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    &__fill {
      height: 100%;
      border-radius: var(--radius-full);
      width: 0%;
      /* Animate from 0% to the computed width on mount */
      transition: width 700ms cubic-bezier(0.4, 0, 0.2, 1);

      /* Category-specific fill colors */
      &--food {
        background: linear-gradient(
          90deg,
          var(--color-category-food),
          rgba(249, 115, 22, 0.6)
        );
      }

      &--furniture {
        background: linear-gradient(
          90deg,
          var(--color-category-furniture),
          rgba(59, 130, 246, 0.6)
        );
      }

      &--accessory {
        background: linear-gradient(
          90deg,
          var(--color-category-accessory),
          rgba(168, 85, 247, 0.6)
        );
      }
    }

    /* ---- Amount column ---- */
    &__amount {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }

    &__total {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      white-space: nowrap;
    }

    &__pct {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    /* ---- Responsive ---- */
    @media (min-width: 500px) and (max-width: 767px) {
      .spending-chart__row {
        grid-template-columns: 120px 1fr 100px;
        gap: var(--space-sm);
        padding: var(--space-xs) var(--space-sm);
      }
    }

    @media (max-width: 499px) {
      padding: var(--space-md);
      margin-bottom: var(--space-md);
      border-radius: var(--radius-md);

      .spending-chart__row {
        grid-template-columns: 1fr auto;
        grid-template-rows: auto auto;
        row-gap: var(--space-xs);
        column-gap: var(--space-sm);
        padding: var(--space-xs) 0;
      }

      .spending-chart__label {
        grid-column: 1;
        grid-row: 1;
      }

      .spending-chart__amount {
        grid-column: 2;
        grid-row: 1;
        flex-direction: row;
        align-items: center;
        gap: var(--space-xs);
      }

      .spending-chart__track {
        grid-column: 1 / -1;
        grid-row: 2;
      }
    }
  }
</style>
