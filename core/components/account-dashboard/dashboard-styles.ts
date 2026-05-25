/** Scoped root for the member health dashboard (PC Health archive layout). */
export const ACCOUNT_DASHBOARD_ROOT_ID = 'liivv-account-dashboard';

export const ACCOUNT_DASHBOARD_STYLE = `
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
  --mhd-max:70rem;
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
  flex-direction:column;
  isolation:isolate;
  overflow:hidden;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}
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
  height:2.75rem;
  width:auto;
  object-fit:contain;
  flex-shrink:0;
}
@media screen and (min-width:900px){
  #${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-logo__img{
    height:3.25rem;
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
  inset-inline-end:1rem;
  top:calc(100% + 0.25rem);
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
  padding:0 1.25rem;
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
  width:2.75rem;
  height:2.75rem;
  border-radius:999px;
  border:1px solid rgb(var(--mhd-border));
  background:rgb(var(--mhd-white));
  color:rgb(var(--mhd-text));
  text-decoration:none;
  position:relative;
  cursor:pointer;
  transition:background-color 0.2s ease,border-color 0.2s ease,color 0.2s ease;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-icon-btn:hover,#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-icon-btn:focus-visible{
  background:rgb(var(--mhd-surface));
  border-color:rgb(var(--mhd-muted));
  color:rgb(var(--mhd-accent));
  outline:none;
}
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-icon-btn svg{
  width:1.35rem;
  height:1.35rem;
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
#${ACCOUNT_DASHBOARD_ROOT_ID} .mhd-badge{
  position:absolute;
  top:0.35rem;
  right:0.35rem;
  min-width:1.125rem;
  height:1.125rem;
  padding:0 0.25rem;
  border-radius:999px;
  background:rgb(var(--mhd-btn-bg));
  color:rgb(var(--mhd-btn-text));
  font-family:var(--mhd-font-body);
  font-size:0.625rem;
  font-weight:500;
  line-height:1.125rem;
  text-align:center;
  z-index:2;
}
`;
