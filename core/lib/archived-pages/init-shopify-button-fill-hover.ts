const BUTTON_SELECTOR =
  '[data-button-hover="standard"] .button:not([disabled], .self-button)';

const FILL_TRANSITION =
  'transform var(--animation-primary, 0.5s cubic-bezier(0.3, 1, 0.3, 1))';

/** Hidden above the button (archive default). */
const FILL_HIDDEN = 'translate3d(0, -76%, 0)';
/** Resting fill position on hover. */
const FILL_VISIBLE = 'translate3d(0, 0, 0)';
/** Exit downward on unhover (curved edge moves down). */
const FILL_EXIT = 'translate3d(0, 76%, 0)';

const exitListenerByFill = new WeakMap<HTMLElement, (event: TransitionEvent) => void>();
const boundButtons = new WeakSet<HTMLElement>();

function fillForButton(button: Element): HTMLElement | null {
  const fill = button.querySelector('.btn-fill');

  if (fill == null || fill.classList.contains('sf-hidden')) {
    return null;
  }

  return fill as HTMLElement;
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
  fill.style.transition = FILL_TRANSITION;
  fill.style.transform = FILL_VISIBLE;
}

function hideFill(fill: HTMLElement): void {
  clearExitListener(fill);

  const onTransitionEnd = (event: TransitionEvent): void => {
    if (event.propertyName !== 'transform') {
      return;
    }

    clearExitListener(fill);
    fill.style.transition = 'none';
    fill.style.transform = FILL_HIDDEN;
  };

  exitListenerByFill.set(fill, onTransitionEnd);
  fill.addEventListener('transitionend', onTransitionEnd);
  fill.style.transition = FILL_TRANSITION;
  fill.style.transform = FILL_EXIT;
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

function scanButtons(root: ParentNode): void {
  root.querySelectorAll(BUTTON_SELECTOR).forEach((button) => {
    bindButton(button as HTMLElement);
  });
}

/**
 * Curved circle fill: enters from above (top → bottom), exits downward on leave.
 */
export function initShopifyButtonFillHover(root: ParentNode = document): () => void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    return () => undefined;
  }

  scanButtons(root);

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (node.matches(BUTTON_SELECTOR)) {
            bindButton(node);
          }

          scanButtons(node);
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
