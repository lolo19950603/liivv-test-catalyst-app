import { Checkbox, Group, Image, Link, Number, Style, TextInput } from '@makeswift/runtime/controls';

import { bodyTextPopoverControls } from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';

import { SiteFooterBottomBar } from './client';

/** Picker default matching {@link SITE_FOOTER_BOTTOM_BAR_DEFAULT_TEXT_HEX}. */
const SITE_FOOTER_BOTTOM_BAR_TEXT_HSL = '8 11% 33%';

export const COMPONENT_TYPE = 'site-footer-bottom-bar';

const logo = Group({
  label: 'Logo',
  preferredLayout: Group.Layout.Popover,
  props: {
    show: Checkbox({ label: 'Show logo', defaultValue: true }),
    src: Image({ label: 'Logo' }),
    alt: TextInput({ label: 'Alt text', defaultValue: 'Logo alt' }),
    width: Number({ label: 'Max width', suffix: 'px', defaultValue: 240 }),
    height: Number({ label: 'Max height', suffix: 'px', defaultValue: 64 }),
  },
});

runtime.registerComponent(SiteFooterBottomBar, {
  type: COMPONENT_TYPE,
  label: 'Site Footer Bottom Bar',
  hidden: true,
  props: {
    className: Style(),
    ...bodyTextPopoverControls(SITE_FOOTER_BOTTOM_BAR_TEXT_HSL),
    logo,
    copyright: TextInput({ label: 'Copyright text' }),
  },
});
