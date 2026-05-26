import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import VirtualListTestHost from '../test/VirtualListTestHost.svelte';
import type { createVirtualList } from './virtualList.svelte';

// Mock ResizeObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
  unobserve: vi.fn(),
}));

describe('virtualList.svelte', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  interface DummyItem {
    id: string;
    value: string;
  }

  const items: DummyItem[] = [
    { id: '1', value: 'Item 1' },
    { id: '2', value: 'Item 2' },
    { id: '3', value: 'Item 3' },
    { id: '4', value: 'Item 4' },
    { id: '5', value: 'Item 5' },
  ];

  it('should initialize with default heights and offsets', () => {
    let listInstance!: ReturnType<typeof createVirtualList<DummyItem>>;
    render(VirtualListTestHost, {
      props: {
        getItems: () => items,
        getItemId: (item: unknown) => (item as DummyItem).id,
        defaultHeight: 50,
        buffer: 1,
        testFn: (list: unknown) => {
          listInstance = list as ReturnType<
            typeof createVirtualList<DummyItem>
          >;
        },
      },
    });

    expect(listInstance.totalHeight).toBe(250); // 5 * 50
    expect(listInstance.visibleItems.length).toBe(items.length);
    expect(listInstance.visibleItems[0].offset).toBe(0);
    expect(listInstance.visibleItems[1].offset).toBe(50);
    expect(listInstance.visibleItems[2].offset).toBe(100);
    expect(listInstance.getItemHeight('1')).toBe(50);
  });

  it('should adjust height and offsets when measuring rows', () => {
    let listInstance!: ReturnType<typeof createVirtualList<DummyItem>>;
    render(VirtualListTestHost, {
      props: {
        getItems: () => items,
        getItemId: (item: unknown) => (item as DummyItem).id,
        defaultHeight: 50,
        buffer: 1,
        testFn: (list: unknown) => {
          listInstance = list as ReturnType<
            typeof createVirtualList<DummyItem>
          >;
        },
      },
    });

    // Measure item 1 to be 80px, item 2 to be 60px
    listInstance.measureRow('1', 80);
    listInstance.measureRow('2', 60);

    expect(listInstance.getItemHeight('1')).toBe(80);
    expect(listInstance.getItemHeight('2')).toBe(60);
    expect(listInstance.getItemHeight('3')).toBe(50);

    // Offset of item 1 is 0
    // Offset of item 2 is 0 + 80 = 80
    // Offset of item 3 is 80 + 60 = 140
    // Offset of item 4 is 140 + 50 = 190
    // Offset of item 5 is 190 + 50 = 240
    // Total height = 240 + 50 = 290
    expect(listInstance.totalHeight).toBe(290);
    expect(listInstance.visibleItems[0].offset).toBe(0);
    expect(listInstance.visibleItems[1].offset).toBe(80);
    expect(listInstance.visibleItems[2].offset).toBe(140);
    expect(listInstance.visibleItems[3].offset).toBe(190);
    expect(listInstance.visibleItems[4].offset).toBe(240);
  });

  it('should return empty list when items are empty', () => {
    let listInstance!: ReturnType<typeof createVirtualList<DummyItem>>;
    render(VirtualListTestHost, {
      props: {
        getItems: () => [] as DummyItem[],
        getItemId: (item: unknown) => (item as DummyItem).id,
        defaultHeight: 50,
        buffer: 1,
        testFn: (list: unknown) => {
          listInstance = list as ReturnType<
            typeof createVirtualList<DummyItem>
          >;
        },
      },
    });
    expect(listInstance.totalHeight).toBe(0);
    expect(listInstance.visibleItems).toEqual([]);
  });
});
