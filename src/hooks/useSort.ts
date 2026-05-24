/**
 * useSort — Sort configuration state management.
 *
 * Single Responsibility: manages sort field and direction state.
 * Delegates the actual sorting to sortUtils.
 */

import { useState, useCallback } from 'react';
import type { SortField, SortConfig } from '../types';
import { toggleSortDirection } from '../utils/sortUtils';

interface UseSortReturn {
  readonly sortConfig: SortConfig;
  readonly handleSort: (field: SortField) => void;
}

export function useSort(defaultField: SortField = 'name'): UseSortReturn {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: defaultField,
    direction: 'asc',
  });

  const handleSort = useCallback(
    (field: SortField) => {
      setSortConfig((prev) => {
        if (prev.field === field) {
          // Same field — toggle direction
          return { field, direction: toggleSortDirection(prev.direction) };
        }
        // New field — default to ascending
        return { field, direction: 'asc' };
      });
    },
    [],
  );

  return { sortConfig, handleSort };
}
