import { resolveArchiveButton } from '~/lib/makeswift/utils/archive-button';
import { resolveButtonTheme } from '~/lib/makeswift/utils/diabetes-care-button-theme';
import { hsl } from '~/lib/makeswift/utils/color';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`FAIL: ${message}`);
  }
  // eslint-disable-next-line no-console
  console.log(`ok: ${message}`);
}

// Visibility + legacy fields
const legacy = resolveArchiveButton({
  label: 'Shop',
  link: { href: '/shop' },
});
assert(legacy.visible && legacy.text === 'Shop' && legacy.href === '/shop', 'legacy label/link');

const noHref = resolveArchiveButton({ buttonText: 'Go' }, { requireHref: false });
assert(noHref.visible && noHref.href === '#', 'text without link when requireHref false');

const needsHref = resolveArchiveButton({ buttonText: 'Go' });
assert(!needsHref.visible, 'hidden without href by default');

// Primary maps background → fill var, text → label var
const primary = resolveButtonTheme(
  {
    backgroundColor: hsl('0 2% 19%'),
    textColor: hsl('0 0% 100%'),
  },
  { scopeId: 'test-primary', variant: 'primary' },
);
assert(
  primary.style?.['--color-button-background'] === '49 47 47' &&
    primary.style?.['--color-button-text'] === '255 255 255' &&
    primary.style?.['--color-button-gradient'] === 'none',
  'primary resting colors map to archive vars and clear inherited gradient',
);

// Secondary swaps user-facing text/background to archive vars
const secondary = resolveButtonTheme(
  {
    backgroundColor: hsl('0 0% 100%'),
    textColor: hsl('0 2% 19%'),
  },
  { scopeId: 'test-secondary', variant: 'secondary' },
);
assert(
  secondary.style?.['--color-button-background'] === '49 47 47' &&
    secondary.style?.['--color-button-text'] === '255 255 255',
  'secondary maps text color to label var and background to fill var',
);

// Outline is independent of fill
const outlined = resolveButtonTheme(
  {
    outlineColorHex: '#ff0000',
    backgroundColor: hsl('0 0% 100%'),
    textColor: hsl('0 2% 19%'),
  },
  { scopeId: 'test-outline', variant: 'primary' },
);
assert(
  outlined.style?.['--color-button-border'] === '255 0 0' &&
    outlined.style?.['--color-button-background'] === '255 255 255',
  'outline hex applies to border without replacing fill',
);

// Hover scope CSS is valid (closing braces)
const hover = resolveButtonTheme(
  {
    hoverBackgroundColor: hsl('0 0% 100%'),
    hoverTextColor: hsl('0 2% 19%'),
  },
  { scopeId: 'test-hover', variant: 'primary' },
);
assert(
  hover.scopeCss.includes('!important;}') && hover.dataDcBtn === 'test-hover',
  'hover rules emit valid CSS and scope id',
);

// eslint-disable-next-line no-console
console.log('\nAll archive-button.verify checks passed.');
