/**
 * ExpenseTable — Expense list table with sortable headers.
 *
 * SRP: responsible for table layout, header rendering, and empty state.
 * Delegates individual row rendering to ExpenseRow (SRP separation).
 */

import { useRef, useEffect } from 'react';
import type { Expense, Category, SortField, SortConfig } from '../../types';
import { isInTopCategory } from '../../utils/expenseUtils';
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
                  className={`expense-table__sort-icon ${
                    sortConfig.direction === 'desc'
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
      <div className="expense-table__body" role="rowgroup">
        {hasExpenses ? (
          expenses.map((expense, index) => (
            <div key={expense.id} style={{ animationDelay: `${index * 30}ms` }}>
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
  );
}
