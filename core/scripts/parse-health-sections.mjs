import fs from 'node:fs';

const html = fs.readFileSync('core/public/archive/liivv-health-page.html', 'utf8');
const marker = 'shopify-section-template--26491503870243__';
const parts = html.split(`id=${marker}`);

const sections = parts.slice(1).map((chunk) => {
  const idEnd = chunk.indexOf(' class=shopify-section');
  const rest = idEnd === -1 ? chunk : chunk.slice(idEnd);
  const id = chunk.slice(0, idEnd);
  const type = id.replace(/_[A-Za-z0-9]+$/, '');
  const headingMatch = chunk.match(/<h[1-6][^>]*>([^<]{0,160})/);
  const classMatch = rest.match(/class=([^\s>]+)/);
  return {
    id: `shopify-section-${marker}${id}`,
    type,
    heading: headingMatch ? headingMatch[1].trim() : '',
    sectionClass: classMatch ? classMatch[1] : '',
  };
});

console.log(JSON.stringify(sections, null, 2));
