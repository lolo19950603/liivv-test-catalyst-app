/** Hover dropdown for account utility icon — scoped to `.liivv-archive-header`. */
export const LIIVV_HEADER_ACCOUNT_MENU_CSS = `
.liivv-archive-header .header-account-menu {
  position: relative;
  display: flex;
  align-items: center;
}

.liivv-archive-header .header-account-menu__trigger {
  display: flex;
  align-items: center;
  justify-content: center;
}

.liivv-archive-header .header-account-menu__panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  z-index: 60;
  min-width: 12.5rem;
  padding: 0.375rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(var(--color-foreground) / 0.08);
  background-color: rgb(var(--color-background));
  box-shadow: 0 10px 30px rgb(33 33 33 / 0.12);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(-4px);
  transition:
    opacity 0.15s ease,
    transform 0.15s ease,
    visibility 0.15s ease;
}

.liivv-archive-header .header-account-menu.is-open .header-account-menu__panel {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0);
}

.liivv-archive-header .header-account-menu__link {
  display: flex;
  min-height: 2.5rem;
  align-items: center;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25;
  color: rgb(var(--color-foreground));
  text-decoration: none;
}

.liivv-archive-header .header-account-menu__link:hover,
.liivv-archive-header .header-account-menu__link:focus-visible {
  background-color: rgb(var(--color-foreground) / 0.06);
  outline: none;
}

.liivv-archive-header .header-account-menu__link--active {
  background-color: rgb(var(--color-foreground) / 0.08);
}
`;
