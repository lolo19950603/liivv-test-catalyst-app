import { Checkbox, Image, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DIABETES_CARE_DEFAULT_VIDEO_URL, DiabetesCareVideoHero } from './client';

export const COMPONENT_TYPE = 'diabetes-care-video-hero';

runtime.registerComponent(DiabetesCareVideoHero, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / Video with text overlay',
  icon: 'layout',
  props: {
    className: Style(),
    videoUrl: TextInput({
      label: 'Video file URL (MP4)',
      defaultValue: DIABETES_CARE_DEFAULT_VIDEO_URL,
    }),
    posterImage: Image({ label: 'Poster image (optional)' }),
    autoplay: Checkbox({ label: 'Autoplay', defaultValue: true }),
    muted: Checkbox({ label: 'Muted (when autoplay is off)', defaultValue: true }),
    loop: Checkbox({ label: 'Loop', defaultValue: true }),
    playsInline: Checkbox({ label: 'Plays inline on mobile', defaultValue: true }),
    showControls: Checkbox({ label: 'Show native video controls', defaultValue: false }),
    heading: TextInput({ label: 'Overlay heading (optional)', defaultValue: '' }),
    subheading: TextArea({ label: 'Overlay subheading (optional)', defaultValue: '' }),
  },
});
