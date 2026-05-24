/**
 * ExpenseRow — Renders a single expense item row.
 *
 * SRP: responsible only for rendering one expense row.
 * ISP: receives only the data and callbacks for this specific row.
 * Memoized to prevent unnecessary re-renders when other rows change.
 */

import { memo, useState, useRef } from 'react';
import type { Expense } from '../../types';
import { CATEGORY_CONFIG } from '../../constants';
import { formatCurrency } from '../../utils/formatUtils';
import './ExpenseRow.css';

interface ExpenseRowProps {
  readonly expense: Expense;
  readonly isHighlighted: boolean;
  readonly isSelected: boolean;
  readonly onToggleSelect: (id: string) => void;
  readonly onEdit: (expense: Expense) => void;
  readonly onDuplicate: (id: string) => void;
}

export const ExpenseRow = memo(function ExpenseRow({
  expense,
  isHighlighted,
  isSelected,
  onToggleSelect,
  onEdit,
  onDuplicate,
}: ExpenseRowProps) {
  const categoryMeta = CATEGORY_CONFIG[expense.category];
  const nameRef = useRef<HTMLSpanElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    if (nameRef.current) {
      const isOverflowing = nameRef.current.scrollWidth > nameRef.current.clientWidth;
      setShowTooltip(isOverflowing);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const rowClasses = [
    'expense-row',
    isHighlighted ? 'expense-row--highlighted' : '',
    isSelected ? 'expense-row--selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const badgeClass = `expense-row__category-badge expense-row__category-badge--${categoryMeta.cssClass}`;

  return (
    <div
      className={rowClasses}
      role="row"
      aria-selected={isSelected}
      data-expense-id={expense.id}
    >
      <div className="expense-row__cell expense-row__cell--checkbox" role="gridcell">
        <input
          className="expense-row__checkbox"
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(expense.id)}
          aria-label={`Select ${expense.name}`}
          id={`select-${expense.id}`}
        />
      </div>

      <div
        className="expense-row__cell expense-row__cell--name"
        role="gridcell"
        data-tooltip={showTooltip ? expense.name : undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span ref={nameRef} className="expense-row__name-text">{expense.name}</span>
      </div>

      <div className="expense-row__cell expense-row__cell--category" role="gridcell">
        <span className={badgeClass}>
          <span aria-hidden="true">{categoryMeta.emoji}</span>
          {categoryMeta.label}
        </span>
      </div>

      <div className="expense-row__cell expense-row__cell--amount" role="gridcell">
        {formatCurrency(expense.amount)}
      </div>

      <div className="expense-row__cell expense-row__cell--actions" role="gridcell">
        <button
          className="expense-row__action-button expense-row__action-button--edit"
          onClick={() => onEdit(expense)}
          type="button"
          aria-label={`Edit ${expense.name}`}
          data-tooltip="Edit"
        >
          <span className="expense-row__action-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="expense-row__svg-icon"
              aria-hidden="true"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </span>
        </button>
        <button
          className="expense-row__action-button expense-row__action-button--duplicate"
          onClick={() => onDuplicate(expense.id)}
          type="button"
          aria-label={`Duplicate ${expense.name}`}
          data-tooltip="Duplicate"
        >
          <span className="expense-row__action-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="expense-row__svg-icon"
              aria-hidden="true"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
});
