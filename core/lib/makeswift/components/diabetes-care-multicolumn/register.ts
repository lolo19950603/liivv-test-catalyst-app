import { Group, Image, Link, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  archiveButtonControls,
  fontSizeFields,
  highlightSwashFields,
  roundedTopControl,
  sectionBackgroundControls,
  splitHeadingPopoverControls,
  textAlignField,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { diabetesCareComponentLabel } from '~/lib/makeswift/diabetes-care-component-label';
import { runtime } from '~/lib/makeswift/runtime';
import { ARCHIVE_BUTTON_PRIMARY_WHITE_ON_TINT } from '~/lib/makeswift/utils/archive-button-presets';
import { ARCHIVE_SAGE_BACKGROUND_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';

import { DiabetesCareMulticolumn } from './client';

/** Stable id aligned with `multicolumn_JtTdUn` in `diabetes-care.html` (dedicated slice, not HTML fetch). */
export const COMPONENT_TYPE = 'diabetes-care-multicolumn';

function multicolumnHeadingPopover(label: string, textDefault: string) {
  return Group({
    label,
    preferredLayout: Group.Layout.Popover,
    props: {
      text: TextInput({
        label: 'Text',
        defaultValue: textDefault,
      }),
      ...textColorFields(),
      ...fontSizeFields(),
      ...highlightSwashFields(),
    },
  });
}

function multicolumnPlainTextPopover(label: string, textDefault: string, textArea = false) {
  return Group({
    label,
    preferredLayout: Group.Layout.Popover,
    props: {
      text: textArea
        ? TextArea({
            label: 'Text',
            defaultValue: textDefault,
          })
        : TextInput({
            label: 'Text',
            defaultValue: textDefault,
          }),
      ...textColorFields(),
      ...fontSizeFields(),
    },
  });
}

runtime.registerComponent(DiabetesCareMulticolumn, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(4, 'Multicolumn'),
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(ARCHIVE_SAGE_BACKGROUND_HSL),
    ...roundedTopControl(),
    topHeading: Group({
      label: 'Top heading',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({
          label: 'Text (optional line above heading)',
          defaultValue: '',
        }),
        ...textColorFields(),
        ...fontSizeFields(),
        ...textAlignField('center'),
      },
    }),
    ...splitHeadingPopoverControls({
      primaryLabel: 'Primary heading',
      secondaryLabel: 'Secondary heading (swash)',
      primaryDefault: 'Diabetes is a',
      secondaryDefault: 'journey.',
      secondarySwashTransparentByDefault: true,
      includeTextAlign: true,
    }),
    intro: Group({
      label: 'Intro body',
      preferredLayout: Group.Layout.Popover,
      props: {
        body: TextArea({
          label: 'Text (optional, below heading)',
          defaultValue: '',
        }),
        ...textColorFields(),
        ...fontSizeFields(),
        ...textAlignField('center'),
      },
    }),
    columns: List({
      label: 'Columns (4 per row on desktop; order = left to right)',
      description:
        'Add as many columns as needed. On desktop they display four per row; additional columns wrap to the next row.',
      type: Group({
        label: 'Column',
        props: {
          heading: multicolumnHeadingPopover('Heading', 'Column heading'),
          secondaryHeading: multicolumnPlainTextPopover(
            'Secondary heading',
            'The Gear. No Guesswork.',
          ),
          body: multicolumnPlainTextPopover(
            'Body',
            'Supporting copy for this column.\nSecond paragraph example.',
            true,
          ),
          image: Group({
            label: 'Image',
            preferredLayout: Group.Layout.Popover,
            props: {
              imageSrc: Image({ label: 'Image' }),
              imageAlt: TextInput({ label: 'Image alt text', defaultValue: '' }),
            },
          }),
          button: Group({
            label: 'Button',
            preferredLayout: Group.Layout.Popover,
            props: archiveButtonControls(ARCHIVE_BUTTON_PRIMARY_WHITE_ON_TINT),
          }),
        },
      }),
      getItemLabel(item) {
        const fromHeading =
          item?.heading?.text != null && String(item.heading.text).trim().length > 0
            ? String(item.heading.text).trim()
            : null;
        const fromLegacyContent =
          item?.content?.title != null && String(item.content.title).trim().length > 0
            ? String(item.content.title).trim()
            : null;
        const fromLegacyTitle =
          item?.title != null && String(item.title).trim().length > 0
            ? String(item.title).trim()
            : null;

        return fromHeading ?? fromLegacyContent ?? fromLegacyTitle ?? 'Column';
      },
    }),
  },
});
