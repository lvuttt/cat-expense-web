import type { SortField, SortConfig } from '../types';
import { toggleSortDirection } from '../utils/sortUtils';

export const createSort = (defaultField: SortField = 'name') => {
  let sortConfig = $state<SortConfig>({
    field: defaultField,
    direction: 'asc',
  });

  function handleSort(field: SortField): void {
    if (sortConfig.field === field) {
      sortConfig = {
        field,
        direction: toggleSortDirection(sortConfig.direction),
      };
    } else {
      sortConfig = { field, direction: 'asc' };
    }
  }

  return {
    get sortConfig() {
      return sortConfig;
    },
    handleSort,
  };
};
