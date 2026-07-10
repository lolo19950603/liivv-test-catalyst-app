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
  --liivv-header-utility-cluster-width: 21rem;
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
