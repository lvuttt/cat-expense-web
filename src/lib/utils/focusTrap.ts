export const focusTrap = (node: HTMLElement, isOpen: boolean) => {
  const FOCUSABLE_SELECTOR =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusable = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute('disabled'));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  let active = false;

  const activate = () => {
    if (active) return;
    node.addEventListener('keydown', handleKeyDown);
    active = true;
  };

  const deactivate = () => {
    if (!active) return;
    node.removeEventListener('keydown', handleKeyDown);
    active = false;
  };

  if (isOpen) {
    activate();
  }

  return {
    update(newIsOpen: boolean) {
      if (newIsOpen) {
        activate();
      } else {
        deactivate();
      }
    },
    destroy() {
      deactivate();
    },
  };
};
