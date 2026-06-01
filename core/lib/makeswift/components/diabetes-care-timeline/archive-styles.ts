/** Archive `.timeline-dots` rules from `diabetes-care-sections.css`, scoped per section. */
export function timelineDotsCss(sectionDomId: string): string {
  const root = `#${sectionDomId}`;

  return (
    `${root} .scroll-area{overflow:visible;scroll-snap-type:none}` +
    `@media screen and (min-width:1024px){${root} .timeline-dots--desktop{display:grid!important;grid-template-rows:auto;grid-template-columns:repeat(var(--section-blocks-count,5),minmax(0,1fr));width:100%;min-width:100%;max-width:100%;margin-block-start:var(--sp-8);gap:var(--sp-2d5,0.625rem)}}` +
    `${root} .timeline-dots button{display:flex;flex-direction:row;align-items:center;width:100%;min-width:0;word-break:normal;transition:color var(--animation-primary)}` +
    `${root} .timeline-dots__label{display:block;flex:0 1 auto;max-width:100%;white-space:normal;line-height:1.15;text-wrap:balance}` +
    `${root} .timeline-dots button[aria-current=true]{color:var(--timeline-step-active-color,rgb(var(--color-foreground)))}` +
    `${root} .timeline-dots button[aria-current=false]{color:var(--timeline-step-inactive-color,rgb(var(--color-foreground)/.25))}` +
    `${root} .timeline-dots button[aria-current=true]:hover{color:var(--timeline-step-active-color,rgb(var(--color-foreground)))}` +
    `${root} .timeline-dots button[aria-current=false]:hover{color:var(--timeline-step-inactive-color,rgb(var(--color-foreground)/.25))}` +
    `${root} .timeline-dots button:after{content:"";display:block;flex:1 1 auto;background-color:var(--timeline-step-connector-color,rgb(var(--color-foreground)/.25));width:auto;height:1px;min-width:var(--sp-10);margin-inline-start:var(--sp-2d5,0.625rem)}` +
    `${root} .timeline-dots-mobile .timeline-dots-mobile__label{color:var(--timeline-step-active-color,rgb(var(--color-foreground)))}` +
    `@media screen and (min-width:768px){${root} .timeline-dots button:after{min-width:var(--sp-24)}}` +
    `@media screen and (min-width:1024px){${root} .timeline-dots button:after{min-width:unset}}` +
    `@media screen and (min-width:1280px){${root} .timeline-dots button{font-size:var(--fluid-base-to-2xl);letter-spacing:-.025em}${root} .timeline-dots{margin-block-start:var(--sp-14)}}` +
    `@media screen and (pointer:fine){${root} .title-wrapper .indicators .button.button--secondary:not(:disabled){transition:color var(--animation-primary),border-color var(--animation-primary)}${root} .title-wrapper .indicators .button.button--secondary:not(:disabled):after{transition:border var(--animation-primary)}${root} .title-wrapper .indicators .button.button--secondary:not(:disabled) .btn-text{position:relative;z-index:1;transition:color var(--animation-primary);transition-delay:.1s}${root} .title-wrapper .indicators .button.button--secondary:not(:disabled) .btn-fill{transition:background-color var(--animation-primary)}${root} .title-wrapper .indicators .button.button--secondary:not(:disabled) svg{transition:stroke var(--animation-primary);transition-delay:.1s}}` +
    `${root} .title-wrapper .indicators .button.button--secondary:not(:disabled){--border-opacity:1;--color-button-border:var(--timeline-arrow-active-channels,var(--color-button-border));--color-button-background:var(--timeline-arrow-active-channels,var(--color-button-background));--color-button-text:var(--timeline-arrow-active-channels,var(--color-button-text));color:var(--timeline-arrow-active-color,rgb(var(--color-button-background)))}` +
    `${root} .title-wrapper .indicators .button.button--secondary:not(:disabled) .btn-text{color:inherit}` +
    `${root} .title-wrapper .indicators .button.button--secondary:not(:disabled) svg{stroke:currentColor}` +
    `.js [data-button-hover=standard] ${root} .title-wrapper .indicators .button.button--secondary:not(:disabled,.self-button):hover{--border-opacity:1;--color-button-border:var(--timeline-arrow-active-channels,var(--color-button-border));--color-button-background:var(--timeline-arrow-active-channels,var(--color-button-background));--color-button-text:var(--timeline-arrow-active-channels,var(--color-button-text));color:var(--timeline-arrow-hover-text-color,var(--timeline-arrow-active-color,rgb(var(--color-button-background))))}` +
    `.js [data-button-hover=standard] ${root} .title-wrapper .indicators .button.button--secondary:not(:disabled,.self-button):hover .btn-text{color:inherit}` +
    `.js [data-button-hover=standard] ${root} .title-wrapper .indicators .button.button--secondary:not(:disabled,.self-button):hover svg{stroke:currentColor}` +
    `${root} .title-wrapper .indicators .button.button--secondary:disabled{--border-opacity:0.25;--color-button-border:var(--timeline-arrow-active-channels,var(--color-button-border));--color-button-background:var(--timeline-arrow-active-channels,var(--color-button-background));color:var(--timeline-arrow-inactive-color,rgb(var(--color-button-background)/.25))!important;opacity:1!important}` +
    `${root} .title-wrapper .indicators .button.button--secondary:disabled svg{stroke:currentColor}`
  );
}

export function timelineSectionLayoutCss(sectionDomId: string, blockCount: number): string {
  const id = `#${sectionDomId}`;
  const strip = `${id} .timeline-react-strip{display:flex;flex-flow:row nowrap;gap:clamp(16px,2.5vw,40px);overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scroll-behavior:auto;-webkit-overflow-scrolling:touch;padding-block:var(--sp-2,8px);scrollbar-width:none;-ms-overflow-style:none}`;
  const stripScrollbar = `${id} .timeline-react-strip::-webkit-scrollbar{display:none;width:0;height:0}`;
  const mobileDots = `@media screen and (max-width:1023px){${id} .timeline-dots--desktop{display:none!important}${id} .timeline-dots-mobile{display:block}${id} .scroll-area{overflow:visible;scroll-snap-type:none}${id} .slider.slider--tablet{overflow:visible;padding-inline:0;margin-inline:0;padding-block-end:0;scroll-snap-type:none}${id} .timeline-react-strip{overflow-x:auto!important;overflow-y:hidden;touch-action:pan-x pinch-zoom;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory;scroll-padding-inline:1rem;overscroll-behavior-x:contain}}`;

  return (
    `${id}{--section-padding-top:72px;--section-padding-bottom:72px;--section-blocks-count:${String(blockCount)}}` +
    `@media screen and (min-width:768px){${id} .timeline__item>.timeline-slide-layout.flex{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}}` +
    strip +
    stripScrollbar +
    `${id} .timeline-react-strip .timeline__item{flex:0 0 min(92%,1120px);max-width:100%;width:auto;scroll-snap-align:center;transition:opacity .28s ease}` +
    `${id} .timeline-react-strip .timeline__item:not(.selected){opacity:.48}` +
    `${id} .timeline-react-strip .timeline__item:not(.selected) a.button{pointer-events:none;cursor:default}` +
    `${id} .timeline-react-strip .timeline__item.selected{opacity:1}` +
    `@media (prefers-reduced-motion:reduce){${id} .timeline-react-strip .timeline__item{transition:none}}` +
    timelineDotsCss(sectionDomId) +
    mobileDots
  );
}
