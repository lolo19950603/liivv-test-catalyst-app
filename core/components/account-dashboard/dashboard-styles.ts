/** Scoped root for the member portal (archive RGB channel vars, Poppins via diabetes-care-sections.css). */
export const ACCOUNT_DASHBOARD_ROOT_ID = 'liivv-account-dashboard';

export const ACCOUNT_DASHBOARD_STYLE = `
#${ACCOUNT_DASHBOARD_ROOT_ID}{
  --section-padding-top:0px;
  --section-padding-bottom:0px;
  --color-background:142 165 141;
  --color-foreground:49 47 47;
  --color-highlight:243 199 190;
  --color-border:var(--color-foreground)/0.12;
  --color-base-background:255 255 255;
  --color-base-text:49 47 47;
  --color-button-background:255 255 255;
  --color-button-border:255 255 255;
  --color-button-text:49 47 47;
  --card-radius:1.25rem;
  --adc-sidebar-width:min(17.5rem,88vw);
  --adc-topbar-height:4.25rem;
  font-family:var(--font-body-family,Poppins,sans-serif);
  color:rgb(var(--color-foreground));
  background-color:rgb(var(--color-background));
  position:fixed;
  inset:0;
  z-index:200;
  display:flex;
  flex-direction:column;
  isolation:isolate;
}
/* Hide storefront chrome while the portal is mounted (header icons in screenshot were the store header). */
body.adc-portal-active #liivv-site-header,
body.adc-portal-active .liivv-archive-header,
body.adc-portal-active .site-header-slideshow,
body.adc-portal-active footer{
  display:none!important;
}
body.adc-portal-active main{
  padding:0!important;
  max-width:none!important;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-topbar{
  flex:0 0 auto;
  min-height:var(--adc-topbar-height);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:1rem;
  padding:0.75rem clamp(1rem,3vw,2rem);
  background-color:rgb(var(--color-base-background));
  border-bottom:1px solid rgb(var(--color-border));
  box-shadow:0 1px 0 rgb(var(--color-foreground)/0.04);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-topbar__brand{
  display:flex;
  flex-direction:column;
  gap:0.125rem;
  min-width:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-topbar__eyebrow{
  font-size:0.6875rem;
  letter-spacing:0.14em;
  text-transform:uppercase;
  opacity:0.72;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-topbar__title{
  font-family:var(--font-heading-family,Poppins,sans-serif);
  font-size:clamp(1.125rem,2.5vw,1.5rem);
  font-weight:600;
  line-height:1.2;
  margin:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-topbar__actions{
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  justify-content:flex-end;
  gap:0.5rem;
  flex-shrink:0;
  max-width:min(100%,22rem);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-icon-btn{
  position:relative;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:2.75rem;
  height:2.75rem;
  border-radius:999px;
  border:1px solid rgb(var(--color-border));
  background:rgb(var(--color-base-background));
  color:rgb(var(--color-foreground));
  cursor:pointer;
  transition:background-color 0.2s ease,border-color 0.2s ease,color 0.2s ease;
  text-decoration:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-icon-btn:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-icon-btn:focus-visible{
  background-color:rgb(var(--color-highlight)/0.35);
  border-color:rgb(var(--color-foreground)/0.2);
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-icon-btn svg{width:1.35rem;height:1.35rem}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-badge{
  position:absolute;
  top:0.35rem;
  right:0.35rem;
  min-width:1.125rem;
  height:1.125rem;
  padding:0 0.25rem;
  border-radius:999px;
  background:rgb(var(--color-foreground));
  color:rgb(var(--color-base-background));
  font-size:0.625rem;
  font-weight:700;
  line-height:1.125rem;
  text-align:center;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-sign-out{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:2.75rem;
  padding:0 1.125rem;
  border-radius:999px;
  border:1px solid rgb(var(--color-foreground));
  background:rgb(var(--color-foreground));
  color:rgb(var(--color-base-background));
  font-size:0.875rem;
  font-weight:600;
  text-decoration:none;
  transition:background-color 0.2s ease,color 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-sign-out:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-sign-out:focus-visible{
  background:rgb(var(--color-base-background));
  color:rgb(var(--color-foreground));
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-body{
  flex:1 1 auto;
  min-height:0;
  display:flex;
  overflow:hidden;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-sidebar{
  flex:0 0 var(--adc-sidebar-width);
  width:var(--adc-sidebar-width);
  display:flex;
  flex-direction:column;
  gap:0.375rem;
  padding:1.25rem 0.75rem 1.25rem 1rem;
  border-inline-end:1px solid rgb(var(--color-foreground)/0.08);
  overflow-y:auto;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-nav-btn{
  display:flex;
  align-items:center;
  gap:0.75rem;
  width:100%;
  padding:0.75rem 1rem;
  border:0;
  border-radius:var(--card-radius);
  background:transparent;
  color:rgb(var(--color-foreground));
  font:inherit;
  font-size:0.9375rem;
  font-weight:500;
  text-align:start;
  cursor:pointer;
  transition:background-color 0.2s ease,color 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-nav-btn:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-nav-btn:focus-visible{
  background:rgb(var(--color-base-background)/0.55);
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-nav-btn[data-active=true]{
  background:rgb(var(--color-base-background));
  box-shadow:0 1px 0 rgb(var(--color-foreground)/0.06);
  font-weight:600;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-nav-btn__icon{
  flex:0 0 1.75rem;
  width:1.75rem;
  height:1.75rem;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border-radius:0.5rem;
  background:rgb(var(--color-highlight)/0.45);
  font-size:0.875rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-main{
  flex:1 1 auto;
  min-width:0;
  overflow-y:auto;
  padding:clamp(1rem,3vw,2rem);
  -webkit-overflow-scrolling:touch;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-mobile-nav{
  display:flex;
  gap:0.5rem;
  overflow-x:auto;
  padding-bottom:1rem;
  margin-bottom:0.5rem;
  scrollbar-width:none;
  -ms-overflow-style:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-mobile-nav::-webkit-scrollbar{display:none}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-mobile-nav .adc-nav-btn{
  flex:0 0 auto;
  width:auto;
  white-space:nowrap;
  padding:0.625rem 1rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-panel{
  display:none;
  animation:adc-fade-in 0.35s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-panel[data-active=true]{display:block}
@keyframes adc-fade-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-panel__header{margin-bottom:1.5rem}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-panel__title{
  font-family:var(--font-heading-family,Poppins,sans-serif);
  font-size:clamp(1.5rem,4vw,2.25rem);
  font-weight:600;
  line-height:1.15;
  margin:0 0 0.5rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-panel__lead{
  margin:0;
  max-width:42rem;
  font-size:1rem;
  line-height:1.6;
  opacity:0.88;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-grid{
  display:grid;
  gap:1rem;
  grid-template-columns:repeat(auto-fill,minmax(min(100%,16rem),1fr));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-card{
  background-color:#fff;
  background-color:rgb(var(--color-base-background));
  border-radius:var(--card-radius);
  padding:1.25rem 1.375rem;
  box-shadow:0 4px 24px rgb(23 23 23/0.08);
  color:rgb(var(--color-base-text));
  min-width:0;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-card__label{
  font-size:0.75rem;
  letter-spacing:0.08em;
  text-transform:uppercase;
  opacity:0.65;
  margin:0 0 0.35rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-card__value{
  margin:0;
  font-size:1.375rem;
  font-weight:600;
  line-height:1.2;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-card__meta{
  margin:0.5rem 0 0;
  font-size:0.875rem;
  line-height:1.5;
  opacity:0.8;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-stat-highlight{
  color:rgb(var(--color-highlight));
  filter:saturate(1.15);
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-list{
  list-style:none;
  margin:0;
  padding:0;
  display:flex;
  flex-direction:column;
  gap:0.75rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-list-item{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:1rem;
  padding:1rem 1.125rem;
  background:rgb(var(--color-base-background));
  border-radius:var(--card-radius);
  color:rgb(var(--color-base-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-pill{
  display:inline-flex;
  align-items:center;
  padding:0.25rem 0.625rem;
  border-radius:999px;
  font-size:0.75rem;
  font-weight:600;
  background:rgb(var(--color-highlight)/0.55);
  color:rgb(var(--color-base-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-button{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:2.75rem;
  padding:0 1.25rem;
  border-radius:999px;
  border:1px solid rgb(var(--color-button-border));
  background:rgb(var(--color-button-background));
  color:rgb(var(--color-button-text));
  font-size:0.875rem;
  font-weight:600;
  text-decoration:none;
  cursor:pointer;
  transition:background-color 0.2s ease,color 0.2s ease,border-color 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-button:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-button:focus-visible{
  background:rgb(var(--color-button-text));
  color:rgb(var(--color-button-background));
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-button--dark{
  --color-button-background:49 47 47;
  --color-button-border:49 47 47;
  --color-button-text:255 255 255;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-profile-grid{
  display:grid;
  gap:1rem;
  grid-template-columns:1fr;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-field{
  display:flex;
  flex-direction:column;
  gap:0.35rem;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-field label{
  font-size:0.8125rem;
  font-weight:600;
  opacity:0.75;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-field input,#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-field select{
  min-height:2.75rem;
  padding:0 0.875rem;
  border-radius:0.75rem;
  border:1px solid rgb(var(--color-border));
  background:rgb(var(--color-base-background));
  color:rgb(var(--color-base-text));
  font:inherit;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-help{
  position:fixed;
  inset-inline-end:clamp(1rem,3vw,1.75rem);
  inset-block-end:clamp(1rem,3vw,1.75rem);
  z-index:210;
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap:0.75rem;
  pointer-events:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-help>*{pointer-events:auto}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-help-panel{
  width:min(22rem,calc(100vw - 2rem));
  max-height:min(24rem,50vh);
  display:none;
  flex-direction:column;
  background:rgb(var(--color-base-background));
  border-radius:var(--card-radius);
  box-shadow:0 12px 40px rgb(23 23 23/0.18);
  overflow:hidden;
  color:rgb(var(--color-base-text));
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-help-panel[data-open=true]{display:flex}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-help-panel__head{
  padding:1rem 1.125rem;
  border-bottom:1px solid rgb(var(--color-border));
  font-weight:600;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-help-panel__body{
  padding:1rem 1.125rem;
  overflow-y:auto;
  font-size:0.9375rem;
  line-height:1.55;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-help-toggle{
  width:3.5rem;
  height:3.5rem;
  border-radius:999px;
  border:0;
  background:rgb(var(--color-foreground));
  color:rgb(var(--color-base-background));
  box-shadow:0 8px 24px rgb(23 23 23/0.22);
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:1.25rem;
  font-weight:700;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-help-toggle:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .adc-help-toggle:focus-visible{
  background:rgb(var(--color-base-text));
  outline:none;
}
@media screen and (max-width:767px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .adc-sidebar{display:none}
}
@media screen and (min-width:768px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .adc-mobile-nav{display:none}
  #${ACCOUNT_DASHBOARD_ROOT_ID} .adc-profile-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media screen and (min-width:1024px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .adc-grid--stats{grid-template-columns:repeat(4,minmax(0,1fr))}
}
`;
