/** Desktop mega menu panel (hover dropdown under top-level nav). */
export const LIIVV_HEADER_MEGA_MENU_CSS = `
.liivv-archive-header {
  --animation-primary: 0.5s cubic-bezier(0.3, 1, 0.3, 1);
  --mega-menu-drawer-duration: 0.45s;
  --mega-menu-drawer-ease: cubic-bezier(0.32, 0.72, 0, 1);
  --mega-menu-feature-radius: 1.5rem;
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
  .liivv-archive-header .header__menu > ul.with-block > li:hover .menu__item .btn-duplicate,
  .liivv-archive-header .header__menu > ul.with-block > li:focus-within .menu__item .btn-duplicate,
  .liivv-archive-header .header__menu > ul.with-block > li[aria-expanded='true'] .menu__item .btn-duplicate {
    --tw-scale: 1;
    --tw-translate-y: 0%;
  }
  .liivv-archive-header .header__menu > ul.with-block > li:hover .menu__item [data-text],
  .liivv-archive-header .header__menu > ul.with-block > li:focus-within .menu__item [data-text],
  .liivv-archive-header .header__menu > ul.with-block > li[aria-expanded='true'] .menu__item [data-text] {
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
  position: static;
}
.liivv-archive-header .header-mega-menu-wrap {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  z-index: 4;
  overflow: hidden;
  pointer-events: none;
  visibility: hidden;
  transition: visibility 0s linear var(--mega-menu-drawer-duration);
}
.liivv-archive-header .header-mega-menu-wrap.is-open {
  pointer-events: auto;
  visibility: visible;
  transition: visibility 0s;
}
.liivv-archive-header .header-mega-menu {
  background: rgb(var(--color-background));
  border-block-start: 1px solid rgb(var(--color-foreground) / 0.08);
  border-end-start-radius: var(--border-radius, 1rem);
  border-end-end-radius: var(--border-radius, 1rem);
  box-shadow: 0 12px 40px rgb(33 33 33 / 0.08);
  overflow: hidden;
  transform: translateY(-100%);
  transition: transform var(--mega-menu-drawer-duration) var(--mega-menu-drawer-ease);
  will-change: transform;
}
.liivv-archive-header .header-mega-menu-wrap.is-open .header-mega-menu {
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
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: clamp(1.5rem, 3vw, 3rem);
}
.liivv-archive-header .header-mega-menu__feature {
  min-height: 280px;
  border-inline-start: 1px solid rgb(var(--color-foreground) / 0.08);
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
.liivv-archive-header .header-mega-menu__feature-scrim {
  border-radius: var(--mega-menu-feature-radius);
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
@media (prefers-reduced-motion: reduce) {
  .liivv-archive-header .header-mega-menu-wrap,
  .liivv-archive-header .header-mega-menu {
    transition: none;
  }
  .liivv-archive-header .header-mega-menu-wrap.is-open {
    visibility: visible;
  }
  .liivv-archive-header .header-mega-menu-wrap.is-open .header-mega-menu {
    transform: none;
  }
  .liivv-archive-header .header__menu > ul.with-block > li:hover .menu__item .btn-duplicate,
  .liivv-archive-header .header__menu > ul.with-block > li[aria-expanded='true'] .menu__item .btn-duplicate {
    --tw-scale: 1;
    --tw-translate-y: 0%;
  }
  .liivv-archive-header .header__menu > ul.with-block > li:hover .menu__item [data-text],
  .liivv-archive-header .header__menu > ul.with-block > li[aria-expanded='true'] .menu__item [data-text] {
    opacity: 0;
  }
}
`;
