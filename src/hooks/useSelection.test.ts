import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSelection } from './useSelection';

describe('useSelection hook', () => {
  const itemIds = ['1', '2', '3'];

  it('should initialize with empty selection and counts', () => {
    const { result } = renderHook(() => useSelection(itemIds));
    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.isSomeSelected).toBe(false);
  });

  it('should toggle individual item selection status', () => {
    const { result } = renderHook(() => useSelection(itemIds));

    act(() => {
      result.current.toggle('1');
    });

    expect(result.current.isSelected('1')).toBe(true);
    expect(result.current.selectedCount).toBe(1);
    expect(result.current.isSomeSelected).toBe(true);
    expect(result.current.isAllSelected).toBe(false);

    act(() => {
      result.current.toggle('1');
    });

    expect(result.current.isSelected('1')).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it('should toggle all items in unison', () => {
    const { result } = renderHook(() => useSelection(itemIds));

    act(() => {
      result.current.toggleAll();
    });

    expect(result.current.isAllSelected).toBe(true);
    expect(result.current.selectedCount).toBe(3);

    act(() => {
      result.current.toggleAll();
    });

    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it('should clear selection when clearSelection is called', () => {
    const { result } = renderHook(() => useSelection(itemIds));

    act(() => {
      result.current.toggle('1');
      result.current.toggle('2');
    });
    expect(result.current.selectedCount).toBe(2);

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedCount).toBe(0);
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('should filter out selected IDs that no longer exist in the provided itemIds list (stale ids)', () => {
    let currentIds = ['1', '2', '3'];
    const { result, rerender } = renderHook(() => useSelection(currentIds));

    act(() => {
      result.current.toggle('1');
      result.current.toggle('2');
    });

    expect(result.current.selectedCount).toBe(2);

    // Simulate item '1' being deleted, list is now ['2', '3']
    currentIds = ['2', '3'];
    rerender();

    expect(result.current.selectedCount).toBe(1);
    expect(result.current.isSelected('2')).toBe(true);
    expect(result.current.isSelected('1')).toBe(true); // ID '1' is still in internal Set but does not count toward selectedCount
  });
});
