import { describe, it, expect, vi } from 'vitest';
import { focusTrap } from './focusTrap';

describe('focusTrap action', () => {
  it('adds and removes keydown event listener', () => {
    const el = document.createElement('div');
    const spyAdd = vi.spyOn(el, 'addEventListener');
    const spyRemove = vi.spyOn(el, 'removeEventListener');

    // Activate when open
    const action = focusTrap(el, true);
    expect(spyAdd).toHaveBeenCalledWith('keydown', expect.any(Function));

    // Update to false
    action.update(false);
    expect(spyRemove).toHaveBeenCalledWith('keydown', expect.any(Function));

    // Update back to true
    action.update(true);
    expect(spyAdd).toHaveBeenCalledTimes(2);

    // Destroy
    action.destroy();
    expect(spyRemove).toHaveBeenCalledTimes(2);
  });
});
