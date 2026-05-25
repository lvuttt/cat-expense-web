import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Header from './Header.svelte';

describe('Header', () => {
  it('renders branding and subtitle', () => {
    render(Header);

    expect(screen.getByRole('banner')).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cat Expense' }),
    ).toBeTruthy();
    expect(
      screen.getByText("Track your feline friend's expenses with purr-fection"),
    ).toBeTruthy();
    expect(screen.getByText('🐱')).toBeTruthy();
  });
});
