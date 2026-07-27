import { Checkbox, Group, Image, Number, Select, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  archiveButtonGroup,
  fontSizeFields,
  roundedTopControl,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { diabetesCareComponentLabel } from '~/lib/makeswift/diabetes-care-component-label';
import { runtime } from '~/lib/makeswift/runtime';
import {
  ARCHIVE_BUTTON_PRIMARY_WHITE_ON_BANNER,
  ARCHIVE_BUTTON_SECONDARY_ON_BANNER,
} from '~/lib/makeswift/utils/archive-button-presets';

import { AlignedMediaHero } from './client';

export const COMPONENT_TYPE = 'aligned-media-hero';

runtime.registerComponent(AlignedMediaHero, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(16, 'Aligned media hero'),
  icon: 'image',
  props: {
    className: Style(),
    ...roundedTopControl(),
    minHeightVh: Number({
      label: 'Min height',
      suffix: 'vh',
      defaultValue: 92,
      description: 'Viewport height for the hero (e.g. 92).',
    }),
    media: Group({
      label: 'Background media',
      preferredLayout: Group.Layout.Popover,
      props: {
        image: Image({ label: 'Background image' }),
        imageAlt: TextInput({ label: 'Image alt text', defaultValue: '' }),
        objectPosition: TextInput({
          label: 'Image position',
          defaultValue: '50% 50%',
          description: 'CSS object-position, e.g. 50% 40% or left center.',
        }),
        videoUrl: TextInput({
          label: 'Video URL (MP4, optional)',
          defaultValue: '',
          description: 'When set, plays over the image (image becomes the poster).',
        }),
        autoplay: Checkbox({ label: 'Autoplay video', defaultValue: true }),
        muted: Checkbox({ label: 'Muted when autoplay is off', defaultValue: true }),
        loop: Checkbox({ label: 'Loop video', defaultValue: true }),
        playsInline: Checkbox({ label: 'Plays inline on mobile', defaultValue: true }),
      },
    }),
    content: Group({
      label: 'Content',
      preferredLayout: Group.Layout.Popover,
      props: {
        contentAlign: Select({
          label: 'Content alignment',
          options: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ],
          defaultValue: 'left',
        }),
        eyebrow: TextInput({
          label: 'Eyebrow',
          defaultValue: 'CLAIR HEALTH · AVAILABLE THROUGH LIIVV',
        }),
        heading: TextInput({
          label: 'Heading',
          defaultValue: 'Know your rhythm',
        }),
        ...fontSizeFields(),
        body: TextArea({
          label: 'Body',
          defaultValue:
            "Clair is the first wearable that reads your body's key signals continuously — so you finally see the shape of your month instead of guessing through it. Pre-order through Liivv.",
        }),
        bodyFontSize: Number({
          label: 'Body font size',
          suffix: 'px',
          defaultValue: 0,
          description: '0 = theme default.',
        }),
        bodyFontSizeMobile: Number({
          label: 'Body font size (mobile)',
          suffix: 'px',
          defaultValue: 0,
          description: '0 = same as desktop, or theme default when desktop is 0.',
        }),
      },
    }),
    primaryButton: archiveButtonGroup(
      'Primary button',
      ARCHIVE_BUTTON_PRIMARY_WHITE_ON_BANNER,
      {
        textDefault: 'Pre-order Clair',
        showButton: true,
        showButtonDefault: true,
      },
    ),
    secondaryButton: archiveButtonGroup(
      'Secondary button',
      ARCHIVE_BUTTON_SECONDARY_ON_BANNER,
      {
        textDefault: 'How Clair Works',
        showButton: true,
        showButtonDefault: true,
      },
    ),
  },
});
