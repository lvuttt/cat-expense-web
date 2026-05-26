import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import LayoutHost from '$lib/test/LayoutHost.svelte';

describe('+layout.svelte', () => {
  it('renders child content inside the layout shell', () => {
    render(LayoutHost);

    expect(screen.getByTestId('page-content')).toBeTruthy();
    expect(screen.getByText('Page body')).toBeTruthy();
  });
});
