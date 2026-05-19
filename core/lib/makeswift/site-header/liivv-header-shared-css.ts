/**
 * Shared Liivv / archive header look for:
 * - Catalyst store header (Soul Navigation) — `.liivv-store-header`
 * - Diabetes-care section header — `.diabetes-care-section-header.liivv-header-skin`
 *
 * Requires `diabetes-care-sections.css` for archive tokens (--border-radius, fonts, --header-nav-gap).
 */
export const LIIVV_HEADER_SHARED_CSS = `
/* Shared palette (archive header section vars) */
.liivv-header-skin {
  --liivv-header-bg: 255 255 255;
  --liivv-header-fg: 49 47 47;
  --liivv-header-icon-size: var(--sp-5d5, 1.375rem);
}

/* —— Global store header: match flat archive bar (not Soul “card”) —— */
.liivv-store-header.liivv-header-skin {
  width: 100%;
  background-color: rgb(var(--liivv-header-bg));
  --nav-background: rgb(var(--liivv-header-bg));
  --nav-mobile-background: rgb(var(--liivv-header-bg));
  --nav-menu-background: rgb(var(--liivv-header-bg));
  --nav-search-background: rgb(var(--liivv-header-bg));
  --nav-locale-background: rgb(var(--liivv-header-bg));
  --nav-link-text: rgb(var(--liivv-header-fg));
  --nav-link-text-hover: rgb(var(--liivv-header-fg));
  --nav-group-text: rgb(var(--liivv-header-fg));
  --nav-group-text-hover: rgb(var(--liivv-header-fg));
  --nav-button-icon: rgb(var(--liivv-header-fg));
  --nav-button-icon-hover: rgb(var(--liivv-header-fg));
  --nav-button-background: transparent;
  --nav-button-background-hover: transparent;
  --nav-link-background: transparent;
  --nav-link-background-hover: transparent;
  --nav-link-font-family: var(--font-navigation-family, var(--font-body-family, inherit));
  --nav-group-font-family: var(--font-navigation-family, var(--font-body-family, inherit));
  --nav-floating-border: transparent;
  --nav-cart-count-text: rgb(var(--liivv-header-bg));
  --nav-cart-count-background: rgb(var(--liivv-header-fg));
}

/* Headroom / HeaderSection wrappers — full bleed, no inset padding */
.liivv-store-header > div {
  width: 100%;
}

.liivv-store-header .p-2 {
  padding: 0 !important;
}

/* Navigation root: full width (not max-w-screen-2xl card) */
.liivv-store-header [class*='max-w-screen-2xl'] {
  max-width: none !important;
  width: 100%;
  margin-inline: 0 !important;
  padding-inline: var(--page-padding, 1.25rem);
}

/* Inner bar: flat white, archive header--left grid */
.liivv-store-header [class*='max-w-screen-2xl'] > div {
  width: 100%;
  border-radius: 0 !important;
  box-shadow: none !important;
  outline: none !important;
  --tw-ring-shadow: 0 0 #0000 !important;
  background-color: rgb(var(--liivv-header-bg)) !important;
  color: rgb(var(--liivv-header-fg));
  font-family: var(--font-navigation-family, inherit);
  font-size: var(--font-navigation-size, 1rem);
  font-weight: var(--font-navigation-weight, 500);
  text-transform: var(--font-navigation-text-transform, none);
  padding-block: clamp(0.75rem, 2vw, 1rem);
  padding-inline: 0;
}

@media screen and (min-width: 1024px) {
  .liivv-store-header [class*='max-w-screen-2xl'] > div {
    display: grid !important;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas: 'logo navigation icons';
    align-items: center;
    column-gap: var(--header-items-gap, clamp(0.75rem, 2vw, 1.5rem));
  }

  /* Mobile drawer trigger + logo share first column */
  .liivv-store-header [class*='max-w-screen-2xl'] > div > :nth-child(1),
  .liivv-store-header [class*='max-w-screen-2xl'] > div > :nth-child(2) {
    grid-area: logo;
    display: flex;
    align-items: center;
    gap: var(--sp-3, 0.75rem);
    flex: none !important;
    justify-self: start;
  }

  .liivv-store-header [class*='max-w-screen-2xl'] > div > ul[class*='@4xl:flex'] {
    grid-area: navigation;
    flex: none !important;
    justify-self: start;
    margin-inline-start: var(--header-nav-gap, clamp(1rem, 2vw, 1.5rem));
  }

  .liivv-store-header [class*='max-w-screen-2xl'] > div > :last-child {
    grid-area: icons;
    flex: none !important;
    justify-self: end;
    gap: var(--sp-1d5, 0.375rem) !important;
  }
}

/* Desktop nav links — archive-like (no rounded pills), left-aligned */
.liivv-store-header [class*='max-w-screen-2xl'] ul[class*='gap-1'] {
  gap: var(--header-nav-gap, clamp(1rem, 2vw, 1.5rem)) !important;
  justify-content: flex-start !important;
}

.liivv-store-header [class*='max-w-screen-2xl'] ul[class*='gap-1'] a {
  border-radius: 0 !important;
  background: transparent !important;
  padding: 0.35rem 0 !important;
  font-family: var(--font-navigation-family, inherit) !important;
  font-size: var(--font-navigation-size, 1rem) !important;
  font-weight: var(--font-navigation-weight, 500) !important;
  text-transform: var(--font-navigation-text-transform, none) !important;
  letter-spacing: inherit;
}

.liivv-store-header [class*='max-w-screen-2xl'] ul[class*='gap-1'] a:hover {
  background: transparent !important;
  opacity: 0.75;
}

/* Logo size (section header) */
.liivv-store-header img {
  max-height: 140px;
  max-width: 140px;
  width: auto;
  height: auto;
  object-fit: contain;
}

/* Utility icons — archive stroke weight + hit target */
.liivv-store-header [class*='max-w-screen-2xl'] > div > :last-child button,
.liivv-store-header [class*='max-w-screen-2xl'] > div > :last-child a {
  min-width: 2.75rem;
  min-height: 2.75rem;
  border-radius: 0;
  background: transparent !important;
}

.liivv-store-header .icon {
  width: var(--liivv-header-icon-size);
  height: var(--liivv-header-icon-size);
  stroke-width: var(--icon-weight, 1.5);
}

.liivv-store-header .cart-drawer-button .count {
  position: absolute;
  top: 0;
  right: 0;
  font-size: var(--text-xs, 0.75rem);
  line-height: 1;
  min-width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-inline: 2px;
}

/* Pinned state (shared with section header) */
.liivv-store-header.header-section.header-pinned,
.diabetes-care-section-header.header-section.header-pinned {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
  width: 100%;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Section header tokens */
.diabetes-care-section-header.liivv-header-skin {
  --color-background: var(--liivv-header-bg);
  --color-foreground: var(--liivv-header-fg);
}
`;
