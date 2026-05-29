import { Group, Image, Link, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  buttonColorFields,
  fontSizeFields,
  highlightSwashFields,
  sectionBackgroundControls,
  splitHeadingPopoverControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { diabetesCareComponentLabel } from '~/lib/makeswift/diabetes-care-component-label';
import { runtime } from '~/lib/makeswift/runtime';
import { ARCHIVE_BUTTON_PRIMARY_DARK } from '~/lib/makeswift/utils/archive-button-presets';
import { ARCHIVE_HIGHLIGHT_SWASH_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';

import { DiabetesCareTimeline } from './client';

/** Stable id aligned with `timeline_nyTDKQ` in `diabetes-care.html` (dedicated slice, not HTML fetch). */
export const COMPONENT_TYPE = 'diabetes-care-timeline';

const DEFAULT_SECTION_BODY_HTML = `<p>Keep it simple and make it yours. Here's what we'd love to know:</p>
<ul>
<li>Name</li>
</ul>`;

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

runtime.registerComponent(DiabetesCareTimeline, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(3, 'Timeline'),
  icon: 'carousel',
  props: {
    className: Style(),
    ...sectionBackgroundControls(),
    ...splitHeadingPopoverControls({
      primaryDefault: 'Your Care Journey,',
      secondaryDefault: 'Simp(liivv)fied',
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
              categoryLabel: timelineTextPopover('Category label', 'Personalize Your Space'),
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
