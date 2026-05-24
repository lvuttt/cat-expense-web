import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ActionBar } from './ActionBar';

const defaultProps = {
  onAddClick: () => {},
  onDeleteClick: () => {},
  onExportClick: () => {},
  selectedCount: 0,
  isDeleteDisabled: true,
  isExportDisabled: false,
};

describe('ActionBar component', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render actions toolbar and all three buttons', () => {
    render(<ActionBar {...defaultProps} />);

    expect(screen.getByRole('toolbar', { name: /Expense actions/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Add Expense/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Delete 0 selected expenses/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Export all expenses as CSV/i })).toBeDefined();
  });

  it('should trigger onAddClick when Add button is clicked', () => {
    const onAddClick = vi.fn();
    render(<ActionBar {...defaultProps} onAddClick={onAddClick} />);

    screen.getByRole('button', { name: /Add Expense/i }).click();
    expect(onAddClick).toHaveBeenCalledTimes(1);
  });

  it('should disable Delete button when isDeleteDisabled is true', () => {
    const onDeleteClick = vi.fn();
    render(<ActionBar {...defaultProps} onDeleteClick={onDeleteClick} isDeleteDisabled={true} />);

    const deleteBtn = screen.getByRole('button', { name: /Delete 0 selected expenses/i });
    expect(deleteBtn.hasAttribute('disabled')).toBe(true);

    deleteBtn.click();
    expect(onDeleteClick).not.toHaveBeenCalled();
  });

  it('should enable Delete button, show badge, and call onDeleteClick when clicked', () => {
    const onDeleteClick = vi.fn();
    render(
      <ActionBar
        {...defaultProps}
        onDeleteClick={onDeleteClick}
        selectedCount={3}
        isDeleteDisabled={false}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /Delete 3 selected expenses/i });
    expect(deleteBtn.hasAttribute('disabled')).toBe(false);
    expect(screen.getByText('3')).toBeDefined();

    deleteBtn.click();
    expect(onDeleteClick).toHaveBeenCalledTimes(1);
  });

  it('should trigger onExportClick when Export CSV button is clicked', () => {
    const onExportClick = vi.fn();
    render(<ActionBar {...defaultProps} onExportClick={onExportClick} isExportDisabled={false} />);

    screen.getByRole('button', { name: /Export all expenses as CSV/i }).click();
    expect(onExportClick).toHaveBeenCalledTimes(1);
  });

  it('should disable Export button when isExportDisabled is true', () => {
    const onExportClick = vi.fn();
    render(<ActionBar {...defaultProps} onExportClick={onExportClick} isExportDisabled={true} />);

    const exportBtn = screen.getByRole('button', { name: /Export all expenses as CSV/i });
    expect(exportBtn.hasAttribute('disabled')).toBe(true);

    exportBtn.click();
    expect(onExportClick).not.toHaveBeenCalled();
  });
});
