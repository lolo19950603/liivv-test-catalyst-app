import { LIIVV_HEADER_UTILITY_SHARED_CSS } from '~/lib/makeswift/site-header/header-utility-shared-css';

/** Scoped root for the member health dashboard (PC Health archive layout). */
export const ACCOUNT_DASHBOARD_ROOT_ID = 'liivv-account-dashboard';

export const ACCOUNT_DASHBOARD_STYLE = `
${LIIVV_HEADER_UTILITY_SHARED_CSS}
#${ACCOUNT_DASHBOARD_ROOT_ID}{
  /* Diabetes-care archive design tokens (see core/public/archive/diabetes-care-head.css). */
  --mhd-navy:49 47 47;
  --mhd-text:49 47 47;
  --mhd-muted:168 156 148;
  --mhd-border:230 220 213;
  --mhd-surface:245 242 237;
  --mhd-accent:142 165 141;
  --mhd-shadow:243 199 190;
  --mhd-white:255 255 255;
  --mhd-btn-bg:49 47 47;
  --mhd-btn-text:255 255 255;
  --mhd-radius-lg:clamp(0.625rem,1.053vw,1.25rem);
  --mhd-radius-sm:0.375rem;
  --mhd-radius-pill:3.75rem;
  --mhd-font-body:Poppins,system-ui,Helvetica,Arial,sans-serif;
  --mhd-font-heading:Poppins,system-ui,Helvetica,Arial,sans-serif;
  --mhd-font-button-size:clamp(0.875rem,0.8115rem + 0.1587vw,1rem);
  --mhd-font-nav-size:clamp(0.875rem,0.748rem + 0.3174vw,1.125rem);
  --mhd-max:86rem;
  font-family:var(--mhd-font-body);
  font-weight:400;
  line-height:1.2;
  letter-spacing:0;
  color:rgb(var(--mhd-text));
  background-color:rgb(var(--mhd-surface));
  position:fixed;
  inset:0;
  z-index:200;
  display:flex;
  flex-direction:row;
  isolation:isolate;
  overflow:hidden;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}
body.adc-portal-active #liivv-site-header,
body.adc-portal-active .liivv-archive-header,
body.adc-portal-active .site-header-slideshow,
body.adc-portal-active .site-footer-reveal-footer,
body.adc-portal-active footer.site-footer-makeswift__panel,
body.adc-portal-active .site-footer-makeswift{
  display:none!important;
}
body.adc-portal-active main{
  padding:0!important;
  max-width:none!important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-shell{
  display:flex;
  flex:1 1 auto;
  min-height:0;
  width:100%;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar{
  flex:0 0 auto;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:1.5rem;
  width:4.75rem;
  padding:1.25rem 0.75rem;
  background:rgb(var(--mhd-white));
  border-inline-end:1px solid rgb(var(--mhd-border));
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar{
    width:5.75rem;
    padding:1.5rem 1rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar__logo{
  display:flex;
  align-items:center;
  justify-content:center;
  text-decoration:none;
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar__logo-img{
  display:block;
  width:auto;
  height:3.25rem;
  max-width:100%;
  object-fit:contain;
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar__logo-img{
    height:3.75rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar__nav,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar__footer{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0.75rem;
  width:100%;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar__footer{
  margin-top:auto;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar__link{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:2.75rem;
  height:2.75rem;
  border-radius:var(--mhd-radius-lg);
  color:rgb(var(--mhd-text));
  text-decoration:none;
  transition:background-color 0.2s ease,color 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar__link:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar__link:focus-visible{
  background:rgb(var(--mhd-surface));
  color:rgb(var(--mhd-accent));
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar__link--active{
  background:rgb(var(--mhd-accent));
  color:rgb(var(--mhd-white));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar__link--active:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar__link--active:focus-visible{
  background:rgb(var(--mhd-accent));
  color:rgb(var(--mhd-white));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar__icon{
  display:inline-flex;
  align-items:center;
  justify-content:center;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-sidebar__icon svg{
  width:1.35rem;
  height:1.35rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-content{
  display:flex;
  flex:1 1 auto;
  flex-direction:column;
  min-width:0;
  min-height:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-content-header{
  position:relative;
  /* Above quantity badges in .mhd-main (z-10) so the open search drawer is not covered. */
  z-index:20;
  display:flex;
  flex-direction:column;
  align-items:stretch;
  gap:1rem;
  padding:var(--liivv-header-utility-offset-block, 1.5rem) var(--liivv-header-utility-inline-end, 1.25rem) 1.25rem 1.25rem;
  background:rgb(var(--mhd-white));
  border-bottom:1px solid rgb(var(--mhd-border));
  --mhd-search-drawer-duration:0.45s;
  --mhd-search-drawer-ease:cubic-bezier(0.45,0.05,0.25,1);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-header-search-wrap{
  position:absolute;
  left:0;
  right:0;
  top:100%;
  z-index:5;
  overflow:hidden;
  pointer-events:none;
  visibility:hidden;
  transition:visibility 0s linear var(--mhd-search-drawer-duration);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-header-search-wrap.is-open{
  pointer-events:auto;
  visibility:visible;
  transition:visibility 0s;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-header-search-drawer{
  --color-background:var(--mhd-white);
  --color-foreground:var(--mhd-text);
  background:rgb(var(--mhd-white));
  border-block-start:1px solid rgb(var(--mhd-border));
  box-shadow:0 12px 40px rgb(33 33 33 / 0.08);
  transform:translateY(-100%);
  transition:transform var(--mhd-search-drawer-duration) var(--mhd-search-drawer-ease);
  will-change:transform;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-header-search-wrap.is-open .mhd-header-search-drawer{
  transform:translateY(0);
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-header-search-drawer .liivv-archive-search-form{
    padding:0.875rem 2rem;
  }
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-content-header{
    padding-inline-start:2rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-content-header__body{
  display:flex;
  flex-direction:column;
  align-items:stretch;
  gap:1rem;
  width:100%;
}
@media screen and (min-width:768px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-content-header__body{
    flex-direction:row;
    align-items:center;
    justify-content:flex-start;
    gap:1.5rem;
    min-height:var(--liivv-header-utility-size, 2.75rem);
    padding-inline-end:var(--liivv-header-utility-cluster-width, 27rem);
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-content-header__greeting{
  min-width:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-content-header__utilities{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  flex-wrap:nowrap;
  gap:var(--liivv-header-utility-gap, 0.5rem);
  flex-shrink:0;
}
@media screen and (min-width:768px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-content-header__utilities{
    position:fixed;
    top:var(--liivv-header-utility-offset-block, 1.5rem);
    right:var(--liivv-header-utility-inline-end, 1.25rem);
    z-index:210;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-btn--avatar .mhd-account-btn__label{
  display:none;
}
@media screen and (min-width:768px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-btn--avatar .mhd-account-btn__label{
    display:inline;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-header{
  flex:0 0 auto;
  background:rgb(var(--mhd-white));
  border-bottom:1px solid rgb(var(--mhd-border));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-header__top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:1rem;
  padding:0.75rem 1rem;
  max-width:86rem;
  margin:0 auto;
  width:100%;
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-header__top{
    padding:0.75rem 2rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-logo{
  display:inline-flex;
  align-items:center;
  text-decoration:none;
  color:rgb(var(--mhd-text));
  font-family:var(--mhd-font-heading);
  font-size:1.375rem;
  font-weight:500;
  letter-spacing:-0.03em;
  line-height:1;
  flex-shrink:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-logo__img{
  display:block;
  height:3.5rem;
  width:auto;
  object-fit:contain;
  flex-shrink:0;
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-logo__img{
    height:4.5rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-header__services{
  display:none;
  align-items:center;
  gap:0.5rem;
  flex:1;
  justify-content:center;
}
@media screen and (min-width:768px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-header__services{
    display:flex;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-header__account{
  display:flex;
  align-items:center;
  gap:0.5rem;
  flex-shrink:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-service-link{
  display:inline-flex;
  flex-direction:row;
  align-items:center;
  justify-content:flex-start;
  gap:0.5rem;
  padding:0.375rem 0.5rem;
  border:0;
  background:transparent;
  color:rgb(var(--mhd-navy));
  font:inherit;
  font-size:0.875rem;
  font-weight:500;
  line-height:1.5;
  text-decoration:none;
  cursor:pointer;
  white-space:nowrap;
  flex-shrink:0;
  transition:color 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-service-link:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-service-link:focus-visible{
  color:rgb(var(--mhd-accent));
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-service-link__icon{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:1.25rem;
  height:1.25rem;
  flex-shrink:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-service-link__icon svg{
  display:block;
  width:100%;
  height:100%;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-service-link__label{
  display:inline-block;
  white-space:nowrap;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-btn{
  display:inline-flex;
  align-items:center;
  gap:0.5rem;
  padding:0.375rem 0.875rem 0.375rem 0.375rem;
  border:0;
  background:transparent;
  color:rgb(var(--mhd-text));
  font-family:var(--mhd-font-body);
  font-size:var(--mhd-font-nav-size);
  cursor:pointer;
  border-radius:var(--mhd-radius-pill);
  transition:background-color 0.25s ease,color 0.25s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-btn:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-btn:focus-visible{
  background:rgb(var(--mhd-surface));
  color:rgb(var(--mhd-accent));
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-avatar{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:2rem;
  height:2rem;
  border-radius:999px;
  background:rgb(var(--mhd-surface));
  color:rgb(var(--mhd-text));
  font-family:var(--mhd-font-body);
  font-size:0.75rem;
  font-weight:500;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-chevron{
  width:1.25rem;
  height:1.25rem;
  flex-shrink:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-menu{
  position:absolute;
  right:0;
  top:calc(100% + 0.75rem);
  min-width:12rem;
  padding:0.75rem 0;
  background:rgb(var(--mhd-white));
  border:1px solid rgb(var(--mhd-border));
  border-radius:var(--mhd-radius-lg);
  box-shadow:0 0.75rem 1.375rem rgb(var(--mhd-shadow)/0.35);
  z-index:10;
  list-style:none;
  margin:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-wrap{
  position:relative;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-menu[hidden]{
  display:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-menu a,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-menu button{
  display:flex;
  width:100%;
  align-items:center;
  padding:0.5rem 0.75rem;
  border:0;
  background:transparent;
  color:rgb(var(--mhd-text));
  font-family:var(--mhd-font-body);
  font-size:0.9375rem;
  text-align:start;
  text-decoration:none;
  cursor:pointer;
  transition:background-color 0.2s ease,color 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-menu a:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-menu button:hover{
  background:rgb(var(--mhd-surface));
  color:rgb(var(--mhd-accent));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-mega-nav{
  display:none;
  border-bottom:1px solid rgb(var(--mhd-border));
  padding:0 2rem;
  overflow-x:auto;
  scrollbar-width:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-mega-nav::-webkit-scrollbar{
  display:none;
}
@media screen and (min-width:1024px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-mega-nav{
    display:block;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-mega-nav__list{
  display:flex;
  gap:0;
  list-style:none;
  margin:0;
  padding:0;
  max-width:86rem;
  margin-inline:auto;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-mega-nav__item{
  flex:0 0 auto;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-mega-nav__item{
  flex:0 0 auto;
  padding:0.5rem 0.25rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-mega-nav__btn{
  position:relative;
  display:inline-flex;
  align-items:center;
  justify-content:space-between;
  gap:0.25rem;
  padding:0.5rem 1.125rem;
  border:0;
  background:transparent;
  color:rgb(var(--mhd-text));
  font-family:var(--mhd-font-body);
  font-size:var(--mhd-font-nav-size);
  font-weight:400;
  letter-spacing:0;
  white-space:nowrap;
  cursor:pointer;
  border-radius:var(--mhd-radius-pill);
  overflow:hidden;
  height:2.625rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-mega-nav__btn svg{
  width:1em;
  height:1em;
  opacity:0.85;
}
/* Sliding pill hover (matches diabetes-care header with-block effect). */
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-fill [data-text]{
  display:inline-flex;
  align-items:center;
  gap:inherit;
  transition:transform 0.35s cubic-bezier(0.4,0,0.2,1),opacity 0.35s cubic-bezier(0.4,0,0.2,1);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-fill .mhd-btn-fill__dup{
  position:absolute;
  inset:0;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:0.375rem;
  padding-inline:1.125rem;
  border-radius:var(--mhd-radius-pill);
  background-color:rgb(var(--mhd-btn-bg));
  color:rgb(var(--mhd-btn-text));
  font-family:var(--mhd-font-body);
  font-size:var(--mhd-font-nav-size);
  transform:translateY(100%) scale(0.6);
  transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);
  pointer-events:none;
  white-space:nowrap;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-fill .mhd-btn-fill__dup svg{
  color:#fff;
  opacity:1;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-fill:hover [data-text],#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-fill:focus-visible [data-text]{
  opacity:0;
  transform:translateY(-10%) scale(0.6);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-fill:hover .mhd-btn-fill__dup,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-fill:focus-visible .mhd-btn-fill__dup{
  transform:translateY(0) scale(1);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-fill:focus-visible{
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-main{
  flex:1 1 auto;
  min-height:0;
  overflow-y:auto;
  -webkit-overflow-scrolling:touch;
  background-color:rgb(var(--mhd-surface));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-container{
  width:100%;
  max-width:var(--mhd-max);
  margin:0 auto 2rem;
  padding:2.5rem 1.25rem 1.5rem;
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-container{
    padding:3rem 2rem 1.5rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-wellness{
  display:flex;
  flex-direction:column;
  gap:1.25rem;
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-content:has(.mhd-wellness) .mhd-content-header{
    padding-top:1.25rem;
    padding-bottom:0.875rem;
  }
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-content:has(.mhd-wellness) .mhd-greeting__lead{
    margin-top:0.25rem;
    font-size:0.875rem;
  }
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-main:has(.mhd-wellness){
    display:flex;
    flex-direction:column;
  }
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-main:has(.mhd-wellness) .mhd-container{
    flex:1 1 auto;
    min-height:0;
    display:flex;
    flex-direction:column;
    margin-bottom:0;
    padding:1.5rem 2rem 1.75rem;
  }
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-main:has(.mhd-wellness) .mhd-wellness{
    flex:1 1 auto;
    min-height:0;
    display:grid;
    grid-template-rows:minmax(0,1fr) auto;
    gap:1.25rem;
  }
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-main:has(.mhd-wellness) .mhd-care-canvas{
    min-height:0;
    height:100%;
    display:flex;
    flex-direction:column;
  }
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-main:has(.mhd-wellness) .mhd-care-focus{
    flex:1 1 auto;
    min-height:22rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero{
  position:relative;
  display:flex;
  flex-direction:column;
  min-height:18rem;
  border-radius:var(--mhd-radius-lg);
  overflow:hidden;
  background:rgb(var(--mhd-white));
  border:1px solid rgb(var(--mhd-border));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero__header{
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  gap:0.75rem;
  padding:1rem 1.25rem;
  background:rgb(var(--mhd-white));
  border-bottom:1px solid rgb(var(--mhd-border));
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero__header{
    flex-direction:row;
    align-items:center;
    justify-content:space-between;
    gap:1rem;
    padding:0.875rem 1.5rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero__main{
  display:block;
  position:relative;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero__body{
  position:relative;
  z-index:1;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  gap:2rem;
  padding:2rem 1.25rem 2rem;
  min-height:20rem;
  background:linear-gradient(145deg,#4a5d4a 0%,#3f523f 42%,#354835 100%);
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero__body{
    padding:2rem 1.5rem 1.75rem;
    min-height:18rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero__intro{
  max-width:28rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero__eyebrow{
  display:inline-flex;
  align-items:center;
  margin:0;
  padding:0.4rem 0.75rem;
  border-radius:var(--mhd-radius-pill);
  background:rgb(var(--mhd-accent) / 0.14);
  color:rgb(var(--mhd-accent));
  font-size:0.6875rem;
  font-weight:600;
  letter-spacing:0.06em;
  line-height:1.2;
  text-transform:uppercase;
  white-space:nowrap;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero__title{
  margin:0;
  font-family:var(--mhd-font-heading);
  font-size:clamp(1.75rem,1.2rem + 2vw,2.75rem);
  font-weight:500;
  line-height:1.05;
  letter-spacing:-0.03em;
  color:rgb(var(--mhd-white));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero__subtitle{
  margin:0.5rem 0 0;
  font-size:0.9375rem;
  line-height:1.4;
  color:rgb(var(--mhd-white)/0.92);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero__cards{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr));
  gap:0.75rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-glass-card{
  display:flex;
  flex-direction:column;
  gap:0.375rem;
  padding:0.875rem 1rem;
  border-radius:var(--mhd-radius-lg);
  min-height:5.5rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-glass-card--tips{
  background:rgb(49 47 47 / 0.78);
  border:1px solid rgb(255 255 255 / 0.14);
  color:rgb(var(--mhd-white));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-glass-card--link{
  flex-direction:row;
  align-items:flex-start;
  gap:0.75rem;
  text-decoration:none;
  background:rgb(238 244 238 / 0.96);
  border:1px solid rgb(255 255 255 / 0.72);
  color:rgb(var(--mhd-text));
  transition:background-color 0.2s ease,border-color 0.2s ease,transform 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-glass-card--link:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-glass-card--link:focus-visible{
  background:rgb(var(--mhd-white));
  border-color:rgb(var(--mhd-white));
  outline:none;
  transform:translateY(-1px);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-glass-card__icon{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:2rem;
  height:2rem;
  flex-shrink:0;
  color:rgb(var(--mhd-accent));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-glass-card__icon svg{
  width:1.35rem;
  height:1.35rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-glass-card__title{
  margin:0;
  font-family:var(--mhd-font-heading);
  font-size:0.9375rem;
  font-weight:500;
  line-height:1.2;
  letter-spacing:-0.02em;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-glass-card--tips .mhd-glass-card__desc{
  color:rgb(var(--mhd-white)/0.9);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-glass-card__desc{
  margin:0;
  font-size:0.75rem;
  line-height:1.45;
  color:rgb(var(--mhd-muted));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero__tabs{
  display:flex;
  flex-direction:row;
  flex-wrap:wrap;
  align-items:center;
  gap:0.35rem;
  width:100%;
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero__tabs{
    flex-wrap:nowrap;
    justify-content:flex-end;
    width:auto;
    max-width:min(100%,36rem);
    overflow-x:auto;
    -webkit-overflow-scrolling:touch;
    scrollbar-width:none;
  }
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero__tabs::-webkit-scrollbar{
    display:none;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero-tab{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:2.25rem;
  padding:0.45rem 0.9rem;
  border-radius:var(--mhd-radius-pill);
  background:rgb(var(--mhd-surface));
  color:rgb(var(--mhd-text));
  font-size:0.8125rem;
  font-weight:500;
  line-height:1.2;
  text-decoration:none;
  text-align:center;
  white-space:nowrap;
  border:1px solid rgb(var(--mhd-border));
  font-family:inherit;
  cursor:pointer;
  transition:background-color 0.2s ease,color 0.2s ease,border-color 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero-tab:disabled{
  cursor:wait;
  opacity:0.85;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero-tab:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero-tab:focus-visible{
  background:rgb(var(--mhd-white));
  color:rgb(var(--mhd-accent));
  border-color:rgb(var(--mhd-accent));
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero-tab--active{
  background:rgb(var(--mhd-accent));
  color:rgb(var(--mhd-white));
  border-color:rgb(var(--mhd-accent));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero-tab--active:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero-tab--active:focus-visible{
  background:rgb(var(--mhd-accent));
  color:rgb(var(--mhd-white));
  border-color:rgb(var(--mhd-accent));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-bottom{
  display:grid;
  grid-template-columns:1fr;
  gap:1rem;
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-bottom{
    grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);
    gap:1.25rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-action-center{
  display:grid;
  grid-template-columns:1fr;
  gap:1rem;
}
@media screen and (min-width:650px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-action-center{
    grid-template-columns:repeat(2,minmax(0,1fr));
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-action-card{
  position:relative;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  gap:1rem;
  min-height:8.5rem;
  padding:1.25rem;
  border-radius:var(--mhd-radius-lg);
  border:1px solid rgb(var(--mhd-border));
  text-decoration:none;
  color:rgb(var(--mhd-text));
  transition:border-color 0.2s ease,box-shadow 0.2s ease,transform 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-action-card:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-action-card:focus-visible{
  border-color:rgb(var(--mhd-muted));
  box-shadow:0 8px 20px rgb(var(--mhd-shadow)/0.28);
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-action-card--subscription{
  background:rgb(var(--mhd-white));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-action-card--orders{
  background:rgb(var(--mhd-accent));
  color:rgb(var(--mhd-white));
  border-color:rgb(var(--mhd-accent));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-action-card--orders .mhd-action-card__icon{
  color:rgb(var(--mhd-white));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-action-card__icon{
  display:inline-flex;
  align-self:flex-end;
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-action-card__icon svg{
  width:2rem;
  height:2rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-action-card__content{
  display:flex;
  flex-direction:column;
  gap:0.375rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-action-card__label{
  margin:0;
  font-size:0.875rem;
  font-weight:500;
  line-height:1.3;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-action-card__label--bottom{
  margin-top:auto;
  font-family:var(--mhd-font-heading);
  font-size:1.125rem;
  font-weight:500;
  letter-spacing:-0.03em;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-action-card__value{
  margin:0;
  font-family:var(--mhd-font-heading);
  font-size:clamp(1.25rem,1rem + 1vw,1.75rem);
  font-weight:500;
  line-height:1.1;
  letter-spacing:-0.03em;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-action-card__link{
  margin-top:0.5rem;
  font-size:0.8125rem;
  text-decoration:underline;
  text-underline-offset:0.15em;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-virtual-care{
  display:flex;
  flex-direction:column;
  gap:1rem;
  padding:1.25rem;
  border-radius:var(--mhd-radius-lg);
  background:rgb(var(--mhd-shadow)/0.45);
  border:1px solid rgb(var(--mhd-border));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-virtual-care__title{
  margin:0;
  font-family:var(--mhd-font-heading);
  font-size:clamp(1.25rem,1rem + 1vw,1.75rem);
  font-weight:500;
  line-height:1.1;
  letter-spacing:-0.03em;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-virtual-care__grid{
  display:grid;
  grid-template-columns:1fr;
  gap:0.75rem;
}
@media screen and (min-width:650px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-virtual-care__grid{
    grid-template-columns:repeat(2,minmax(0,1fr));
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-virtual-card{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:0.75rem;
  padding:1rem 1.125rem;
  border-radius:var(--mhd-radius-lg);
  background:rgb(var(--mhd-white));
  border:1px solid rgb(var(--mhd-border));
  color:rgb(var(--mhd-text));
  text-decoration:none;
  transition:border-color 0.2s ease,box-shadow 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-virtual-card:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-virtual-card:focus-visible{
  border-color:rgb(var(--mhd-muted));
  box-shadow:0 6px 16px rgb(var(--mhd-shadow)/0.25);
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-virtual-card--wide{
  grid-column:1/-1;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-virtual-card__label{
  font-size:0.875rem;
  font-weight:500;
  line-height:1.35;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-virtual-card__chevron{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  color:rgb(var(--mhd-navy));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-virtual-card__chevron svg{
  width:1.25rem;
  height:1.25rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-grid{
  display:grid;
  grid-template-rows:repeat(3,max-content);
  width:100%;
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-grid{
    grid-template-rows:12.438rem 37.25rem auto;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-greeting{
  display:flex;
  align-items:flex-end;
  padding:2rem 0 1rem;
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-greeting{
    padding:0 0 1.563rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-greeting__title{
  margin:0;
  font-family:var(--mhd-font-heading);
  font-size:clamp(1.5rem,1.1rem + 1.6vw,2.25rem);
  font-weight:400;
  line-height:1.05;
  letter-spacing:-0.03em;
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-greeting__lead{
  margin:0.5rem 0 0;
  font-family:var(--mhd-font-body);
  font-size:0.9375rem;
  line-height:1.4;
  letter-spacing:0;
  font-weight:400;
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-cards{
  display:flex;
  flex-direction:column;
  gap:0.5rem;
  margin-bottom:1.5rem;
}
@media screen and (min-width:650px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-cards{
    gap:1.5rem;
  }
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-cards{
    flex-direction:row;
    padding:1.5rem 0;
    margin-bottom:0;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-service-card{
  flex:1 1 0%;
  display:flex;
  flex-direction:column;
  padding:1rem 0;
  min-width:0;
}
@media screen and (min-width:650px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-service-card{
    border:1px solid rgb(var(--mhd-border));
    border-radius:var(--mhd-radius-lg);
    padding:1rem 0;
    background:rgb(var(--mhd-white));
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-service-card__inner{
  display:flex;
  flex-direction:column;
  height:100%;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-service-card__head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:1rem;
  padding-inline:0;
}
@media screen and (min-width:650px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-service-card__head{
    padding-inline:1.25rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-service-card__title{
  margin:0;
  font-family:var(--mhd-font-heading);
  font-size:1.25rem;
  font-weight:500;
  line-height:1.1;
  letter-spacing:-0.03em;
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-empty{
  display:flex;
  flex:1 1 auto;
  flex-direction:column;
  min-height:18.75rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-empty__body{
  display:flex;
  flex-direction:column;
  flex:1 1 auto;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-empty__art{
  display:flex;
  justify-content:center;
  align-items:center;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-empty__art svg{
  width:min(100%,12rem);
  height:auto;
}
/* Photo variant: fills card body edge-to-edge under the title, like the reference HTML. */
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-empty__art--photo{
  display:block;
  width:auto;
  margin-inline:0;
  padding-inline:0;
}
@media screen and (min-width:650px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-empty__art--photo{
    margin-inline:1.25rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-empty__photo{
  display:block;
  width:100%;
  height:auto;
  aspect-ratio:470/235;
  object-fit:cover;
  object-position:center;
  border-radius:var(--mhd-radius-sm);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-empty__text{
  display:flex;
  flex-direction:column;
  margin-top:1.25rem;
  padding-inline:0;
}
@media screen and (min-width:650px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-empty__text{
    padding-inline:1.25rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-empty__heading{
  margin:0 0 0.5rem;
  font-family:var(--mhd-font-heading);
  font-size:clamp(1.25rem,1.05rem + 0.6vw,1.5rem);
  font-weight:400;
  line-height:1.1;
  letter-spacing:-0.03em;
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-empty__desc{
  margin:0;
  font-family:var(--mhd-font-body);
  font-size:0.8125rem;
  line-height:1.6;
  letter-spacing:0;
  font-weight:400;
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-empty__actions{
  padding-top:1rem;
  text-align:center;
  margin-top:auto;
  padding-inline:1.25rem;
  padding-bottom:0.25rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-primary{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:2.5rem;
  padding:0.875rem 1.625rem;
  border-radius:var(--mhd-radius-pill);
  border:1px solid rgb(var(--mhd-btn-bg));
  background:rgb(var(--mhd-btn-bg));
  color:rgb(var(--mhd-btn-text));
  font-family:var(--mhd-font-body);
  font-size:var(--mhd-font-button-size);
  font-weight:400;
  letter-spacing:0;
  line-height:1;
  text-decoration:none;
  cursor:pointer;
  transition:background-color 0.2s ease,border-color 0.2s ease,color 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-primary:focus-visible{
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-primary--block{
  width:100%;
  border-radius:var(--mhd-radius-pill);
  padding:0.875rem 1.625rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-quick-links{
  padding:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-quick-links__title{
  margin:0 0 1rem;
  font-family:var(--mhd-font-heading);
  font-size:clamp(1.5rem,1.1rem + 1.6vw,2.25rem);
  font-weight:400;
  line-height:1.05;
  letter-spacing:-0.03em;
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-quick-links__grid{
  display:flex;
  gap:1rem;
  overflow-x:auto;
  padding-bottom:0.25rem;
  scrollbar-width:thin;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-quick-card{
  flex:0 0 min(100%,20.3125rem);
  display:flex;
  flex-direction:row;
  align-items:stretch;
  justify-content:space-between;
  gap:1rem;
  padding:1.5rem;
  background:rgb(var(--mhd-white));
  border:1px solid rgb(var(--mhd-border));
  border-radius:var(--mhd-radius-lg);
  min-width:20.3125rem;
  text-align:start;
  cursor:pointer;
  color:inherit;
  font-family:var(--mhd-font-body);
  font-size:0.875rem;
  transition:border-color 0.2s ease,box-shadow 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-quick-card:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-quick-card:focus-visible{
  border-color:rgb(var(--mhd-muted));
  box-shadow:0 6px 18px rgb(var(--mhd-shadow)/0.35);
  outline:none;
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-quick-links__grid{
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    overflow:visible;
  }
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-quick-card{
    flex:initial;
    min-width:0;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-quick-card__content{
  display:flex;
  flex-direction:column;
  gap:0.75rem;
  flex:1 1 auto;
  min-width:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-quick-card__row{
  display:flex;
  align-items:flex-start;
  gap:0.75rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-quick-card__thumb{
  width:3rem;
  height:3rem;
  flex-shrink:0;
  border-radius:999px;
  background:rgb(var(--mhd-surface));
  color:rgb(var(--mhd-text));
  display:flex;
  align-items:center;
  justify-content:center;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-quick-card__thumb svg{
  width:1.75rem;
  height:1.75rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-quick-card__title{
  margin:0;
  font-family:var(--mhd-font-heading);
  font-size:1.0625rem;
  font-weight:500;
  line-height:1.2;
  letter-spacing:-0.03em;
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-quick-card__desc{
  margin:0.25rem 0 0;
  font-family:var(--mhd-font-body);
  font-size:0.8125rem;
  line-height:1.4;
  letter-spacing:0;
  font-weight:400;
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-quick-card__chevron{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  align-self:center;
  width:2rem;
  height:2rem;
  border:0;
  background:transparent;
  color:rgb(var(--mhd-navy));
  flex-shrink:0;
  pointer-events:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-icon-btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:var(--liivv-header-utility-size, 2.75rem);
  height:var(--liivv-header-utility-size, 2.75rem);
  min-width:var(--liivv-header-utility-size, 2.75rem);
  min-height:var(--liivv-header-utility-size, 2.75rem);
  border-radius:999px;
  border:1px solid rgb(var(--mhd-border));
  background:rgb(var(--mhd-white));
  color:rgb(var(--mhd-text));
  text-decoration:none;
  position:relative;
  cursor:pointer;
  overflow:visible;
  flex-shrink:0;
  transition:background-color 0.2s ease,border-color 0.2s ease,color 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-icon-btn:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-icon-btn:focus-visible{
  background:rgb(var(--mhd-surface));
  border-color:rgb(var(--mhd-muted));
  color:rgb(var(--mhd-accent));
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-icon-btn svg{
  width:var(--liivv-header-utility-icon-size, 1.35rem);
  height:var(--liivv-header-utility-icon-size, 1.35rem);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-search-trigger svg{
  stroke-width:1.5;
}
/* Rich-text-lower CTA "circle blob" sweep fill: big oval sits hidden above, slides over content on hover, exits below on leave. */
/* Override the global archive .button defaults (box-shadow / pill radius / max-height / padding) that leak in from /archive/diabetes-care-sections.css. */
#${ACCOUNT_DASHBOARD_ROOT_ID} .button{
  position:relative;
  overflow:hidden;
  isolation:isolate;
  box-shadow:none;
  max-height:none;
  height:auto;
  width:auto;
  background:transparent;
  background-color:transparent;
  font:inherit;
}
/* Archive .button paints a pill-radius border via a positioned ::after — kill it. */
#${ACCOUNT_DASHBOARD_ROOT_ID} .button::after,#${ACCOUNT_DASHBOARD_ROOT_ID} .button:after{
  content:none!important;
  display:none!important;
  border:0!important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-primary.button{
  padding:0.875rem 1.625rem;
  border-radius:var(--mhd-radius-pill);
  background:rgb(var(--mhd-btn-bg));
  background-color:rgb(var(--mhd-btn-bg));
  color:rgb(var(--mhd-btn-text));
  font-family:var(--mhd-font-body);
  font-size:var(--mhd-font-button-size);
  font-weight:400;
  letter-spacing:0;
  border:1px solid rgb(var(--mhd-btn-bg));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-primary--block.button{
  width:100%;
  padding:0.875rem 1.625rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .button .btn-fill{
  display:block;
  position:absolute;
  width:150%;
  height:200%;
  inset-block-start:-50%;
  inset-inline-start:-25%;
  border-radius:50%;
  background-color:rgb(var(--mhd-btn-bg));
  transform:translate3d(0,-76%,0);
  z-index:0;
  pointer-events:none;
  will-change:transform;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .button .btn-text{
  position:relative;
  z-index:1;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:inherit;
  width:100%;
  height:100%;
  transition:color 0.25s ease;
  transition-delay:0.1s;
}
/* Primary CTA: navy base, slightly lighter oval gives the sweep contrast. */
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-primary.button .btn-fill{
  background-color:rgb(var(--mhd-accent));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-primary.button:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-btn-primary.button:focus-visible{
  background:rgb(var(--mhd-btn-bg));
  border-color:rgb(var(--mhd-btn-bg));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-notifications{
  position:relative;
  display:flex;
  align-items:center;
  flex-shrink:0;
  overflow:visible;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-notifications__panel{
  position:absolute;
  top:calc(100% + 0.5rem);
  right:0;
  z-index:60;
  width:min(22rem,calc(100vw - 1.5rem));
  max-width:calc(100vw - 2rem);
  overflow:hidden;
  border-radius:var(--mhd-radius-lg);
  border:1px solid rgb(var(--mhd-border));
  background:rgb(var(--mhd-white));
  box-shadow:0 1rem 3rem rgb(var(--mhd-shadow)/0.35);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-notifications__title{
  border-bottom:1px solid rgb(var(--mhd-border));
  padding:0.75rem 1rem;
  font-family:var(--mhd-font-body);
  font-size:0.875rem;
  font-weight:600;
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-notifications__list{
  max-height:24rem;
  overflow-y:auto;
  padding:0.75rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-notifications__empty{
  font-family:var(--mhd-font-body);
  font-size:0.875rem;
  color:rgb(var(--mhd-muted));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-notifications__items{
  display:flex;
  flex-direction:column;
  gap:0.75rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-notifications__item{
  display:block;
  border-radius:var(--mhd-radius-sm);
  padding:0.5rem;
  text-decoration:none;
  transition:background-color 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-notifications__item:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-notifications__item:focus-visible{
  background:rgb(var(--mhd-surface));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-notifications__kind{
  font-family:var(--mhd-font-body);
  font-size:0.65rem;
  font-weight:600;
  letter-spacing:0.14em;
  text-transform:uppercase;
  color:rgb(var(--mhd-muted));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-notifications__item-title{
  margin-top:0.125rem;
  font-family:var(--mhd-font-body);
  font-size:0.875rem;
  font-weight:500;
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-notifications__item-body{
  margin-top:0.125rem;
  font-family:var(--mhd-font-body);
  font-size:0.75rem;
  color:rgb(var(--mhd-muted));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-unread-messages{
  margin-top:1rem;
  border-radius:var(--mhd-radius-lg);
  border:1px solid rgb(var(--mhd-border));
  background:rgb(var(--mhd-white));
  padding:1rem 1.25rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-unread-messages__title{
  font-family:var(--mhd-font-body);
  font-size:0.75rem;
  font-weight:600;
  letter-spacing:0.12em;
  text-transform:uppercase;
  color:rgb(var(--mhd-muted));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-unread-messages__body{
  margin-top:0.5rem;
  font-family:var(--mhd-font-body);
  font-size:0.875rem;
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-unread-messages__link{
  display:inline-flex;
  margin-top:0.75rem;
  font-family:var(--mhd-font-body);
  font-size:0.875rem;
  font-weight:500;
  color:rgb(var(--mhd-text));
  text-decoration:underline;
  text-underline-offset:0.2em;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page{
  width:100%;
  --order-list-title:rgb(var(--mhd-text));
  --order-list-info:rgb(var(--mhd-text));
  --order-list-label:rgb(var(--mhd-muted));
  --order-list-border:rgb(var(--mhd-border));
  --order-list-empty-state-title:rgb(var(--mhd-text));
  --contrast-100:rgb(var(--mhd-border));
  --contrast-400:rgb(var(--mhd-muted));
  --contrast-500:rgb(var(--mhd-muted));
  --contrast-600:rgb(var(--mhd-text));
  --background:rgb(var(--mhd-white));
  --account-settings-section-title:rgb(var(--mhd-text));
  --account-settings-section-text:rgb(var(--mhd-text));
  --account-settings-section-border:rgb(var(--mhd-border));
  --address-list-section-border:rgb(var(--mhd-border));
  --address-list-section-title:rgb(var(--mhd-text));
  --address-list-section-name:rgb(var(--mhd-text));
  --address-list-section-info:rgb(var(--mhd-muted));
  --wishlists-section-title:rgb(var(--mhd-text));
  --wishlists-section-border:rgb(var(--mhd-border));
  --wishlist-details-title:rgb(var(--mhd-text));
  --wishlist-details-border:rgb(var(--mhd-border));
  --input-light-background:rgb(var(--mhd-white));
  --input-light-text:rgb(var(--mhd-text));
  --input-light-border:rgb(var(--mhd-border));
  --input-light-focus:rgb(var(--mhd-accent));
  --input-light-placeholder:rgb(var(--mhd-muted));
  --label-light-text:rgb(var(--mhd-muted));
  --foreground:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-settings{
  max-width:42rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page > section{
  max-width:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page h1{
  font-family:var(--mhd-font-heading);
  font-size:1.75rem;
  font-weight:600;
  line-height:1.2;
  letter-spacing:-0.02em;
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page h2{
  font-family:var(--mhd-font-heading);
  font-size:1.375rem;
  font-weight:600;
  line-height:1.25;
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings p{
  color:rgb(var(--mhd-muted));
}
/* Vibes Input: wrapper owns the border — do not double-style inner inputs */
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings input:not([type='checkbox']):not([type='radio']):not([type='hidden']){
  border:0 !important;
  box-shadow:none !important;
  outline:none !important;
  background:transparent !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings input:-webkit-autofill,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings input:-webkit-autofill:hover,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings input:-webkit-autofill:focus{
  -webkit-box-shadow:0 0 0 1000px rgb(var(--mhd-white)) inset !important;
  -webkit-text-fill-color:rgb(var(--mhd-text)) !important;
  transition:background-color 9999s ease-out 0s;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings form .rounded-lg.border{
  border-color:rgb(var(--mhd-border)) !important;
  background-color:rgb(var(--mhd-white)) !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings form .rounded-lg.border:focus-within{
  border-color:rgb(var(--mhd-accent)) !important;
  box-shadow:0 0 0 2px rgba(142,165,141,0.2);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings > section form button[type='submit']{
  background-color:#375a37 !important;
  border:1px solid #375a37 !important;
  color:#fff !important;
  border-radius:0.75rem !important;
  font-weight:600 !important;
  min-height:2.75rem;
  padding:0.625rem 1.25rem !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings > section form button[type='submit']:hover:not(:disabled){
  background-color:#2d4a2d !important;
  border-color:#2d4a2d !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings #addresses .address-list-actions{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:0.5rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings #addresses .address-list-actions .button,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings #addresses .address-list-actions button{
  background-color:rgb(var(--mhd-white)) !important;
  border:1px solid rgb(var(--mhd-border)) !important;
  color:rgb(var(--mhd-text)) !important;
  border-radius:0.75rem !important;
  font-weight:500 !important;
  min-height:2.25rem;
  padding:0.375rem 0.875rem !important;
  font-size:0.875rem !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings #addresses .address-list-actions .button:hover:not(:disabled),
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings #addresses .address-list-actions button:hover:not(:disabled){
  background-color:rgb(var(--mhd-surface)) !important;
  border-color:rgb(var(--mhd-border)) !important;
  color:rgb(var(--mhd-text)) !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings #addresses > section > header .button,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings #addresses > section > header button{
  background-color:rgb(var(--mhd-white)) !important;
  border:1px solid rgb(var(--mhd-border)) !important;
  color:rgb(var(--mhd-text)) !important;
  border-radius:0.75rem !important;
  font-weight:500 !important;
  min-height:2.25rem;
  padding:0.375rem 0.875rem !important;
  font-size:0.875rem !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .mhd-account-settings #addresses{
  max-width:none;
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page h1{
    font-size:2rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .subscription-portal-toggle{
  margin-bottom:1.25rem;
}
/* Order cards — match subscription shipment card outlines */
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .group\\/order-list > ul{
  gap:1rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .group\\/order-list > ul > li{
  background-color:rgb(var(--mhd-white)) !important;
  border:1px solid rgb(var(--mhd-border)) !important;
  border-radius:1rem !important;
  box-shadow:0 1px 2px rgba(49,47,47,0.04);
  overflow:hidden;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .group\\/order-list > ul > li > div:first-child{
  border-bottom:1px solid rgb(var(--mhd-border)) !important;
}
/* Wishlist list cards */
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .wishlist-list-item{
  background-color:rgb(var(--mhd-white)) !important;
  border:1px solid rgb(var(--mhd-border)) !important;
  border-radius:1rem !important;
  box-shadow:0 1px 2px rgba(49,47,47,0.04);
  overflow:hidden;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .wishlist-list-item > div:first-child{
  border-bottom:1px solid rgb(var(--mhd-border)) !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .group\\/wishlists > header h1{
  margin:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .group\\/wishlists > header button{
  background-color:#312f2f !important;
  background-image:none !important;
  border:1px solid #312f2f !important;
  color:#fff !important;
  border-radius:9999px !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .group\\/wishlists > header button:hover:not(:disabled){
  background-color:#1f1d1d !important;
  border-color:#1f1d1d !important;
  color:#fff !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .onboarding-health-form .rounded-2xl.border,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .onboarding-health-form .rounded-xl.border{
  border-color:rgb(var(--mhd-border)) !important;
  background-color:rgb(var(--mhd-white)) !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .onboarding-health-form input:not([type='checkbox']):not([type='radio']):not([type='hidden']),
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .onboarding-health-form select,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .onboarding-health-form textarea{
  border:1px solid rgb(var(--mhd-border));
  border-radius:0.75rem;
  background-color:rgb(var(--mhd-white));
  color:rgb(var(--mhd-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .onboarding-health-form button.liivv-btn-primary{
  background-color:#375a37 !important;
  border-color:#375a37 !important;
  color:#fff !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .onboarding-health-form button.liivv-option-pill{
  border:1px solid #d6d0c5 !important;
  background-color:#ffffff !important;
  background-image:none !important;
  color:#2c2a26 !important;
  padding:0.375rem 0.75rem !important;
  border-radius:9999px !important;
  margin:0 !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-account-page .onboarding-health-form button.liivv-option-pill.liivv-option-pill--active{
  border-color:#6b7f5c !important;
  background-color:#eef4ee !important;
  color:#2d4a2d !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage{
  position:relative;
  display:flex;
  flex-direction:column;
  align-items:center;
  min-height:28rem;
  padding:1.5rem 1rem 1.25rem;
  border-radius:var(--mhd-radius-lg);
  overflow:visible;
  background:linear-gradient(165deg,#faf8f5 0%,#f5f2ed 55%,#eef4ee 100%);
  border:1px solid rgb(var(--mhd-border));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage__canvas{
  position:relative;
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
  min-height:24rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot{
  all:unset;
  box-sizing:border-box;
  position:absolute;
  z-index:2;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  gap:0.35rem;
  max-width:11.5rem;
  margin:0;
  padding:0.15rem 0 0.45rem;
  border:0;
  background:transparent;
  color:#5c564c;
  font-family:var(--mhd-font-body);
  font-size:0.8125rem;
  font-weight:500;
  letter-spacing:0.01em;
  line-height:1.2;
  text-align:left;
  text-decoration:none;
  cursor:pointer;
  -webkit-appearance:none;
  appearance:none;
  transform:none;
  overflow:visible;
  box-shadow:0 1px 0 #d4c8b8;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot::-moz-focus-inner{
  border:0;
  padding:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot::before,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot::after{
  content:none !important;
  display:none !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--insurance{
  align-items:flex-end;
  text-align:right;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot__row{
  display:inline-flex;
  align-items:center;
  gap:0.4rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--insurance .mhd-olivia-hotspot__row{
  flex-direction:row-reverse;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot__summary{
  display:block;
  max-width:100%;
  color:#7a7268;
  font-size:0.6875rem;
  font-weight:500;
  line-height:1.35;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot:hover,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot:focus-visible,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot:active{
  color:#2c2a26;
  font-weight:500;
  font-size:0.8125rem;
  line-height:1.2;
  letter-spacing:0.01em;
  text-decoration:none;
  border:0;
  background:transparent;
  transform:none;
  box-shadow:0 1px 0 #8ea58d;
  margin:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot:focus-visible{
  outline:2px solid rgb(var(--mhd-accent));
  outline-offset:4px;
  border-radius:0.25rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--health{
  left:3%;
  top:10%;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--insurance{
  right:3%;
  top:10%;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot__mark{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:1.15rem;
  height:1.15rem;
  border-radius:999px;
  border:1px solid #c4b8a8;
  font-size:0.75rem;
  line-height:1;
  color:#312f2f;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--done .mhd-olivia-hotspot__mark{
  border-color:#8ea58d;
  color:#5a6d4d;
  background:#eef4ee;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-mascot{
  position:relative;
  z-index:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  animation:mhd-olivia-enter 0.7s cubic-bezier(0.22,1,0.36,1) both;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-bubble-anchor{
  position:relative;
  z-index:2;
  width:min(22rem,68vw);
  min-height:3.4rem;
  margin:0 0 0.55rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-bubble{
  position:absolute;
  left:calc(50% - 1.15rem);
  bottom:0;
  z-index:2;
  width:max-content;
  max-width:min(18rem,72vw);
  padding:0.7rem 0.95rem;
  border:1px solid #e4ddd3;
  border-radius:1.1rem;
  background:#fffdf9;
  box-shadow:0 8px 20px rgb(49 47 47 / 0.08);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-bubble::after{
  content:"";
  position:absolute;
  left:1.15rem;
  bottom:-7px;
  width:12px;
  height:12px;
  border-right:1px solid #e4ddd3;
  border-bottom:1px solid #e4ddd3;
  background:#fffdf9;
  transform:translateX(-50%) rotate(45deg);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-bubble__text{
  margin:0;
  color:#3f3b36;
  font-family:var(--mhd-font-body);
  font-size:0.8125rem;
  font-weight:500;
  line-height:1.4;
  text-align:left;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-mascot__sway{
  transform-origin:center bottom;
  animation:mhd-olivia-live 5.2s ease-in-out infinite;
  will-change:transform;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-mascot[data-mood="bounce"] .mhd-olivia-mascot__sway{
  animation:mhd-olivia-bounce 0.52s cubic-bezier(0.22,1,0.36,1) both;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-mascot[data-mood="celebrate"] .mhd-olivia-mascot__sway{
  animation:mhd-olivia-celebrate 1.2s ease-in-out both;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-mascot__figure{
  position:relative;
  width:min(22rem,68vw);
  aspect-ratio:1;
  transform-origin:center bottom;
  transition:transform 0.45s cubic-bezier(0.22,1,0.36,1);
  filter:drop-shadow(0 16px 12px rgb(49 47 47 / 0.18));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-mascot__image{
  object-fit:contain;
  object-position:center bottom;
  opacity:0;
  pointer-events:none;
  transition:opacity 0.16s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-mascot__image.is-on{
  opacity:1;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-mascot[data-mood="looking-health"] .mhd-olivia-mascot__figure{
  transform:rotate(-6deg) translateX(-12px);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-mascot[data-mood="looking-insurance"] .mhd-olivia-mascot__figure{
  transform:rotate(6deg) translateX(12px);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage__later{
  margin-top:0.5rem;
  padding:0.35rem 0.75rem;
  border:0;
  background:transparent;
  color:#8a8176;
  font-size:0.75rem;
  font-weight:500;
  text-decoration:underline;
  text-underline-offset:0.18em;
  cursor:pointer;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage__later:hover,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage__later:focus-visible{
  color:#312f2f;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-chip{
  margin-left:auto;
  padding:0.4rem 0.75rem;
  border:1px solid rgb(var(--mhd-border));
  border-radius:var(--mhd-radius-pill);
  background:#eef4ee;
  color:#3f523f;
  font-size:0.75rem;
  font-weight:600;
  cursor:pointer;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-chip:hover,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-chip:focus-visible{
  background:#e4eedf;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-hero__body--empty{
  min-height:8rem;
  justify-content:center;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-sheet{
  position:fixed;
  inset:0;
  z-index:240;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-sheet__backdrop{
  position:absolute;
  inset:0;
  border:0;
  background:rgb(49 47 47 / 0.32);
  cursor:pointer;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-sheet__panel{
  position:absolute;
  top:0;
  right:0;
  bottom:0;
  display:flex;
  flex-direction:column;
  width:min(36rem,100%);
  background:#faf8f5;
  box-shadow:-16px 0 40px rgb(49 47 47 / 0.12);
  animation:mhd-olivia-sheet-in 0.35s cubic-bezier(0.22,1,0.36,1) both;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-sheet__header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:1rem;
  padding:1.15rem 1.25rem;
  border-bottom:1px solid #e8e2d8;
  background:#fff;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-sheet__header h2{
  margin:0;
  font-family:var(--mhd-font-heading);
  font-size:1.35rem;
  font-weight:500;
  color:#312f2f;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-sheet__close{
  border:0;
  background:transparent;
  color:#6b6560;
  font-size:0.8125rem;
  font-weight:500;
  cursor:pointer;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-sheet__close:hover{
  color:#312f2f;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-sheet__body{
  flex:1;
  overflow:auto;
  padding:1.25rem 1.25rem 2rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-sheet__lead{
  margin:0;
  font-size:0.9375rem;
  line-height:1.5;
  color:#6b6560;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-sheet .onboarding-health-form input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]),
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-sheet .onboarding-health-form select,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-sheet .onboarding-health-form textarea{
  background:#fff;
}
@keyframes mhd-olivia-enter{
  from{opacity:0;transform:translateY(14px)}
  to{opacity:1;transform:translateY(0)}
}
@keyframes mhd-olivia-live{
  0%,100%{transform:translateY(0) rotate(-0.8deg)}
  50%{transform:translateY(-5px) rotate(0.8deg)}
}
@keyframes mhd-olivia-bounce{
  0%{transform:translateY(0) scale(1)}
  40%{transform:translateY(-10px) scale(1.03)}
  100%{transform:translateY(0) scale(1)}
}
@keyframes mhd-olivia-celebrate{
  0%,100%{transform:rotate(0deg) translateY(0)}
  25%{transform:rotate(-6deg) translateY(-5px)}
  50%{transform:rotate(6deg) translateY(-8px)}
  75%{transform:rotate(-3deg) translateY(-2px)}
}
@keyframes mhd-olivia-sheet-in{
  from{transform:translateX(100%)}
  to{transform:translateX(0)}
}
@media screen and (max-width:720px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage{
    min-height:0;
    padding:1.15rem 0.85rem 1rem;
  }
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage__canvas{
    flex-direction:column;
    gap:0.75rem;
    min-height:0;
  }
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--health,
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--insurance{
    position:static;
    align-items:center;
    max-width:100%;
    margin:0;
    text-align:center;
  }
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--insurance .mhd-olivia-hotspot__row{
    flex-direction:row;
  }
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-mascot{
    order:-1;
  }
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-mascot__figure{
    width:min(17rem,78vw);
  }
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-bubble-anchor{
    width:min(17rem,78vw);
  }
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-bubble{
    max-width:min(16rem,88vw);
  }
}
@media (prefers-reduced-motion:reduce){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-mascot,
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-mascot__sway,
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-mascot__figure,
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-sheet__panel,
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus,
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-switcher__tab{
    animation:none !important;
    transition:none !important;
    transform:none !important;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage--companion{
  min-height:0;
  padding:0.15rem 0.25rem 1rem;
  border:0;
  background:transparent;
  overflow:visible;
  max-width:100%;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage--companion .mhd-olivia-stage__canvas{
  min-height:0;
  width:100%;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage--companion .mhd-olivia-mascot{
  width:100%;
  max-width:100%;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage--companion .mhd-olivia-bubble-anchor{
  width:100%;
  height:4.75rem;
  min-height:4.75rem;
  margin:0 0 0.35rem;
  flex-shrink:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage--companion .mhd-olivia-bubble{
  position:absolute;
  left:0;
  right:0;
  bottom:0;
  width:100%;
  max-width:100%;
  padding:0.7rem 0.95rem;
  transform:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage--companion .mhd-olivia-bubble::after{
  left:50%;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage--companion .mhd-olivia-bubble__text{
  font-size:0.8125rem;
  overflow-wrap:anywhere;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage--companion .mhd-olivia-mascot__figure{
  width:min(17.5rem,58vw);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage__chips{
  display:flex;
  flex-direction:row;
  flex-wrap:nowrap;
  justify-content:center;
  align-items:center;
  gap:0.75rem;
  width:100%;
  margin-top:auto;
  padding:0.15rem 0 0.35rem;
  flex-shrink:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--chip{
  position:static;
  inset:auto;
  top:auto;
  right:auto;
  bottom:auto;
  left:auto;
  display:inline-flex;
  flex-direction:row;
  align-items:center;
  max-width:none;
  width:auto;
  height:1.7rem;
  margin:0;
  padding:0 0 0.2rem;
  border:0;
  border-radius:0;
  background:transparent;
  text-align:left;
  transform:none !important;
  translate:none !important;
  scale:none !important;
  rotate:none !important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--chip.mhd-olivia-hotspot--health,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--chip.mhd-olivia-hotspot--insurance{
  top:auto;
  right:auto;
  bottom:auto;
  left:auto;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--chip .mhd-olivia-hotspot__summary{
  display:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--chip.mhd-olivia-hotspot--insurance{
  align-items:flex-start;
  text-align:left;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--chip.mhd-olivia-hotspot--insurance .mhd-olivia-hotspot__row{
  flex-direction:row;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--chip:hover,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--chip:focus-visible,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-hotspot--chip:active{
  border:0;
  background:transparent;
  height:1.7rem;
  padding:0 0 0.2rem;
  transform:none !important;
  translate:none !important;
  scale:none !important;
  rotate:none !important;
  box-shadow:0 1px 0 #8ea58d;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-canvas{
  display:flex;
  flex-direction:column;
  gap:0.85rem;
  min-width:0;
  min-height:22rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-canvas .mhd-care-focus{
  flex:1 1 auto;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-switcher{
  display:flex;
  flex-wrap:wrap;
  gap:0.45rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-switcher__tab{
  display:inline-flex;
  align-items:center;
  gap:0.4rem;
  min-height:2.35rem;
  padding:0.4rem 0.85rem;
  border:1px solid rgb(var(--mhd-border));
  border-radius:var(--mhd-radius-pill);
  background:rgb(var(--mhd-white));
  color:rgb(var(--mhd-text));
  font-family:inherit;
  font-size:0.8125rem;
  font-weight:500;
  cursor:pointer;
  transition:background-color 0.2s ease,border-color 0.2s ease,color 0.2s ease,transform 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-switcher__tab:hover,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-switcher__tab:focus-visible{
  border-color:rgb(var(--mhd-accent));
  color:rgb(var(--mhd-accent));
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-switcher__tab.is-active{
  background:rgb(var(--mhd-accent));
  border-color:rgb(var(--mhd-accent));
  color:rgb(var(--mhd-white));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-switcher__emoji{
  font-size:0.95rem;
  line-height:1;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus{
  --care-wash:238 244 238;
  --care-ink:63 82 63;
  --care-muted:90 109 90;
  --care-accent:142 165 141;
  position:relative;
  display:grid;
  grid-template-columns:1fr;
  gap:1.25rem;
  overflow:hidden;
  padding:1.75rem 1.5rem 2.25rem;
  min-height:22rem;
  border:1px solid rgb(var(--mhd-border));
  border-radius:1.25rem;
  background:rgb(var(--care-wash));
  color:rgb(var(--care-ink));
  isolation:isolate;
  animation:mhd-care-focus-in 0.38s cubic-bezier(0.22,1,0.36,1) both;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus > .mhd-olivia-stage{
  position:relative;
  z-index:1;
  justify-self:center;
  width:100%;
  max-width:20rem;
  min-width:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus--empty{
  min-height:16rem;
}
@media screen and (min-width:820px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus{
    grid-template-columns:minmax(16rem,20rem) minmax(0,1fr);
    align-items:center;
    padding:2rem 2rem 2.35rem 1.5rem;
    gap:1.75rem 2.25rem;
    min-height:28rem;
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus[data-tone="peach"]{
  --care-wash:252 236 230;
  --care-ink:92 58 48;
  --care-muted:132 92 82;
  --care-accent:214 148 136;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus[data-tone="rose"]{
  --care-wash:250 232 232;
  --care-ink:92 48 52;
  --care-muted:138 86 90;
  --care-accent:196 112 118;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus[data-tone="lavender"]{
  --care-wash:236 232 244;
  --care-ink:62 54 92;
  --care-muted:102 92 132;
  --care-accent:142 132 186;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus[data-tone="sand"]{
  --care-wash:246 237 224;
  --care-ink:82 64 42;
  --care-muted:126 104 78;
  --care-accent:196 156 110;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus[data-tone="mist"]{
  --care-wash:230 240 242;
  --care-ink:42 70 76;
  --care-muted:82 110 116;
  --care-accent:110 156 162;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus__wash{
  position:absolute;
  inset:auto -8% -18% auto;
  width:min(22rem,48%);
  aspect-ratio:1;
  z-index:0;
  background-size:cover;
  background-position:center;
  opacity:0.18;
  filter:saturate(0.85);
  pointer-events:none;
  mask-image:radial-gradient(circle at center,black 40%,transparent 74%);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus__copy,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-tip{
  position:relative;
  z-index:1;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus__copy{
  display:flex;
  flex-direction:column;
  justify-content:center;
  gap:1rem;
  min-width:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus__meta{
  display:flex;
  flex-wrap:wrap;
  align-items:baseline;
  justify-content:space-between;
  gap:0.4rem 1rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus__eyebrow{
  margin:0;
  font-size:0.6875rem;
  font-weight:600;
  letter-spacing:0.08em;
  text-transform:uppercase;
  color:rgb(var(--care-muted));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus__date{
  margin:0;
  font-size:0.75rem;
  color:rgb(var(--care-muted));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus__heading-row{
  display:flex;
  flex-wrap:wrap;
  align-items:flex-start;
  gap:0.55rem 0.75rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus__title{
  margin:0;
  font-family:var(--mhd-font-heading);
  font-size:clamp(1.85rem,1.25rem + 1.8vw,2.75rem);
  font-weight:500;
  line-height:1.12;
  letter-spacing:-0.03em;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-badge{
  display:inline-flex;
  align-items:center;
  margin-top:0.2rem;
  padding:0.22rem 0.6rem;
  border-radius:var(--mhd-radius-pill);
  background:rgb(255 255 255 / 0.7);
  color:rgb(var(--care-ink));
  font-size:0.6875rem;
  font-weight:600;
  letter-spacing:0.04em;
  text-transform:uppercase;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus__lead,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus__soon{
  margin:0;
  max-width:40rem;
  font-size:1.0625rem;
  line-height:1.5;
  color:rgb(var(--care-ink) / 0.92);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus__soon{
  font-size:0.9375rem;
  color:rgb(var(--care-muted));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus__tip{
  margin:0;
  max-width:40rem;
  font-size:1rem;
  line-height:1.5;
  color:rgb(var(--care-muted));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-snapshot{
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  gap:0.55rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-snapshot__label{
  margin:0;
  font-size:0.6875rem;
  font-weight:600;
  letter-spacing:0.08em;
  text-transform:uppercase;
  color:rgb(var(--care-muted));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-snapshot__list{
  display:flex;
  flex-wrap:wrap;
  gap:0.45rem;
  margin:0;
  padding:0;
  list-style:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-chip{
  display:flex;
  flex-direction:column;
  gap:0.1rem;
  max-width:16rem;
  padding:0.45rem 0.7rem 0.5rem;
  border:1px solid rgb(255 255 255 / 0.7);
  border-radius:0.85rem;
  background:rgb(255 255 255 / 0.72);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-chip__label{
  font-size:0.625rem;
  font-weight:600;
  letter-spacing:0.06em;
  text-transform:uppercase;
  color:rgb(var(--care-muted));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-chip__value{
  font-size:0.8125rem;
  font-weight:500;
  line-height:1.3;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-snapshot__empty{
  margin:0;
  font-size:0.8125rem;
  line-height:1.4;
  color:rgb(var(--care-muted));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-snapshot__edit{
  margin:0;
  padding:0;
  border:0;
  background:transparent;
  color:rgb(var(--care-ink));
  font-family:inherit;
  font-size:0.8125rem;
  font-weight:500;
  text-decoration:underline;
  text-underline-offset:0.16em;
  cursor:pointer;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-focus__actions{
  display:flex;
  flex-wrap:wrap;
  gap:0.5rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:2.65rem;
  padding:0.65rem 1.2rem;
  border-radius:var(--mhd-radius-pill);
  font-family:inherit;
  font-size:0.875rem;
  font-weight:500;
  text-decoration:none;
  cursor:pointer;
  transition:transform 0.15s ease,background-color 0.2s ease,border-color 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-btn--primary{
  border:1px solid rgb(var(--mhd-btn-bg));
  background:rgb(var(--mhd-btn-bg));
  color:rgb(var(--mhd-btn-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-btn--ghost{
  border:1px solid rgb(var(--care-ink) / 0.22);
  background:rgb(255 255 255 / 0.62);
  color:rgb(var(--care-ink));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-btn:hover,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-btn:focus-visible{
  transform:translateY(-1px);
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-tip{
  display:flex;
  flex-direction:column;
  justify-content:flex-end;
  gap:0.4rem;
  min-height:8.5rem;
  padding:1.05rem 1.1rem 1.15rem;
  border-radius:1rem;
  background:rgb(49 47 47 / 0.78);
  color:#fffdf9;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-tip__kicker{
  margin:0;
  font-size:0.625rem;
  font-weight:600;
  letter-spacing:0.1em;
  text-transform:uppercase;
  color:rgb(255 255 255 / 0.62);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-tip__title{
  margin:0;
  font-family:var(--mhd-font-heading);
  font-size:1.05rem;
  font-weight:500;
  letter-spacing:-0.02em;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-tip__body{
  margin:0;
  font-size:0.8125rem;
  line-height:1.45;
  color:rgb(255 255 255 / 0.9);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-steps{
  display:flex;
  flex-direction:column;
  gap:0.6rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-steps__title{
  margin:0;
  font-size:0.75rem;
  font-weight:600;
  letter-spacing:0.08em;
  text-transform:uppercase;
  color:rgb(var(--mhd-muted));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-steps__grid{
  display:grid;
  grid-template-columns:1fr;
  gap:0.55rem;
}
@media screen and (min-width:700px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-steps__grid{
    grid-template-columns:repeat(3,minmax(0,1fr));
  }
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-step{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:0.75rem;
  min-height:4.5rem;
  padding:0.85rem 0.95rem;
  border:1px solid rgb(var(--mhd-border));
  border-radius:1rem;
  background:rgb(var(--mhd-white));
  color:rgb(var(--mhd-text));
  text-decoration:none;
  transition:border-color 0.2s ease,box-shadow 0.2s ease,transform 0.15s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-step:hover,
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-step:focus-visible{
  border-color:rgb(var(--mhd-accent));
  box-shadow:0 8px 18px rgb(var(--mhd-shadow) / 0.28);
  outline:none;
  transform:translateY(-1px);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-step__text{
  display:flex;
  flex-direction:column;
  gap:0.2rem;
  min-width:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-step__label{
  font-size:0.875rem;
  font-weight:500;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-step__hint{
  font-size:0.75rem;
  line-height:1.35;
  color:rgb(var(--mhd-muted));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-step__chevron{
  display:inline-flex;
  color:rgb(var(--mhd-navy));
  flex-shrink:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-care-step__chevron svg{
  width:1.2rem;
  height:1.2rem;
}
@keyframes mhd-care-focus-in{
  from{opacity:0;transform:translateY(8px)}
  to{opacity:1;transform:translateY(0)}
}
@media screen and (max-width:720px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-olivia-stage--companion .mhd-olivia-mascot__figure{
    width:min(13.5rem,56vw);
  }
}
`;
