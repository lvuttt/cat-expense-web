/**
 * useSelection — Checkbox selection state management.
 *
 * Single Responsibility: manages which items are selected.
 * Separated from expense state to keep concerns isolated.
 */

import { useState, useCallback, useMemo } from 'react';

interface UseSelectionReturn {
  readonly selectedIds: Set<string>;
  readonly selectedCount: number;
  readonly isAllSelected: boolean;
  readonly isSomeSelected: boolean;
  readonly isSelected: (id: string) => boolean;
  readonly toggle: (id: string) => void;
  readonly toggleAll: () => void;
  readonly clearSelection: () => void;
}

export function useSelection(itemIds: string[]): UseSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      // If all are selected, deselect all; otherwise select all
      const allSelected =
        itemIds.length > 0 && itemIds.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(itemIds);
    });
  }, [itemIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  const isAllSelected = useMemo(
    () => itemIds.length > 0 && itemIds.every((id) => selectedIds.has(id)),
    [itemIds, selectedIds],
  );

  const isSomeSelected = useMemo(
    () => itemIds.some((id) => selectedIds.has(id)),
    [itemIds, selectedIds],
  );

  const selectedCount = useMemo(() => {
    // Only count IDs that still exist in itemIds (handles stale selections after delete)
    return itemIds.filter((id) => selectedIds.has(id)).length;
  }, [itemIds, selectedIds]);

  return {
    selectedIds,
    selectedCount,
    isAllSelected,
    isSomeSelected,
    isSelected,
    toggle,
    toggleAll,
    clearSelection,
  };
}
