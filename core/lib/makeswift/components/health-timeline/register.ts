import { Group, Image, Link, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  buttonColorFields,
  fontSizeFields,
  highlightSwashFields,
  roundedTopControl,
  sectionBackgroundControls,
  splitHeadingPopoverControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { healthPageComponentLabel } from '~/lib/makeswift/health-page-component-label';
import { runtime } from '~/lib/makeswift/runtime';
import { ARCHIVE_BUTTON_PRIMARY_DARK } from '~/lib/makeswift/utils/archive-button-presets';
import { ARCHIVE_HIGHLIGHT_SWASH_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';

import { HealthTimeline } from './client';

export const COMPONENT_TYPE = 'health-timeline';

const DEFAULT_SECTION_BODY_HTML = `<p>Keep it simple and make it yours.</p>`;

function timelineTextPopover(label: string, textDefault: string) {
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
    },
  });
}

function timelineSectionHeadingPopover(label: string, textDefault: string) {
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
      ...highlightSwashFields(ARCHIVE_HIGHLIGHT_SWASH_HSL),
    },
  });
}

runtime.registerComponent(HealthTimeline, {
  type: COMPONENT_TYPE,
  label: healthPageComponentLabel(4, 'Timeline (care journey)'),
  icon: 'carousel',
  props: {
    className: Style(),
    instanceSuffix: TextInput({
      label: 'Instance suffix (optional)',
      defaultValue: '',
      description: 'Use "carepack" for the second timeline on the health page.',
    }),
    ...sectionBackgroundControls('23 18% 62%'),
    ...roundedTopControl(),
    ...splitHeadingPopoverControls({
      primaryDefault: 'How things work..',
      secondaryDefault: 'Your Care Journey',
      highlightDefault: ARCHIVE_HIGHLIGHT_SWASH_HSL,
    }),
    sections: List({
      label: 'Journey sections (order = timeline left to right)',
      type: Group({
        label: 'Section',
        props: {
          slideContent: Group({
            label: 'Slide content',
            props: {
              categoryLabel: timelineTextPopover('Category label', 'Step 1'),
              sectionHeading: timelineSectionHeadingPopover(
                'Section heading',
                'Your Liivv Account',
              ),
              sectionBody: Group({
                label: 'Section body',
                preferredLayout: Group.Layout.Popover,
                props: {
                  html: TextArea({
                    label: 'HTML',
                    defaultValue: DEFAULT_SECTION_BODY_HTML,
                    description: 'Supports HTML (e.g. <p>, <ul>, <li>).',
                  }),
                  ...textColorFields(),
                  ...fontSizeFields(),
                },
              }),
            },
          }),
          button: Group({
            label: 'Button',
            preferredLayout: Group.Layout.Popover,
            props: {
              buttonText: TextInput({ label: 'Button text', defaultValue: 'Get Started' }),
              buttonLink: Link({ label: 'Button link' }),
              ...buttonColorFields(ARCHIVE_BUTTON_PRIMARY_DARK),
            },
          }),
          image: Group({
            label: 'Image',
            preferredLayout: Group.Layout.Popover,
            props: {
              imageSrc: Image({ label: 'Image' }),
              imageAlt: TextInput({ label: 'Image alt text', defaultValue: 'Care journey' }),
            },
          }),
        },
      }),
      getItemLabel(section) {
        const category = section?.slideContent?.categoryLabel?.text?.trim();

        if (category != null && category.length > 0) {
          return category;
        }

        const heading = section?.slideContent?.sectionHeading?.text?.trim();

        return heading != null && heading.length > 0 ? heading : 'Section';
      },
    }),
  },
});
