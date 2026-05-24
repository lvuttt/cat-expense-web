/**
 * ExpenseTable — Expense list table with sortable headers.
 *
 * SRP: responsible for table layout, header rendering, and empty state.
 * Delegates individual row rendering to ExpenseRow (SRP separation).
 */

import { useRef, useEffect, useState } from 'react';
import type { Expense, Category, SortField, SortConfig } from '../../types';
import { isInTopCategory } from '../../utils/expenseUtils';
import { useVirtualList } from '../../hooks/useVirtualList';
import { ExpenseRow } from '../ExpenseRow/ExpenseRow';
import './ExpenseTable.css';

interface ExpenseTableProps {
  readonly expenses: Expense[];
  readonly topCategories: Set<Category>;
  readonly sortConfig: SortConfig;
  readonly onSort: (field: SortField) => void;
  readonly isAllSelected: boolean;
  readonly isSomeSelected: boolean;
  readonly onToggleAll: () => void;
  readonly isSelected: (id: string) => boolean;
  readonly onToggleSelect: (id: string) => void;
  readonly onEdit: (expense: Expense) => void;
  readonly onDuplicate: (id: string) => void;
}

/** Detects row height dynamically based on viewport media query size. */
function useRowHeight(): number {
  const [height, setHeight] = useState(52);

  useEffect(() => {
    const updateHeight = () => {
      const width = window.innerWidth;
      if (width < 500) {
        setHeight(48); // Mobile table row height
      } else if (width < 768) {
        setHeight(40); // Tablet compressed row height
      } else {
        setHeight(52); // Desktop row height
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return height;
}

/** Sortable column configuration — OCP: add new columns here. */
const SORTABLE_COLUMNS: Array<{
  field: SortField;
  label: string;
  className: string;
}> = [
    { field: 'name', label: 'Item Name', className: '' },
    { field: 'category', label: 'Category', className: '' },
    { field: 'amount', label: 'Amount', className: 'expense-table__header-cell--amount' },
  ];

export function ExpenseTable({
  expenses,
  topCategories,
  sortConfig,
  onSort,
  isAllSelected,
  isSomeSelected,
  onToggleAll,
  isSelected,
  onToggleSelect,
  onEdit,
  onDuplicate,
}: ExpenseTableProps) {
  const hasExpenses = expenses.length > 0;
  const checkboxRef = useRef<HTMLInputElement>(null);
  const rowHeight = useRowHeight();

  const { containerRef, visibleItems, totalHeight } = useVirtualList({
    items: expenses,
    rowHeight,
  });

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isSomeSelected && !isAllSelected;
    }
  }, [isSomeSelected, isAllSelected]);

  return (
    <div
      className="expense-table"
      id="expense-table"
      role="grid"
      aria-label="Expense list"
    >
      {/* Table Header */}
      <div className="expense-table__header" role="row">
        <div
          className="expense-table__header-cell expense-table__header-cell--checkbox"
          role="columnheader"
        >
          <input
            ref={checkboxRef}
            className="expense-table__checkbox"
            type="checkbox"
            checked={isAllSelected}
            onChange={onToggleAll}
            aria-label={isAllSelected ? 'Deselect all expenses' : 'Select all expenses'}
            id="select-all-checkbox"
            disabled={!hasExpenses}
          />
        </div>

        {SORTABLE_COLUMNS.map(({ field, label, className }) => {
          const isSorted = sortConfig.field === field;
          const cellClasses = [
            'expense-table__header-cell',
            'expense-table__header-cell--sortable',
            isSorted ? 'expense-table__header-cell--sorted' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={field}
              className={cellClasses}
              role="columnheader"
              aria-sort={
                isSorted
                  ? sortConfig.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              }
              onClick={() => onSort(field)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSort(field);
                }
              }}
            >
              {label}
              {isSorted && (
                <span
                  className={`expense-table__sort-icon ${sortConfig.direction === 'desc'
                      ? 'expense-table__sort-icon--desc'
                      : ''
                    }`}
                  aria-hidden="true"
                >
                  ▲
                </span>
              )}
            </div>
          );
        })}

        <div
          className="expense-table__header-cell expense-table__header-cell--actions"
          role="columnheader"
        >
          Actions
        </div>
      </div>

      {/* Table Body */}
      <div
        className="expense-table__body"
        role="rowgroup"
        ref={containerRef}
      >
        <div
          className="expense-table__inner"
          style={{
            position: 'relative',
            height: hasExpenses ? `${totalHeight}px` : 'auto',
          }}
        >
          {hasExpenses ? (
            visibleItems.map(({ item: expense, originalIndex }) => (
              <div
                key={expense.id}
                style={{
                  position: 'absolute',
                  top: `${originalIndex * rowHeight}px`,
                  left: 0,
                  right: 0,
                  height: `${rowHeight}px`,
                }}
              >
                <ExpenseRow
                  expense={expense}
                  isHighlighted={isInTopCategory(expense, topCategories)}
                  isSelected={isSelected(expense.id)}
                  onToggleSelect={onToggleSelect}
                  onEdit={onEdit}
                  onDuplicate={onDuplicate}
                />
              </div>
            ))
          ) : (
            <div className="expense-table__empty" role="row">
              <span className="expense-table__empty-icon" aria-hidden="true">
                😺
              </span>
              <p className="expense-table__empty-title">No expenses yet</p>
              <p className="expense-table__empty-text">
                Click &quot;Add Expense&quot; to start tracking your cat&apos;s spending!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
