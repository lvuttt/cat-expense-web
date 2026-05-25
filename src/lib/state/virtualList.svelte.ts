export interface VisibleItem<T> {
  readonly item: T;
  readonly originalIndex: number;
}

export const createVirtualList = <T>(
  getItems: () => readonly T[],
  rowHeight: number,
  buffer: number = 5,
) => {
  let container = $state<HTMLDivElement | null>(null);
  let scrollTop = $state(0);
  let clientHeight = $state(400);

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

  const visibleItems = $derived.by<Array<VisibleItem<T>>>(() => {
    const items = getItems();
    if (items.length === 0) {
      return [];
    }

    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + clientHeight) / rowHeight) + buffer,
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      originalIndex: startIndex + index,
    }));
  });

  const totalHeight = $derived.by(() => getItems().length * rowHeight);

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
  };
};
