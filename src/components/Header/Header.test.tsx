import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Header } from './Header';

describe('Header component', () => {
  afterEach(() => {
    cleanup();
  });
  it('should render application branding elements', () => {
    render(<Header />);

    // Check emoji logo is rendered
    expect(screen.getByText('🐱')).toBeDefined();

    // Check title text
    expect(screen.getByRole('heading', { level: 1, name: 'Cat Expense' })).toBeDefined();

    // Check subtitle
    expect(screen.getByText(/Track your feline friend/i)).toBeDefined();
  });
});
