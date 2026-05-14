import { Group, Image, Link, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareMulticolumn } from './client';

/** Stable id aligned with `multicolumn_JtTdUn` in `diabetes-care.html` (dedicated slice, not HTML fetch). */
export const COMPONENT_TYPE = 'diabetes-care-multicolumn';

runtime.registerComponent(DiabetesCareMulticolumn, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / Multicolumn',
  icon: 'layout',
  props: {
    className: Style(),
    introHeading: TextInput({
      label: 'Intro heading (optional)',
      defaultValue: '',
    }),
    introBody: TextArea({
      label: 'Intro text (optional)',
      defaultValue: '',
    }),
    columns: List({
      label: 'Columns (max 4; order = left to right on desktop)',
      type: Group({
        label: 'Column',
        props: {
          title: TextInput({ label: 'Heading', defaultValue: 'Column heading' }),
          subheading: TextInput({
            label: 'Secondary heading (optional; bold, same size as body, tight under main heading)',
            defaultValue: '',
          }),
          body: TextArea({
            label: 'Body (line breaks become paragraphs)',
            defaultValue: 'Supporting copy for this column.',
          }),
          imageSrc: Image({ label: 'Image (optional)' }),
          imageAlt: TextInput({ label: 'Image alt text', defaultValue: '' }),
          buttonText: TextInput({ label: 'Button text (optional)', defaultValue: '' }),
          buttonLink: Link({ label: 'Button link' }),
        },
      }),
      getItemLabel(item) {
        const t = item?.title;

        return t != null && String(t).trim().length > 0 ? String(t).trim() : 'Column';
      },
    }),
  },
});
