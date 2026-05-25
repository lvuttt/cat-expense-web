import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import CatFactPanel from './CatFactPanel.svelte';

describe('CatFactPanel', () => {
  it('displays the cat fact when not loading', () => {
    render(CatFactPanel, {
      props: {
        fact: 'Cats sleep 13–16 hours a day.',
        isLoading: false,
        onRefetch: vi.fn(),
      },
    });

    expect(screen.getByText('Cats sleep 13–16 hours a day.')).toBeTruthy();
    expect(screen.queryByText('Loading a purr-fect fact...')).toBeNull();
  });

  it('shows loading message and disables refresh while loading', () => {
    render(CatFactPanel, {
      props: {
        fact: 'Ignored while loading',
        isLoading: true,
        onRefetch: vi.fn(),
      },
    });

    expect(screen.getByText('Loading a purr-fect fact...')).toBeTruthy();
    expect(screen.queryByText('Ignored while loading')).toBeNull();

    const refreshButton = screen.getByRole('button', {
      name: 'Refresh cat fact',
    });
    expect(refreshButton).toHaveProperty('disabled', true);
    expect(refreshButton.className).toContain(
      'expense-dialog__cat-fact-refresh--spinning',
    );
  });

  it('calls onRefetch when refresh is clicked', async () => {
    const onRefetch = vi.fn();

    render(CatFactPanel, {
      props: {
        fact: 'A fact',
        isLoading: false,
        onRefetch,
      },
    });

    await fireEvent.click(
      screen.getByRole('button', { name: 'Refresh cat fact' }),
    );

    expect(onRefetch).toHaveBeenCalledOnce();
  });

  it('applies loading modifier class on the panel', () => {
    const { container } = render(CatFactPanel, {
      props: {
        fact: '',
        isLoading: true,
        onRefetch: vi.fn(),
      },
    });

    expect(
      container.querySelector('.expense-dialog__cat-fact--loading'),
    ).toBeTruthy();
  });
});
