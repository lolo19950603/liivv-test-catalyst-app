import { Group, Image, Number, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  archiveButtonGroup,
  FONT_SIZE_DESCRIPTION,
  fontSizeFields,
  roundedTopControl,
  sectionBackgroundControls,
  splitHeadingPopoverControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { diabetesCareComponentLabel } from '~/lib/makeswift/diabetes-care-component-label';
import { runtime } from '~/lib/makeswift/runtime';
import {
  ARCHIVE_BUTTON_PRIMARY_SAGE,
  ARCHIVE_BUTTON_SECONDARY_ON_WHITE,
} from '~/lib/makeswift/utils/archive-button-presets';
import { ARCHIVE_SAGE_BACKGROUND_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';

import { DiabetesCareRevealImageWithText } from './client';

export const COMPONENT_TYPE = 'diabetes-care-reveal-image-text';

runtime.registerComponent(DiabetesCareRevealImageWithText, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(5, 'Reveal + story'),
  icon: 'image',
  props: {
    className: Style(),
    ...sectionBackgroundControls(),
    ...roundedTopControl(),
    bannerHeading: Group({
      label: 'Banner heading',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({
          label: 'Headline (scroll reveal area)',
          defaultValue: 'Meet Armaan...',
        }),
        ...textColorFields(),
        fontSize: Number({
          label: 'Font size',
          suffix: 'px',
          defaultValue: 0,
          description: FONT_SIZE_DESCRIPTION,
        }),
        fontSizeMobile: Number({
          label: 'Font size (mobile)',
          suffix: 'px',
          defaultValue: 0,
          description: '0 = theme default on desktop; ≤500px uses compact banner fit unless set.',
        }),
      },
    }),
    bannerImage: Group({
      label: 'Banner image',
      preferredLayout: Group.Layout.Popover,
      props: {
        heroImageSrc: Image({ label: 'Hero image' }),
        heroImageAlt: TextInput({ label: 'Hero image alt text', defaultValue: '' }),
      },
    }),
    ...splitHeadingPopoverControls({
      primaryLabel: 'Story heading',
      secondaryLabel: 'Story accent',
      primaryDefault: 'You Are',
      secondaryDefault: 'Not Alone...',
      secondaryTextColorDefault: ARCHIVE_SAGE_BACKGROUND_HSL,
    }),
    body: Group({
      label: 'Body',
      preferredLayout: Group.Layout.Popover,
      props: {
        html: TextArea({
          label: 'Body (HTML)',
          defaultValue:
            '<p><em>"I got diagnosed in March of 2020 at age 20.</em></p><p><em>The first sign that something was wrong was in February where I was doing sprints on a treadmill to get ready for a soccer season and after finishing I felt sick and dizzy to where I might need to go to the hospital.</em></p><p><em>I thought maybe I just went "too hard" and I was upset because it meant that I was way out of shape for the upcoming soccer season. Then I was getting very thirsty and seeing my weight drop despite working out and bulking..."</em></p><p><strong>Sometimes the best resource is a conversation. Connect with community partners who have walked the path before you.</strong></p>',
          description: 'Supports HTML (e.g. &lt;p&gt;, &lt;em&gt;, &lt;strong&gt;).',
        }),
        ...textColorFields(),
        ...fontSizeFields(),
      },
    }),
    primaryButton: archiveButtonGroup('Primary button', ARCHIVE_BUTTON_PRIMARY_SAGE, {
      textDefault: "Read Armaan's Full Story",
    }),
    secondaryButton: archiveButtonGroup('Secondary button', ARCHIVE_BUTTON_SECONDARY_ON_WHITE, {
      textDefault: 'Find Support',
    }),
  },
});
