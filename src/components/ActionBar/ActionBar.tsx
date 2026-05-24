/**
 * ActionBar — Add/Delete/Export action buttons.
 *
 * Single Responsibility: renders action buttons and delegates click handlers.
 * ISP: receives only the callbacks and state it needs.
 */

import './ActionBar.css';

interface ActionBarProps {
  readonly onAddClick: () => void;
  readonly onDeleteClick: () => void;
  readonly onExportClick: () => void;
  readonly selectedCount: number;
  readonly isDeleteDisabled: boolean;
  readonly isExportDisabled: boolean;
}

export function ActionBar({
  onAddClick,
  onDeleteClick,
  onExportClick,
  selectedCount,
  isDeleteDisabled,
  isExportDisabled,
}: ActionBarProps) {
  const deleteButtonClasses = [
    'action-bar__button',
    'action-bar__button--danger',
    isDeleteDisabled ? 'action-bar__button--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const exportButtonClasses = [
    'action-bar__button',
    'action-bar__button--secondary',
    isExportDisabled ? 'action-bar__button--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="action-bar" id="action-bar" role="toolbar" aria-label="Expense actions">
      <button
        id="add-expense-button"
        className="action-bar__button action-bar__button--primary"
        onClick={onAddClick}
        type="button"
      >
        <span className="action-bar__button-icon" aria-hidden="true">+</span>
        Add Expense
      </button>

      <button
        id="delete-expense-button"
        className={deleteButtonClasses}
        onClick={onDeleteClick}
        disabled={isDeleteDisabled}
        type="button"
        aria-label={`Delete ${selectedCount} selected expense${selectedCount !== 1 ? 's' : ''}`}
      >
        <span className="action-bar__button-icon" aria-hidden="true">🗑️</span>
        Delete Expense
        {selectedCount > 0 && (
          <span className="action-bar__badge" aria-hidden="true">
            {selectedCount}
          </span>
        )}
      </button>

      <button
        id="export-csv-button"
        className={exportButtonClasses}
        onClick={onExportClick}
        disabled={isExportDisabled}
        type="button"
        aria-label="Export all expenses as CSV"
      >
        <span className="action-bar__button-icon" aria-hidden="true">⬇</span>
        Export CSV
      </button>
    </div>
  );
}
