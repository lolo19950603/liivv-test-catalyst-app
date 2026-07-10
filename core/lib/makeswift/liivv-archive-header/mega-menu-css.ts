/** Desktop mega menu panel (hover dropdown under top-level nav). */
export const LIIVV_HEADER_MEGA_MENU_CSS = `
.liivv-archive-header {
  --animation-primary: 0.5s cubic-bezier(0.3, 1, 0.3, 1);
  --mega-menu-drawer-duration: 0.45s;
  --mega-menu-drawer-ease: cubic-bezier(0.32, 0.72, 0, 1);
  --mega-menu-close-delay: 0.3s;
  --mega-menu-hover-bridge: 5rem;
  --mega-menu-feature-radius: 1.5rem;
  --mega-menu-feature-fade-duration: 0.15s;
  --mega-menu-feature-fade-ease: ease-out;
}
/* Top-level nav (Liivv Your Life / Liivv Health) — archive with-block hover slide */
.liivv-archive-header .header__menu > ul.with-block > li {
  position: relative;
}
.liivv-archive-header .header__menu > ul.with-block .menu__item {
  position: relative;
  overflow: hidden;
  height: var(--sp-10d5, 2.625rem);
  padding-inline: var(--sp-5, 1.25rem);
  border-radius: var(--rounded-button, 9999px);
}
.liivv-archive-header .header__menu > ul.with-block .menu__item [data-text] {
  transition: var(--animation-primary);
  transition-property: transform, opacity;
}
.liivv-archive-header .header__menu > ul.with-block .menu__item .btn-duplicate {
  --tw-scale: 0.6;
  --tw-translate-y: 100%;
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding-inline: var(--sp-5, 1.25rem);
  border-radius: var(--rounded-button, 9999px);
  color: rgb(var(--color-background));
  background-color: rgb(var(--color-foreground));
  transition: transform var(--animation-primary);
  transform: translateY(var(--tw-translate-y)) scale(var(--tw-scale));
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .liivv-archive-header .header__menu > ul.with-block .menu__item [data-text],
  .liivv-archive-header .header__menu > ul.with-block .menu__item .btn-duplicate {
    transition: none;
  }
}
@media screen and (pointer: fine) {
  .liivv-archive-header .header__menu > ul.with-block .menu__item:hover .btn-duplicate,
  .liivv-archive-header .header__menu > ul.with-block .menu__item:focus-visible .btn-duplicate,
  .liivv-archive-header .header__menu > ul.with-block > li[aria-expanded="true"] .menu__item .btn-duplicate {
    --tw-scale: 1;
    --tw-translate-y: 0%;
  }
  .liivv-archive-header .header__menu > ul.with-block .menu__item:hover [data-text],
  .liivv-archive-header .header__menu > ul.with-block .menu__item:focus-visible [data-text],
  .liivv-archive-header .header__menu > ul.with-block > li[aria-expanded="true"] .menu__item [data-text] {
    opacity: 0;
    transform: translateY(-10%) scale(0.6);
  }
}
.liivv-archive-header.header-section,
.liivv-archive-header .header,
.liivv-archive-header .liivv-header-chrome {
  overflow: visible;
}
.liivv-archive-header .header__navigation {
  position: relative;
  z-index: 30;
}
.liivv-archive-header .header-mega-menu-wrap {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  z-index: 1;
  overflow: visible;
  pointer-events: none;
  visibility: hidden;
  transition: visibility 0s linear var(--mega-menu-drawer-duration);
}
.liivv-archive-header .header-mega-menu-wrap.is-open {
  z-index: 25;
  /* Pass pointer events through the bridge/overlap zone so top-level nav pills stay hoverable. */
  pointer-events: none;
  visibility: visible;
  transition: visibility 0s;
  /* Overlap the header bottom so the pointer can reach the panel from a nav pill. */
  margin-top: calc(-1 * var(--mega-menu-hover-bridge));
  padding-top: var(--mega-menu-hover-bridge);
}
/* Invisible bridge — padding box above the visible drawer (inside the header gap). */
.liivv-archive-header .header-mega-menu-wrap.is-open::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: var(--mega-menu-hover-bridge);
  pointer-events: none;
}
.liivv-archive-header .header-mega-menu {
  background: rgb(var(--color-background));
  border-block-start: 1px solid rgb(var(--color-foreground) / 0.08);
  border-end-start-radius: var(--border-radius, 1rem);
  border-end-end-radius: var(--border-radius, 1rem);
  box-shadow: 0 12px 40px rgb(33 33 33 / 0.08);
  overflow: hidden;
  opacity: 0;
  transform: translateY(-0.75rem);
  transition:
    transform var(--mega-menu-drawer-duration) var(--mega-menu-drawer-ease),
    opacity var(--mega-menu-drawer-duration) var(--mega-menu-drawer-ease);
  will-change: transform, opacity;
}
.liivv-archive-header .header-mega-menu-wrap.is-open .header-mega-menu {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}
.liivv-archive-header .header-search-wrap {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  z-index: 3;
  overflow: hidden;
  pointer-events: none;
  visibility: hidden;
  transition: visibility 0s linear var(--mega-menu-drawer-duration);
}
.liivv-archive-header .header-search-wrap.is-open {
  pointer-events: auto;
  visibility: visible;
  transition: visibility 0s;
}
.liivv-archive-header .header-search-drawer {
  background: rgb(var(--color-background));
  border-block-start: 1px solid rgb(var(--color-foreground) / 0.08);
  box-shadow: 0 12px 40px rgb(33 33 33 / 0.08);
  transform: translateY(-100%);
  transition: transform var(--mega-menu-drawer-duration) var(--mega-menu-drawer-ease);
  will-change: transform;
}
.liivv-archive-header .header-search-wrap.is-open .header-search-drawer {
  transform: translateY(0);
}
.liivv-archive-header .header-mega-menu__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 36%);
  gap: clamp(1.25rem, 2.5vw, 2.5rem);
  padding-block: clamp(1.75rem, 3vw, 2.5rem);
  padding-inline: 0;
}
.liivv-archive-header .header-mega-menu__links {
  min-width: 0;
}
.liivv-archive-header .header-mega-menu__grid {
  display: grid;
  grid-template-columns: repeat(var(--mega-menu-column-count, 5), minmax(0, 1fr));
  gap: clamp(1.5rem, 3vw, 3rem);
}
.liivv-archive-header .header-mega-menu__feature {
  min-height: 280px;
  overflow: hidden;
  border-radius: var(--mega-menu-feature-radius);
}
.liivv-archive-header .header-mega-menu__feature-panel,
.liivv-archive-header .header-mega-menu__feature-placeholder,
.liivv-archive-header .header-mega-menu__feature-image {
  border-radius: var(--mega-menu-feature-radius);
}
.liivv-archive-header .header-mega-menu__feature-panel,
.liivv-archive-header .header-mega-menu__feature-placeholder {
  overflow: hidden;
}
.liivv-archive-header .header-mega-menu__feature-image,
.liivv-archive-header .header-mega-menu__feature-placeholder-layer,
.liivv-archive-header .header-mega-menu__feature-logo-text {
  pointer-events: none;
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
}
.liivv-archive-header .header-mega-menu__feature-layer--base {
  opacity: 1;
}
.liivv-archive-header .header-mega-menu__feature-image {
  object-fit: cover;
}
.liivv-archive-header .header-mega-menu__feature-image--logo {
  background: rgb(var(--color-background));
  object-fit: contain;
  padding: 1.5rem;
}
.liivv-archive-header .header-mega-menu__feature-logo-text {
  align-items: center;
  color: rgb(var(--color-foreground) / 0.7);
  display: flex;
  font-size: clamp(1rem, 2vw, 1.5rem);
  font-weight: 600;
  justify-content: center;
  padding: 1.5rem;
  text-align: center;
}
.liivv-archive-header .header-mega-menu__feature-layer--incoming {
  opacity: 0;
  transition: opacity var(--mega-menu-feature-fade-duration) var(--mega-menu-feature-fade-ease);
}
.liivv-archive-header .header-mega-menu__feature-layer--incoming.is-entered {
  opacity: 1;
}
.liivv-archive-header .header-mega-menu__feature-placeholder-layer {
  background: rgb(var(--color-foreground) / 0.06);
}
.liivv-archive-header .header-mega-menu__link--active {
  font-weight: 600;
}
@media screen and (max-width: 1023px) {
  .liivv-archive-header .header-mega-menu__body {
    grid-template-columns: 1fr;
  }
  .liivv-archive-header .header-mega-menu__feature {
    display: none;
  }
}
.liivv-archive-header .header-mega-menu__column {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.liivv-archive-header .header-mega-menu__column-heading {
  margin-block-end: 0.25rem;
  padding-block-end: 0.35rem;
  border-block-end: 1px solid rgb(var(--color-foreground) / 0.1);
}
.liivv-archive-header .header-mega-menu__heading-link {
  display: block;
  font-family: var(--font-navigation-family, var(--font-sans));
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  line-height: 1.4;
  text-transform: uppercase;
  color: rgb(var(--color-foreground) / 0.55);
  text-decoration: none;
}
.liivv-archive-header .header-mega-menu__heading-link:hover,
.liivv-archive-header .header-mega-menu__heading-link:focus-visible {
  color: rgb(var(--color-foreground));
  text-decoration: none;
  outline: none;
}
.liivv-archive-header .header-mega-menu__heading-link.header-mega-menu__link--active {
  color: rgb(var(--color-foreground));
}
.liivv-archive-header .header-mega-menu__link {
  display: block;
  padding-block: 0.35rem;
  font-family: var(--font-navigation-family, var(--font-sans));
  font-size: var(--font-navigation-size, 1rem);
  font-weight: var(--font-navigation-weight, 500);
  line-height: 1.35;
  color: rgb(var(--color-foreground));
  text-decoration: none;
}
.liivv-archive-header .header-mega-menu__link:hover,
.liivv-archive-header .header-mega-menu__link:focus-visible {
  color: rgb(var(--color-foreground));
  text-decoration: underline;
  text-underline-offset: 0.2em;
  outline: none;
}
.liivv-archive-header .header-mega-menu__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 1rem 1.25rem;
  border-block-start: 1px solid rgb(var(--color-foreground) / 0.12);
  font-family: var(--font-navigation-family, var(--font-sans));
  font-size: var(--font-navigation-size, 1rem);
  font-weight: var(--font-navigation-weight, 500);
  color: rgb(var(--color-foreground));
  text-decoration: none;
}
.liivv-archive-header .header-mega-menu__footer:hover {
  text-decoration: none;
}
.liivv-archive-header .header-mega-menu__footer:hover .header-mega-menu__explore-label {
  text-decoration: underline;
}
.liivv-archive-header .header-mega-menu__arrow {
  display: inline-flex;
  color: rgb(var(--color-foreground));
}
.liivv-archive-header .header__buttons {
  gap: 0.5rem;
}
@media screen and (min-width: 768px) {
  .liivv-archive-header .header__buttons {
    gap: 0.625rem;
  }
}
.liivv-archive-header .header-utility-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  min-width: 2.75rem;
  min-height: 2.75rem;
  border-radius: 999px;
  border: 1px solid rgb(var(--color-foreground) / 0.12);
  background: rgb(var(--color-background));
  color: rgb(var(--color-foreground));
  text-decoration: none;
  position: relative;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
.liivv-archive-header .header-utility-icon-btn:hover,
.liivv-archive-header .header-utility-icon-btn:focus-visible {
  background: rgb(var(--color-foreground) / 0.04);
  border-color: rgb(var(--color-foreground) / 0.2);
  color: rgb(var(--color-foreground));
  outline: none;
}
.liivv-archive-header .header-utility-icon-btn svg {
  width: 1.35rem;
  height: 1.35rem;
}
.liivv-archive-header .header-utility-badge {
  position: absolute;
  top: -0.125rem;
  right: -0.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.125rem;
  height: 1.125rem;
  padding-inline: 0.25rem;
  border-radius: 999px;
  background: rgb(var(--color-foreground));
  color: rgb(var(--color-background));
  font-size: 0.625rem;
  font-weight: 600;
  line-height: 1;
}
.liivv-archive-header .header-notifications {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.liivv-archive-header .header-notifications__trigger {
  display: inline-flex;
}
.liivv-archive-header .header-notifications__panel {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  z-index: 30;
  width: min(22rem, calc(100vw - 1.5rem));
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid rgb(var(--color-foreground) / 0.08);
  background: rgb(var(--color-background));
  box-shadow: 0 12px 40px rgb(33 33 33 / 0.12);
}
.liivv-archive-header .header-notifications__title {
  border-bottom: 1px solid rgb(var(--color-foreground) / 0.08);
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--color-foreground));
}
.liivv-archive-header .header-notifications__list {
  max-height: 24rem;
  overflow-y: auto;
  padding: 0.75rem;
}
.liivv-archive-header .header-notifications__empty {
  font-size: 0.875rem;
  color: rgb(var(--color-foreground) / 0.55);
}
.liivv-archive-header .header-notifications__items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.liivv-archive-header .header-notifications__item {
  display: block;
  border-radius: 0.375rem;
  padding: 0.5rem;
  text-decoration: none;
  transition: background-color 0.2s ease;
}
.liivv-archive-header .header-notifications__item:hover,
.liivv-archive-header .header-notifications__item:focus-visible {
  background: rgb(var(--color-foreground) / 0.05);
}
.liivv-archive-header .header-notifications__kind {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgb(var(--color-foreground) / 0.55);
}
.liivv-archive-header .header-notifications__item-title {
  margin-top: 0.125rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--color-foreground));
}
.liivv-archive-header .header-notifications__item-body {
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  line-height: 1.4;
  color: rgb(var(--color-foreground) / 0.7);
}
@media (prefers-reduced-motion: reduce) {
  .liivv-archive-header .header-mega-menu__feature-layer--incoming {
    transition: none;
  }
  .liivv-archive-header .header-mega-menu__feature-layer--incoming.is-entered {
    opacity: 1;
  }
  .liivv-archive-header .header-search-wrap,
  .liivv-archive-header .header-search-drawer {
    transition: none;
  }
  .liivv-archive-header .header-search-wrap.is-open .header-search-drawer {
    transform: none;
  }
  .liivv-archive-header .header-mega-menu-wrap,
  .liivv-archive-header .header-mega-menu {
    transition: none;
  }
  .liivv-archive-header .header-mega-menu-wrap.is-open {
    visibility: visible;
  }
  .liivv-archive-header .header-mega-menu-wrap.is-open .header-mega-menu {
    opacity: 1;
    transform: none;
  }
  .liivv-archive-header .header__menu > ul.with-block .menu__item:hover .btn-duplicate,
  .liivv-archive-header .header__menu > ul.with-block .menu__item:focus-visible .btn-duplicate,
  .liivv-archive-header .header__menu > ul.with-block > li[aria-expanded="true"] .menu__item .btn-duplicate {
    --tw-scale: 1;
    --tw-translate-y: 0%;
  }
  .liivv-archive-header .header__menu > ul.with-block .menu__item:hover [data-text],
  .liivv-archive-header .header__menu > ul.with-block .menu__item:focus-visible [data-text],
  .liivv-archive-header .header__menu > ul.with-block > li[aria-expanded="true"] .menu__item [data-text] {
    opacity: 0;
  }
}
`;
