import { SvelteSet } from 'svelte/reactivity';

export const createSelection = (getItemIds: () => string[]) => {
  const selectedIds = new SvelteSet<string>();

  const selectedCount = $derived.by(() => {
    const ids = getItemIds();
    return ids.filter((id) => selectedIds.has(id)).length;
  });

  const isAllSelected = $derived.by(() => {
    const ids = getItemIds();
    return ids.length > 0 && ids.every((id) => selectedIds.has(id));
  });

  const isSomeSelected = $derived.by(() => {
    const ids = getItemIds();
    return ids.some((id) => selectedIds.has(id));
  });

  const isSelected = (id: string): boolean => {
    return selectedIds.has(id);
  };

  const toggle = (id: string): void => {
    if (selectedIds.has(id)) {
      selectedIds.delete(id);
    } else {
      selectedIds.add(id);
    }
  };

  const toggleAll = (): void => {
    const ids = getItemIds();
    if (isAllSelected) {
      // Clear only those in ids to prevent clearing other values if any,
      // or clear all if that's standard. Let's match React behavior:
      // return allSelected ? new Set() : new Set(itemIds);
      selectedIds.clear();
    } else {
      for (const id of ids) {
        selectedIds.add(id);
      }
    }
  };

  const clearSelection = (): void => {
    selectedIds.clear();
  };

  return {
    get selectedIds() {
      return selectedIds;
    },
    get selectedCount() {
      return selectedCount;
    },
    get isAllSelected() {
      return isAllSelected;
    },
    get isSomeSelected() {
      return isSomeSelected;
    },
    isSelected,
    toggle,
    toggleAll,
    clearSelection,
  };
};
