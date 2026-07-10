/** Account dropdown — matches dashboard `.mhd-account-menu` styling, scoped to `.liivv-archive-header`. */
export const LIIVV_HEADER_ACCOUNT_MENU_CSS = `
.liivv-archive-header .header-account-menu {
  position: relative;
  display: flex;
  align-items: center;
}

.liivv-archive-header .header-account-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem 0.375rem 0.375rem;
  border: 0;
  background: transparent;
  color: rgb(49 47 47);
  font-family: Poppins, system-ui, Helvetica, Arial, sans-serif;
  font-size: clamp(0.875rem, 0.748rem + 0.3174vw, 1.125rem);
  font-weight: 400;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
  border-radius: 3.75rem;
  transition: background-color 0.25s ease, color 0.25s ease;
}

.liivv-archive-header .header-account-btn:hover,
.liivv-archive-header .header-account-btn:focus-visible {
  background: rgb(245 242 237);
  color: rgb(142 165 141);
  outline: none;
}

.liivv-archive-header .header-account-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: rgb(245 242 237);
  color: rgb(49 47 47);
  font-family: Poppins, system-ui, Helvetica, Arial, sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  flex-shrink: 0;
}

.liivv-archive-header .header-account-btn__label {
  display: none;
  white-space: nowrap;
}

@media screen and (min-width: 768px) {
  .liivv-archive-header .header-account-btn__label {
    display: inline;
  }
}

.liivv-archive-header .header-account-btn__chevron {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.liivv-archive-header .header-account-menu__panel {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  z-index: 60;
  min-width: 12rem;
  padding: 0.75rem 0;
  border-radius: clamp(0.625rem, 1.053vw, 1.25rem);
  border: 1px solid rgb(230 220 213);
  background: rgb(255 255 255);
  box-shadow: 0 0.75rem 1.375rem rgb(243 199 190 / 0.35);
}

.liivv-archive-header .header-account-menu__panel[hidden] {
  display: none;
}

.liivv-archive-header .header-account-menu__link {
  display: flex;
  width: 100%;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border: 0;
  background: transparent;
  color: rgb(49 47 47);
  font-family: Poppins, system-ui, Helvetica, Arial, sans-serif;
  font-size: 0.9375rem;
  font-weight: 400;
  line-height: 1.2;
  text-align: start;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.liivv-archive-header .header-account-menu__link:hover,
.liivv-archive-header .header-account-menu__link:focus-visible {
  background: rgb(245 242 237);
  color: rgb(142 165 141);
  outline: none;
}

.liivv-archive-header .header-account-menu__link--active {
  background: rgb(245 242 237);
  color: rgb(142 165 141);
}
`;
