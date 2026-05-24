import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, render, screen, act } from '@testing-library/react';
import React from 'react';
import { useVirtualList } from './useVirtualList';

// Mock ResizeObserver globally for the test environment
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = MockResizeObserver;

describe('useVirtualList hook', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
  const rowHeight = 50;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial slice on mount', () => {
    const { result } = renderHook(() =>
      useVirtualList({ items: mockItems, rowHeight }),
    );

    // Initial load before element reference is measured (using fallback clientHeight of 400)
    // startIndex = max(0, floor(0/50) - 5) = 0
    // endIndex = min(100, ceil(400/50) + 5) = 13
    expect(result.current.visibleItems.length).toBe(13);
    expect(result.current.totalHeight).toBe(5000);
  });

  it('should calculate scroll bounds when element reference is measured', () => {
    let hookResult: ReturnType<typeof useVirtualList<string>> | null = null;

    function TestComponent() {
      const result = useVirtualList({ items: mockItems, rowHeight, buffer: 2 });
      hookResult = result;
      
      return React.createElement(
        'div',
        {
          'data-testid': 'scroll-container',
          ref: result.containerRef,
          style: { height: '500px', overflowY: 'auto' }
        },
        result.visibleItems.map(({ item, originalIndex }) =>
          React.createElement(
            'div',
            { key: originalIndex, style: { height: '50px' } },
            item
          )
        )
      );
    }

    render(React.createElement(TestComponent));

    const containerDiv = screen.getByTestId('scroll-container');

    // Mock dimensions on the container
    Object.defineProperty(containerDiv, 'scrollTop', { value: 200, writable: true, configurable: true });
    Object.defineProperty(containerDiv, 'clientHeight', { value: 500, writable: true, configurable: true });

    // Trigger update by sending scroll event on the container
    act(() => {
      containerDiv.dispatchEvent(new Event('scroll'));
    });

    // Cast the asynchronously captured result through unknown to satisfy strict TSC narrowing
    const result = hookResult as unknown as NonNullable<ReturnType<typeof useVirtualList<string>>>;

    // With scrollTop = 200, clientHeight = 500, rowHeight = 50, buffer = 2:
    // startIndex = max(0, floor(200/50) - 2) = 2
    // endIndex = min(100, ceil(700/50) + 2) = 16
    expect(result.visibleItems.length).toBe(14); // indices 2 to 15 (length 14)
    expect(result.totalHeight).toBe(5000);
  });
});
