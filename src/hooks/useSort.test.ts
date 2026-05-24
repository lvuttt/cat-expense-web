import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSort } from './useSort';

describe('useSort hook', () => {
  it('should initialize with default sort configurations', () => {
    const { result } = renderHook(() => useSort('name'));
    expect(result.current.sortConfig).toEqual({
      field: 'name',
      direction: 'asc',
    });
  });

  it('should toggle sort direction when sorting on the same field', () => {
    const { result } = renderHook(() => useSort('name'));

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortConfig).toEqual({
      field: 'name',
      direction: 'desc',
    });

    act(() => {
      result.current.handleSort('name');
    });

    expect(result.current.sortConfig).toEqual({
      field: 'name',
      direction: 'asc',
    });
  });

  it('should change field and default to asc direction when sorting a new field', () => {
    const { result } = renderHook(() => useSort('name'));

    // First toggle to desc on name
    act(() => {
      result.current.handleSort('name');
    });
    expect(result.current.sortConfig.direction).toBe('desc');

    // Sort by a new field
    act(() => {
      result.current.handleSort('amount');
    });

    expect(result.current.sortConfig).toEqual({
      field: 'amount',
      direction: 'asc',
    });
  });
});
