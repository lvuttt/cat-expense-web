import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExpenses } from './useExpenses';
import type { Expense } from '../types';
import type { IStorageService } from '../services/storageService';

describe('useExpenses hook', () => {
  let mockStorage: IStorageService<Expense[]>;
  const seedExpenses: Expense[] = [
    { id: '1', name: 'Tuna', category: 'Food', amount: 10.0, createdAt: '2026-05-23T10:00:00Z' },
    { id: '2', name: 'Catnip', category: 'Accessory', amount: 5.0, createdAt: '2026-05-23T11:00:00Z' },
  ];

  beforeEach(() => {
    mockStorage = {
      load: vi.fn().mockReturnValue(seedExpenses),
      save: vi.fn(),
      clear: vi.fn(),
    };
  });

  it('should load initial expenses from the storage service', () => {
    const { result } = renderHook(() => useExpenses(mockStorage));
    expect(result.current.expenses).toEqual(seedExpenses);
    expect(mockStorage.load).toHaveBeenCalledTimes(1);
  });

  it('should return empty array if storage service has no data', () => {
    mockStorage.load = vi.fn().mockReturnValue(null);
    const { result } = renderHook(() => useExpenses(mockStorage));
    expect(result.current.expenses).toEqual([]);
  });

  it('should save data to storage on initialization and subsequent changes', () => {
    const { result } = renderHook(() => useExpenses(mockStorage));
    expect(mockStorage.save).toHaveBeenLastCalledWith(seedExpenses);

    act(() => {
      result.current.addExpense({ name: 'Scratcher', category: 'Furniture', amount: 45.5 });
    });

    expect(result.current.expenses.length).toBe(3);
    expect(mockStorage.save).toHaveBeenLastCalledWith(result.current.expenses);
  });

  it('should support adding a new expense', () => {
    const { result } = renderHook(() => useExpenses(mockStorage));

    act(() => {
      result.current.addExpense({ name: 'Treats', category: 'Food', amount: 12.5 });
    });

    expect(result.current.expenses[2]).toMatchObject({
      name: 'Treats',
      category: 'Food',
      amount: 12.5,
    });
    expect(result.current.expenses[2].id).toBeDefined();
    expect(result.current.expenses[2].createdAt).toBeDefined();
  });

  it('should support updating an existing expense', () => {
    const { result } = renderHook(() => useExpenses(mockStorage));

    act(() => {
      result.current.updateExpense('1', { name: 'Super Tuna', category: 'Food', amount: 15.0 });
    });

    expect(result.current.expenses[0]).toMatchObject({
      id: '1',
      name: 'Super Tuna',
      category: 'Food',
      amount: 15.0,
    });
  });

  it('should support deleting expenses', () => {
    const { result } = renderHook(() => useExpenses(mockStorage));

    act(() => {
      result.current.deleteExpenses(new Set(['1']));
    });

    expect(result.current.expenses.length).toBe(1);
    expect(result.current.expenses[0].id).toBe('2');
  });

  it('should support duplicating an expense', () => {
    const { result } = renderHook(() => useExpenses(mockStorage));

    act(() => {
      result.current.duplicateExpense('2');
    });

    expect(result.current.expenses.length).toBe(3);
    expect(result.current.expenses[2]).toMatchObject({
      name: 'Catnip',
      category: 'Accessory',
      amount: 5.0,
    });
    expect(result.current.expenses[2].id).not.toBe('2');
  });

  it('should correctly calculate derived totalAmount and topCategories', () => {
    const { result } = renderHook(() => useExpenses(mockStorage));
    expect(result.current.totalAmount).toBe(15.0); // 10 + 5
    expect(result.current.topCategories).toBeInstanceOf(Set);
    expect(result.current.topCategories.has('Food')).toBe(true);
  });
});
