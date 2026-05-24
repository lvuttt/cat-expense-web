/**
 * SpendingChart — Visual breakdown of category spending.
 *
 * Renders an animated horizontal bar chart grouped by category.
 * Highlights the top-spending category bars.
 * Collapses entirely when the expense list is empty.
 */

import type { Expense, Category } from '../../types';
import { CATEGORIES, CATEGORY_CONFIG } from '../../constants';
import { sumByCategory } from '../../utils/expenseUtils';
import { formatCurrency } from '../../utils/formatUtils';
import './SpendingChart.css';

interface SpendingChartProps {
  readonly expenses: readonly Expense[];
  readonly topCategories: ReadonlySet<Category>;
}

export function SpendingChart({ expenses, topCategories }: SpendingChartProps) {
  if (expenses.length === 0) return null;

  const categoryTotals = sumByCategory(expenses);
  const grandTotal = [...categoryTotals.values()].reduce((sum, v) => sum + v, 0);

  const rows = CATEGORIES.map((cat) => ({
    category: cat,
    total: categoryTotals.get(cat) ?? 0,
    pct: grandTotal > 0 ? ((categoryTotals.get(cat) ?? 0) / grandTotal) * 100 : 0,
    isTop: topCategories.has(cat),
    meta: CATEGORY_CONFIG[cat],
  })).filter((r) => r.total > 0);

  return (
    <section
      className="spending-chart"
      aria-label="Spending by category"
      id="spending-chart"
    >
      <h2 className="spending-chart__title">
        <span aria-hidden="true">📊</span> Spending Breakdown
      </h2>

      <div className="spending-chart__bars" role="list">
        {rows.map(({ category, total, pct, isTop, meta }) => (
          <div
            key={category}
            className={`spending-chart__row${isTop ? ' spending-chart__row--top' : ''}`}
            role="listitem"
          >
            <div className="spending-chart__label">
              <span className="spending-chart__emoji" aria-hidden="true">
                {meta.emoji}
              </span>
              <span className="spending-chart__category-name">{meta.label}</span>
              {isTop && (
                <span className="spending-chart__top-badge" aria-label="Top spending category">
                  👑
                </span>
              )}
            </div>

            <div
              className="spending-chart__track"
              role="progressbar"
              aria-label={`${meta.label} spending`}
              aria-valuenow={Math.round(pct)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={`spending-chart__fill spending-chart__fill--${meta.cssClass}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="spending-chart__amount">
              <span className="spending-chart__total">{formatCurrency(total)}</span>
              <span className="spending-chart__pct">{Math.round(pct)}%</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
