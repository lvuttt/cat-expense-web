import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

const ProblemChild = ({ shouldCrash }: { shouldCrash: boolean }) => {
  if (shouldCrash) {
    throw new Error('Test Render Crash');
  }
  return <div>Healthy Child</div>;
};

describe('ErrorBoundary component', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Prevent Vitest/jsdom from printing the expected boundary crash error stack trace to console
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    cleanup();
  });

  it('should render children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldCrash={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Healthy Child')).toBeDefined();
  });

  it('should intercept render crashes and display the fallback UI', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldCrash={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('😿')).toBeDefined();
    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText(/The cat knocked something over/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeDefined();
  });

  it('should attempt to recover when Try Again is clicked', () => {
    const TestWrapper = () => {
      const [shouldCrash, setShouldCrash] = useState(true);
      return (
        <div>
          <ErrorBoundary>
            <ProblemChild shouldCrash={shouldCrash} />
          </ErrorBoundary>
          <button onClick={() => setShouldCrash(false)}>Fix Child</button>
        </div>
      );
    };

    render(<TestWrapper />);

    expect(screen.getByText('Something went wrong')).toBeDefined();

    // Click Fix Child to change the state/props of the child
    fireEvent.click(screen.getByRole('button', { name: 'Fix Child' }));

    // Click retry
    fireEvent.click(screen.getByRole('button', { name: /Try Again/i }));

    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('Healthy Child')).toBeDefined();
  });
});
