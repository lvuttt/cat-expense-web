import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ErrorBoundaryHost from '$lib/test/ErrorBoundaryHost.svelte';

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders child content when no error occurred', () => {
    render(ErrorBoundaryHost);

    expect(screen.getByTestId('child-content')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows fallback UI when a window error is caught', async () => {
    render(ErrorBoundaryHost);

    window.dispatchEvent(
      new ErrorEvent('error', { error: new Error('Test failure') }),
    );

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(
      screen.getByText('The cat knocked something over. Please try again.'),
    ).toBeTruthy();
    expect(screen.queryByTestId('child-content')).toBeNull();
  });

  it('restores child content when Try Again is clicked', async () => {
    render(ErrorBoundaryHost);

    window.dispatchEvent(
      new ErrorEvent('error', { error: new Error('Test failure') }),
    );
    await screen.findByRole('alert');

    await fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));

    expect(screen.getByTestId('child-content')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
