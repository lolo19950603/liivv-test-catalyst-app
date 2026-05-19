const fs = require('fs');
const path = require('path');

const headPath = path.join(__dirname, '../public/archive/diabetes-care-head.css');
const componentDir = path.join(
  __dirname,
  '../lib/makeswift/components/diabetes-care-section-header',
);
const outPath = path.join(componentDir, 'archive-header.css');
const tsOutPath = path.join(componentDir, 'archive-header-css.ts');

const s = fs.readFileSync(headPath, 'utf8');
const parts = [];

const sectionId = '#shopify-section-sections--26374736970019__header';
const sectionVars = s.match(
  /#shopify-section-sections--26374736970019__header\{[^}]+\}/,
);
if (sectionVars) parts.push(sectionVars[0]);

function grab(re) {
  const m = s.match(re);
  if (m) parts.push(m[0]);
}

grab(/\.page-width\{margin:0 auto;padding-inline:var\(--page-padding\)\}/);
grab(/@media screen and \(min-width:1536px\)\{\.page-width--full\{[^}]+\}\}/);
grab(
  /\.section--padding\{[^}]+\}@media screen and \(min-width:768px\)\{\.section--padding\{[^}]+\}\}/,
);
grab(/\.section--rounded\{[^}]+\}/);
grab(
  /\.js \.shopify-section-group-header-group \.section\.section--next-rounded:before\{[^}]+\}/,
);
grab(/\.icon\{stroke-width:var\(--icon-weight\);width:var\(--sp-5d5\);height:var\(--sp-5d5\)\}/);
grab(/\.icon-md\{[^}]+\}/);
grab(/\.text-sm-lg\{[^}]+\}/);
grab(/\.btn-text\{[^}]+\}/);

const cornerStart = s.indexOf('.corner{width');
const cornerEnd = s.indexOf('/*! sections */');
if (cornerStart >= 0 && cornerEnd > cornerStart) {
  parts.push(s.slice(cornerStart, cornerEnd));
}

parts.push(
  '.diabetes-care-section-header .header__corner{color:rgb(var(--color-background));width:var(--border-radius);height:var(--border-radius)}',
);

const h0 = s.indexOf('/*! header */');
const h1 = s.indexOf('/*! countdown-condensed */');
if (h0 >= 0 && h1 > h0) {
  parts.push(s.slice(h0 + '/*! header */'.length, h1));
}

parts.push(`
.diabetes-care-section-header .header{display:grid;align-items:center}
.diabetes-care-section-header .flex{display:flex}
.diabetes-care-section-header .flex-wrap{flex-wrap:wrap}
.diabetes-care-section-header .flex-nowrap{flex-wrap:nowrap}
.diabetes-care-section-header .items-center{align-items:center}
.diabetes-care-section-header .justify-center{justify-content:center}
.diabetes-care-section-header .justify-start{justify-content:flex-start}
.diabetes-care-section-header .justify-end{justify-content:flex-end}
.diabetes-care-section-header .relative{position:relative}
.diabetes-care-section-header .absolute{position:absolute}
.diabetes-care-section-header .z-2{z-index:2}
.diabetes-care-section-header .gap-1d5{gap:var(--sp-1d5)}
.diabetes-care-section-header .gap-5{gap:var(--sp-5)}
.diabetes-care-section-header .lg\\:gap-5{gap:var(--sp-5)}
.diabetes-care-section-header .lg\\:justify-start{justify-content:flex-start}
.diabetes-care-section-header .header__logo-link{text-decoration:none;color:inherit}
.diabetes-care-section-header .header__logo-link img{display:block;max-height:140px;max-width:140px;width:auto;height:auto}
@media screen and (min-width:768px){
  .diabetes-care-section-header .md\\:block{display:block}
}
.diabetes-care-section-header .list-menu{list-style:none;margin:0;padding:0}
.diabetes-care-section-header .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.diabetes-care-section-header.header-section.header-opaque .header{--header-background-opacity:1;--header-logo-opacity:1;color:rgb(var(--color-foreground))}
.diabetes-care-section-header.header-section.header-opaque .header:before{opacity:1}
.diabetes-care-section-header.header-section.header-pinned{position:fixed;left:0;right:0;top:0;z-index:100;width:100%}
.diabetes-care-section-header cart-count.count,
.diabetes-care-section-header .header__buttons .count{position:absolute;top:0;right:0;font-size:var(--text-xs);line-height:1;min-width:1.25rem;height:1.25rem;display:flex;align-items:center;justify-content:center;padding-inline:2px}
@media screen and (min-width:1024px){
  .diabetes-care-section-header .lg\\:flex{display:flex!important}
  .diabetes-care-section-header .hidden{display:none}
  .diabetes-care-section-header .header__navigation.hidden.lg\\:flex{display:flex!important}
}
/* Mobile nav: ".diabetes-care-section-header .flex{ display:flex }" beats Tailwind "lg:hidden" on the
   hamburger (higher specificity). Hide slot + overlay + drawer at desktop with !important. */
.diabetes-care-section-header .diabetes-care-mobile-nav-slot{
  display:flex;
  flex-shrink:0;
  align-items:center;
}
.diabetes-care-section-header button.diabetes-care-mobile-nav-trigger{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:2.75rem;
  min-height:2.75rem;
  border-radius:.375rem;
  touch-action:manipulation;
}
@media screen and (min-width:1024px){
  .diabetes-care-section-header .diabetes-care-mobile-nav-slot{display:none!important}
  .diabetes-care-section-header .diabetes-care-mobile-backdrop{display:none!important}
  .diabetes-care-section-header .diabetes-care-mobile-nav-drawer{display:none!important}
}
`);

const out = parts.join('');
fs.writeFileSync(outPath, out);
fs.writeFileSync(
  tsOutPath,
  `/** Generated by \`node core/scripts/extract-diabetes-care-header-css.cjs\` — do not edit. */\nexport const ARCHIVE_HEADER_CSS = ${JSON.stringify(out)};\n`,
);
console.log('Wrote', outPath, 'bytes', out.length);
console.log('Wrote', tsOutPath);
console.log('valid:', out.includes('.header-section{') && !/scroll-area/.test(out));
