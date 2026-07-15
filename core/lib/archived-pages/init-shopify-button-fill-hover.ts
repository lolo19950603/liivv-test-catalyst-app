/** Includes disabled buttons so enabling later (e.g. timeline prev arrow) still has listeners. */
const BUTTON_BIND_SELECTOR =
  '[data-button-hover="standard"] .button:not(.self-button)';

type FillState = 'visible' | 'exit' | 'hidden';

function isButtonHoverable(button: HTMLElement): boolean {
  return (
    !button.disabled &&
    !button.classList.contains('self-button') &&
    button.closest('[data-button-hover="standard"]') != null
  );
}

const exitListenerByFill = new WeakMap<HTMLElement, (event: TransitionEvent) => void>();
const boundButtons = new WeakSet<HTMLElement>();

function fillForButton(button: Element): HTMLElement | null {
  const fill = button.querySelector('.btn-fill');

  if (fill == null || fill.classList.contains('sf-hidden')) {
    return null;
  }

  return fill as HTMLElement;
}

function setFillState(fill: HTMLElement, state: FillState | null): void {
  if (state == null) {
    fill.removeAttribute('data-fill-state');
    return;
  }

  fill.setAttribute('data-fill-state', state);
}

function clearExitListener(fill: HTMLElement): void {
  const listener = exitListenerByFill.get(fill);

  if (listener != null) {
    fill.removeEventListener('transitionend', listener);
    exitListenerByFill.delete(fill);
  }
}

function showFill(fill: HTMLElement): void {
  clearExitListener(fill);
  setFillState(fill, 'visible');
}

function hideFill(fill: HTMLElement): void {
  clearExitListener(fill);

  const onTransitionEnd = (event: TransitionEvent): void => {
    if (event.propertyName !== 'transform') {
      return;
    }

    clearExitListener(fill);
    // Snap back above the button without animating upward.
    setFillState(fill, 'hidden');
  };

  exitListenerByFill.set(fill, onTransitionEnd);
  fill.addEventListener('transitionend', onTransitionEnd);
  setFillState(fill, 'exit');
}

function bindButton(button: HTMLElement): void {
  if (boundButtons.has(button)) {
    return;
  }

  const fill = fillForButton(button);

  if (fill == null) {
    return;
  }

  boundButtons.add(button);
  button.removeAttribute('data-dc-fill-bound');

  const onEnter = (): void => {
    if (!isButtonHoverable(button)) {
      return;
    }

    const currentFill = fillForButton(button);

    if (currentFill == null) {
      return;
    }

    showFill(currentFill);
  };

  const onLeave = (): void => {
    const currentFill = fillForButton(button);

    if (currentFill == null) {
      return;
    }

    hideFill(currentFill);
  };

  button.addEventListener('mouseenter', onEnter);
  button.addEventListener('mouseleave', onLeave);
  button.addEventListener('focusin', () => {
    if (button.matches(':focus-visible')) {
      onEnter();
    }
  });
  button.addEventListener('focusout', onLeave);
}

export function scanShopifyButtonFillHover(root: ParentNode = document): void {
  root.querySelectorAll(BUTTON_BIND_SELECTOR).forEach((button) => {
    bindButton(button as HTMLElement);
  });
}

/**
 * Curved circle fill: enters from above (top → bottom), exits downward on leave.
 * Uses `data-fill-state` instead of inline styles so React hydration stays clean.
 */
export function initShopifyButtonFillHover(root: ParentNode = document): () => void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    return () => undefined;
  }

  scanShopifyButtonFillHover(root);

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (node.matches(BUTTON_BIND_SELECTOR)) {
            bindButton(node);
          }

          scanShopifyButtonFillHover(node);
        }
      });
    });
  });

  mutationObserver.observe(root instanceof Document ? root.body : root, {
    childList: true,
    subtree: true,
  });

  return () => {
    mutationObserver.disconnect();
  };
}
