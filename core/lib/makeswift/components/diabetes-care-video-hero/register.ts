import { Checkbox, Group, Image, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  fontSizeFields,
  headingPopoverControls,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';

import { DIABETES_CARE_DEFAULT_VIDEO_URL, DiabetesCareVideoHero } from './client';

export const COMPONENT_TYPE = 'diabetes-care-video-hero';

runtime.registerComponent(DiabetesCareVideoHero, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / 1. Video with text overlay',
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls('0 0% 100%'),
    video: Group({
      label: 'Video',
      preferredLayout: Group.Layout.Popover,
      props: {
        url: TextInput({
          label: 'Video file URL (MP4)',
          defaultValue: DIABETES_CARE_DEFAULT_VIDEO_URL,
        }),
        poster: Image({ label: 'Poster image (optional)' }),
        autoplay: Checkbox({ label: 'Autoplay', defaultValue: true }),
        muted: Checkbox({ label: 'Muted (when autoplay is off)', defaultValue: true }),
        loop: Checkbox({ label: 'Loop', defaultValue: true }),
        playsInline: Checkbox({ label: 'Plays inline on mobile', defaultValue: true }),
        showControls: Checkbox({ label: 'Show native video controls', defaultValue: false }),
      },
    }),
    ...headingPopoverControls({
      label: 'Overlay heading',
      textLabel: 'Heading (optional)',
      textDefault: '',
      textColorDefault: '0 0% 100%',
    }),
    overlayBody: Group({
      label: 'Overlay body',
      preferredLayout: Group.Layout.Popover,
      props: {
        subheading: TextArea({ label: 'Subheading (optional)', defaultValue: '' }),
        ...textColorFields('0 0% 100%'),
        ...fontSizeFields(),
      },
    }),
  },
});
