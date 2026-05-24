import { useState, useEffect, useMemo, useRef } from 'react';

interface UseVirtualListParams<T> {
  readonly items: readonly T[];
  readonly rowHeight: number;
  readonly buffer?: number;
}

interface VisibleItem<T> {
  readonly item: T;
  readonly originalIndex: number;
}

interface UseVirtualListReturn<T> {
  readonly containerRef: React.RefObject<HTMLDivElement | null>;
  readonly visibleItems: Array<VisibleItem<T>>;
  readonly totalHeight: number;
}

/**
 * useVirtualList — Container-scroll based list virtualization hook.
 *
 * SRP: Manages visible item window slicing based on container scroll and heights.
 * Performance: Maintains 60 FPS by rendering only visible rows on screen.
 */
export function useVirtualList<T>({
  items,
  rowHeight,
  buffer = 5,
}: UseVirtualListParams<T>): UseVirtualListReturn<T> {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(400); // 400px default fallback layout height

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateMeasurements = () => {
      setScrollTop(container.scrollTop);
      setClientHeight(container.clientHeight);
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
      container.removeEventListener('scroll', updateMeasurements);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  const result = useMemo(() => {
    if (items.length === 0) {
      return {
        visibleItems: [],
        totalHeight: 0,
      };
    }

    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + clientHeight) / rowHeight) + buffer,
    );

    const visibleItems = items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      originalIndex: startIndex + index,
    }));

    const totalHeight = items.length * rowHeight;

    return {
      visibleItems,
      totalHeight,
    };
  }, [items, rowHeight, scrollTop, clientHeight, buffer]);

  return {
    containerRef,
    ...result,
  };
}
