export interface VisibleItem<T> {
  readonly item: T;
  readonly originalIndex: number;
  readonly offset: number;
}

export const createVirtualList = <T>(
  getItems: () => readonly T[],
  getItemId: (item: T) => string,
  defaultHeight: number,
  buffer: number = 5,
) => {
  let container = $state<HTMLDivElement | null>(null);
  let scrollTop = $state(0);
  let clientHeight = $state(400);
  const measuredHeights = $state<Record<string, number>>({});

  $effect(() => {
    if (!container) return;

    const updateMeasurements = () => {
      if (container) {
        scrollTop = container.scrollTop;
        clientHeight = container.clientHeight;
      }
    };

    updateMeasurements();

    container.addEventListener('scroll', updateMeasurements, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateMeasurements();
      });
      resizeObserver.observe(container);
    }

    return () => {
      container?.removeEventListener('scroll', updateMeasurements);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  });

  const offsets = $derived.by<number[]>(() => {
    const items = getItems();
    const listOffsets: number[] = [];
    let currentOffset = 0;
    for (let i = 0; i < items.length; i++) {
      listOffsets.push(currentOffset);
      const id = getItemId(items[i]);
      const height = measuredHeights[id] ?? defaultHeight;
      currentOffset += height;
    }
    return listOffsets;
  });

  const totalHeight = $derived.by<number>(() => {
    const items = getItems();
    if (items.length === 0) return 0;
    const lastIndex = items.length - 1;
    const lastId = getItemId(items[lastIndex]);
    const lastHeight = measuredHeights[lastId] ?? defaultHeight;
    return offsets[lastIndex] + lastHeight;
  });

  const visibleItems = $derived.by<Array<VisibleItem<T>>>(() => {
    const items = getItems();
    if (items.length === 0) {
      return [];
    }

    // Find first item that is visible or overlapping scrollTop
    let startIndex = 0;
    for (let i = 0; i < items.length; i++) {
      const id = getItemId(items[i]);
      const height = measuredHeights[id] ?? defaultHeight;
      if (offsets[i] + height >= scrollTop) {
        startIndex = i;
        break;
      }
    }
    startIndex = Math.max(0, startIndex - buffer);

    // Find first item that starts after the viewport end
    let endIndex = items.length;
    for (let i = startIndex; i < items.length; i++) {
      if (offsets[i] > scrollTop + clientHeight) {
        endIndex = i;
        break;
      }
    }
    endIndex = Math.min(items.length, endIndex + buffer);

    const result: Array<VisibleItem<T>> = [];
    for (let i = startIndex; i < endIndex; i++) {
      result.push({
        item: items[i],
        originalIndex: i,
        offset: offsets[i],
      });
    }
    return result;
  });

  const measureRow = (id: string, height: number): void => {
    if (measuredHeights[id] !== height) {
      measuredHeights[id] = height;
    }
  };

  const getItemHeight = (id: string): number => {
    return measuredHeights[id] ?? defaultHeight;
  };

  return {
    get container() {
      return container;
    },
    set container(val) {
      container = val;
    },
    get visibleItems() {
      return visibleItems;
    },
    get totalHeight() {
      return totalHeight;
    },
    measureRow,
    getItemHeight,
  };
};
