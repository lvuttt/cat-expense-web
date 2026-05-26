import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ActionBar from './ActionBar.svelte';

const renderBar = (
  overrides: Partial<{
    selectedCount: number;
    isDeleteDisabled: boolean;
    isExportDisabled: boolean;
  }> = {},
) => {
  const onAddClick = vi.fn();
  const onDeleteClick = vi.fn();
  const onExportClick = vi.fn();

  render(ActionBar, {
    props: {
      selectedCount: 0,
      isDeleteDisabled: true,
      isExportDisabled: true,
      onAddClick,
      onDeleteClick,
      onExportClick,
      ...overrides,
    },
  });

  return { onAddClick, onDeleteClick, onExportClick };
};

describe('ActionBar', () => {
  it('renders action buttons in the toolbar', () => {
    renderBar();

    expect(
      screen.getByRole('toolbar', { name: 'Expense actions' }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add Expense' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Delete 0 selected expenses' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Export all expenses as CSV' }),
    ).toBeTruthy();
  });

  it('shows selection badge when items are selected', () => {
    renderBar({ selectedCount: 3, isDeleteDisabled: false });

    expect(screen.getByText('3')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Delete 3 selected expenses' }),
    ).toBeTruthy();
  });

  it('disables delete and export when configured', () => {
    renderBar({ isDeleteDisabled: true, isExportDisabled: true });

    expect(screen.getByRole('button', { name: /Delete/ })).toHaveProperty(
      'disabled',
      true,
    );
    expect(
      screen.getByRole('button', { name: 'Export all expenses as CSV' }),
    ).toHaveProperty('disabled', true);
  });

  it('invokes action callbacks when buttons are clicked', async () => {
    const { onAddClick, onDeleteClick, onExportClick } = renderBar({
      isDeleteDisabled: false,
      isExportDisabled: false,
    });

    await fireEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
    await fireEvent.click(
      screen.getByRole('button', { name: 'Delete 0 selected expenses' }),
    );
    await fireEvent.click(
      screen.getByRole('button', { name: 'Export all expenses as CSV' }),
    );

    expect(onAddClick).toHaveBeenCalledOnce();
    expect(onDeleteClick).toHaveBeenCalledOnce();
    expect(onExportClick).toHaveBeenCalledOnce();
  });
});
