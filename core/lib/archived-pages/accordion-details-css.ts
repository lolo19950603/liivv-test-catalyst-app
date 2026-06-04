/**
 * Archive FAQ accordion: height expand/collapse, + icon rotation, and content fade
 * (pairs with accordion-details-element).
 * Overrides generic `.details[aria-expanded=true]` icon scale so the plus rotates 45° instead.
 */
export const ACCORDION_DETAILS_CSS = `
.accordion .details.details,
.accordions .details.details {
  transition: height var(--animation-primary, 0.5s cubic-bezier(0.3, 1, 0.3, 1));
}

.accordion .details .details__summary > .icon,
.accordions .details .details__summary > .icon {
  --tw-scale-y: -1;
  --tw-rotate: 0deg;
  transform: scaleY(var(--tw-scale-y)) rotate(var(--tw-rotate));
  transition: transform var(--animation-primary, 0.5s cubic-bezier(0.3, 1, 0.3, 1));
}

.accordion .details[aria-expanded='true'] .details__summary > .icon,
.accordion .details[open] .details__summary > .icon,
.accordions .details[aria-expanded='true'] .details__summary > .icon,
.accordions .details[open] .details__summary > .icon {
  --tw-scale-y: -1;
  --tw-rotate: 45deg;
}

.accordion .details .details__content,
.accordions .details .details__content {
  transition:
    opacity var(--animation-primary, 0.5s cubic-bezier(0.3, 1, 0.3, 1)),
    transform var(--animation-primary, 0.5s cubic-bezier(0.3, 1, 0.3, 1));
}

/* Steady open state — no inline styles (avoids hydration mismatches). */
.accordion .details[open] .details__content,
.accordion .details[aria-expanded='true'] .details__content,
.accordions .details[open] .details__content,
.accordions .details[aria-expanded='true'] .details__content {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .accordion .details.details,
  .accordions .details.details {
    transition: none;
  }

  .accordion .details .details__content,
  .accordions .details .details__content {
    transition: none;
  }

  .accordion .details .details__summary > .icon,
  .accordions .details .details__summary > .icon {
    transition: none;
  }
}
`;
