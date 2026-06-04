export const PRODUCT_SINGULAR_FAQ_SECTION_ID =
  'shopify-section-template--26374736773411__faq';

export const PRODUCT_SINGULAR_FAQ_VARS =
  `#${PRODUCT_SINGULAR_FAQ_SECTION_ID}{--section-padding-top:40px;--section-padding-bottom:48px;--gradient-background:linear-gradient(90deg,rgba(123,84,84,1),rgba(196,207,164,1) 100%);--color-background:196 207 164;--color-foreground:255 255 255;--color-border:var(--color-foreground)/0.1;--color-border-dark:var(--color-foreground)/0.4;--color-border-light:var(--color-foreground)/0.06;--color-button-background:255 255 255;--color-button-border:255 255 255;--color-button-text:98 101 76;--color-overlay:23 23 23;--overlay-opacity:0.2}`;

function escapeSectionId(sectionId: string): string {
  return sectionId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Archive FAQ contact form panel + field stack (product-singular-page.html). */
function productSingularFaqFormPanelCss(sectionId: string): string {
  const id = escapeSectionId(sectionId);

  return (
    `#${id} .faqs.with-background>form.grow-0{` +
    `background-color:rgb(var(--color-overlay,23 23 23)/var(--overlay-opacity,0.2));` +
    `border-end-start-radius:var(--rounded-block,1.5rem);` +
    `border-end-end-radius:var(--rounded-block,1.5rem)}` +
    `#${id} .faqs.with-background>form.grow-0 :is(.input,.textarea){` +
    `background-color:color-mix(in srgb,rgb(var(--color-foreground)) 4%,rgb(var(--color-background)) 12%)!important}` +
    `@media screen and (min-width:1024px){` +
    `#${id} .faqs.with-background>form.grow-0{` +
    `border-end-start-radius:0;` +
    `border-end-end-radius:var(--rounded-block,1.5rem);` +
    `border-start-end-radius:var(--rounded-block,1.5rem)}}` +
    `#${id} .faqs .contact__sidebar>.flex{flex-direction:column;align-items:flex-start}` +
    `@media screen and (min-width:640px){` +
    `#${id} .faqs .contact__sidebar>.flex{flex-direction:row;align-items:flex-end}}` +
    `@media screen and (min-width:1024px){` +
    `#${id} .faqs .contact__sidebar>.flex{flex-direction:column;align-items:flex-start}}` +
    `@media screen and (min-width:1024px){` +
    `#${id} .faqs.with-background .contact__sidebar{width:clamp(340px,25vw,430px)}}`
  );
}

/** Mobile: prevent stretched fields when the sidebar/form participates in flex layout. */
function productSingularFaqMobileFormCss(sectionId: string): string {
  const id = escapeSectionId(sectionId);

  return (
    `@media screen and (max-width:767px){` +
    `#${id} .faqs.with-background{gap:var(--sp-8,2rem)}` +
    `#${id} .faqs.with-background>.grid.grow{flex:0 0 auto;width:100%;max-width:100%}` +
    `#${id} .faqs.with-background>form.grow-0{flex:0 0 auto;width:100%;max-width:100%}` +
    `#${id} .contact__sidebar{height:auto!important;min-height:0!important}` +
    `#${id} .contact__sidebar>.grid{height:auto!important;grid-auto-rows:auto!important;align-content:start!important}` +
    `#${id} .contact__sidebar .field{height:auto!important;min-height:0!important;align-self:stretch}` +
    `#${id} .contact__sidebar .field .input.is-floating{` +
    `height:calc(var(--input-height,3.25rem) + var(--sp-2d5,0.625rem))!important;` +
    `min-height:0!important;flex:none!important}` +
    `#${id} .contact__sidebar .field .textarea.is-floating{` +
    `height:auto!important;min-height:5.5rem!important;flex:none!important}}`
  );
}

/** Contact sidebar + layout fixes (archive product-singular FAQ). */
function productSingularFaqContactFormCss(sectionId: string): string {
  const id = escapeSectionId(sectionId);

  return (
    `#${id} .faqs.with-background .contact__sidebar{color:rgb(var(--color-foreground))}` +
    `#${id} .faqs.with-background .contact__sidebar .text-opacity{color:rgb(var(--color-foreground)/0.6)}` +
    `#${id} .faqs.with-background .contact__sidebar .field .label.is-floating{color:rgb(var(--color-foreground)/0.6)}` +
    `#${id} .faqs.with-background .contact__sidebar .field :is(.input,.textarea){` +
    `width:100%!important;max-width:100%!important;box-sizing:border-box;` +
    `border:0!important;` +
    `border-radius:var(--inputs-radius,var(--rounded-input))!important;` +
    `background-color:rgb(var(--color-foreground)/0.045)!important;` +
    `color:rgb(var(--color-foreground))!important;` +
    `box-shadow:none!important}` +
    `#${id} .faqs.with-background .contact__sidebar .field :is(.input,.textarea):focus{` +
    `background-color:rgb(var(--color-foreground)/0.115)!important;` +
    `outline:none!important;box-shadow:none!important}` +
    `#${id} .faqs.with-background .contact__sidebar .field :is(.input,.textarea):-webkit-autofill,` +
    `#${id} .faqs.with-background .contact__sidebar .field :is(.input,.textarea):-webkit-autofill:hover,` +
    `#${id} .faqs.with-background .contact__sidebar .field :is(.input,.textarea):-webkit-autofill:focus{` +
    `-webkit-text-fill-color:rgb(var(--color-foreground))!important;` +
    `caret-color:rgb(var(--color-foreground));` +
    `transition:background-color 9999s ease-in-out 0s;` +
    `box-shadow:0 0 0 1000px rgb(var(--color-foreground)/0.045) inset!important}` +
    `#${id} .faqs.with-background .contact__sidebar .button.button--primary.button--fixed{` +
    `display:inline-flex!important;` +
    `color:rgb(var(--color-button-text,98 101 76))!important;` +
    `background-color:rgb(var(--color-button-background,255 255 255))!important;` +
    `border-radius:var(--buttons-radius,var(--rounded-button))!important;` +
    `min-width:var(--sp-48,12rem);border:none}` +
    `#${id} .faqs.with-background .contact__sidebar .button.button--primary .btn-text{` +
    `position:relative;z-index:1;color:inherit!important}` +
    `#${id} .faqs.with-background .contact__sidebar .button.button--primary .btn-fill{display:block}` +
    `#${id} .faqs.with-background .contact__sidebar .button.button--primary .btn-loader{display:none}` +
    `@media screen and (pointer:fine){` +
    `#${id} .faqs.with-background .contact__sidebar .button.button--primary.button--fixed:hover:not([disabled]),` +
    `#${id} .faqs.with-background .contact__sidebar .button.button--primary.button--fixed:hover:not([disabled]) .btn-text{` +
    `color:rgb(var(--color-foreground))!important}}`
  );
}

/** Scoped fixes: archive form layout, heading color on gradient, intro link hover. */
export function productSingularFaqScopedCss(sectionId: string): string {
  const id = escapeSectionId(sectionId);

  return (
    `#${id} .section--plain{background-color:transparent}` +
    `#${id} .section--plain:before{display:none!important}` +
    `#${id} .faqs.with-background{color:rgb(var(--color-foreground))}` +
    `#${id} .faqs.with-background .heading,#${id} .faqs.with-background .heading .split-words,#${id} .faqs.with-background .heading .word{color:inherit}` +
    `#${id} .faqs.with-background .title-wrapper{` +
    `display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;` +
    `gap:var(--sp-4,1rem);margin-block-end:0;width:100%}` +
    `@media screen and (min-width:1280px){#${id} .faqs.with-background .title-wrapper{` +
    `flex-direction:column;align-items:flex-start;justify-content:flex-start}}` +
    `#${id} .faqs.with-background .page-width--narrow{width:100%;max-width:42rem}` +
    `#${id} .faqs.with-background .field{min-width:0;width:100%}` +
    `#${id} .faqs.with-background form.grow-0{min-width:0;width:100%}` +
    `@media screen and (min-width:1024px){` +
    `#${id} .faqs.with-background>.grid.grow{flex:0 0 60%;width:60%;max-width:60%;min-width:0}` +
    `#${id} .faqs.with-background>form.grow-0{flex:0 0 40%;width:40%;max-width:40%;min-width:0}}` +
    `#${id} .faqs.with-background .rte a:not(.button,.reversed-link){color:inherit}` +
    `@media screen and (pointer:fine){#${id} .faqs.with-background .rte a:not(.button,.reversed-link):hover{background-size:100% 1px}}` +
    productSingularFaqFormPanelCss(sectionId) +
    productSingularFaqMobileFormCss(sectionId) +
    productSingularFaqContactFormCss(sectionId)
  );
}
