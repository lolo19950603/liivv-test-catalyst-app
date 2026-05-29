import { Group, Link, List, TextInput } from '@makeswift/runtime/controls';

import {
  bodyTextPopoverControls,
  roundedBottomControl,
  sectionBackgroundControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftFooter } from './client';

/** Picker default matching {@link SITE_FOOTER_DEFAULT_BACKGROUND_HEX}. */
const SITE_FOOTER_BACKGROUND_HSL = '0 2% 19%';
/** Picker default matching {@link SITE_FOOTER_DEFAULT_TEXT_HEX}. */
const SITE_FOOTER_TEXT_HSL = '0 0% 98%';

export const COMPONENT_TYPE = 'catalyst-makeswift-footer';

const links = List({
  label: 'Links',
  type: Group({
    label: 'Link',
    props: {
      label: TextInput({ label: 'Text', defaultValue: 'Text' }),
      link: Link({ label: 'URL' }),
    },
  }),
  getItemLabel: (item) => item?.label ?? 'Text',
});

runtime.registerComponent(MakeswiftFooter, {
  type: COMPONENT_TYPE,
  label: 'Site Footer',
  hidden: true,
  props: {
    ...sectionBackgroundControls(SITE_FOOTER_BACKGROUND_HSL),
    ...bodyTextPopoverControls(SITE_FOOTER_TEXT_HSL),
    ...roundedBottomControl(),
    sections: List({
      label: 'Sections',
      type: Group({
        label: 'Section',
        props: {
          title: TextInput({ label: 'Title', defaultValue: 'Section' }),
          links,
        },
      }),
      getItemLabel: (item) => item?.title ?? 'Section',
    }),
  },
});
