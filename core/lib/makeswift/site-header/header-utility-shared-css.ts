/**
 * Shared header utility icon + badge styling for:
 * - Storefront archive header (`.header-utility-icon-btn`)
 * - Account dashboard (`.mhd-icon-btn`)
 */
export const LIIVV_HEADER_UTILITY_SHARED_CSS = `
:root {
  --liivv-header-utility-size: 2.75rem;
  --liivv-header-utility-icon-size: 1.35rem;
  --liivv-header-utility-gap: 0.5rem;
  --liivv-header-utility-inline-end: var(--page-padding, 1.25rem);
  --liivv-header-utility-offset-block: clamp(1.5rem, 3vw, 2rem);
  --liivv-header-utility-cluster-width: 27rem;
  --liivv-header-utility-badge-size: 1.125rem;
  --liivv-header-utility-badge-font-size: 0.625rem;
  --liivv-header-utility-badge-alert-bg: #dc2626;
  --liivv-header-utility-badge-count-bg: rgb(49 47 47);
}

@media screen and (min-width: 768px) {
  :root {
    --liivv-header-utility-gap: 0.625rem;
  }
}

/* Shared EN/FR locale toggle (storefront header + account dashboard). */
.header-locale-toggle {
  --locale-toggle-pad: 0.125rem;
  --locale-toggle-fg: var(--color-foreground, var(--mhd-text, 49 47 47));
  --locale-toggle-bg: var(--color-background, var(--mhd-white, 255 255 255));
  position: relative;
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  align-items: stretch;
  height: var(--liivv-header-utility-size, 2.75rem);
  min-height: var(--liivv-header-utility-size, 2.75rem);
  padding: var(--locale-toggle-pad);
  border-radius: 999px;
  border: 1px solid rgb(var(--locale-toggle-fg) / 0.12);
  background: rgb(var(--locale-toggle-bg));
  flex-shrink: 0;
  overflow: hidden;
  transition: border-color 0.2s ease;
}
.header-locale-toggle.is-pending {
  pointer-events: none;
}
.header-locale-toggle__thumb {
  position: absolute;
  top: var(--locale-toggle-pad);
  left: var(--locale-toggle-pad);
  bottom: var(--locale-toggle-pad);
  border-radius: 999px;
  background: rgb(var(--locale-toggle-fg));
  transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
  pointer-events: none;
  z-index: 0;
}
@media (prefers-reduced-motion: reduce) {
  .header-locale-toggle__thumb {
    transition: none;
  }
}
.header-locale-toggle__option {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.25rem;
  padding-inline: 0.7rem;
  margin: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgb(var(--locale-toggle-fg) / 0.55);
  font-family: var(--font-navigation-family, var(--font-sans));
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: 1;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s ease;
}
.header-locale-toggle__option.is-active {
  color: rgb(var(--locale-toggle-bg));
  cursor: default;
}
.header-locale-toggle__option:not(.is-active):hover,
.header-locale-toggle__option:not(.is-active):focus-visible {
  color: rgb(var(--locale-toggle-fg));
  outline: none;
}
.header-locale-toggle__option:focus-visible {
  box-shadow: inset 0 0 0 2px rgb(var(--locale-toggle-fg) / 0.35);
}

.header-utility-badge,
.mhd-badge,
.mhd-icon-btn__badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--liivv-header-utility-badge-size);
  height: var(--liivv-header-utility-badge-size);
  padding: 0 0.25rem;
  border-radius: 999px;
  font-size: var(--liivv-header-utility-badge-font-size);
  font-weight: 700;
  line-height: 1;
  z-index: 2;
  color: #ffffff;
}

.header-utility-badge,
.mhd-badge {
  background: var(--liivv-header-utility-badge-alert-bg);
  box-shadow: 0 0 0 2px rgb(var(--color-background, 255 255 255));
}

.header-utility-badge--count,
.mhd-icon-btn__badge {
  background: var(--liivv-header-utility-badge-count-bg);
  box-shadow: 0 0 0 2px rgb(var(--color-background, 255 255 255));
}

#liivv-account-dashboard .mhd-badge,
#liivv-account-dashboard .mhd-icon-btn__badge {
  box-shadow: 0 0 0 2px rgb(var(--mhd-white));
}
`;
