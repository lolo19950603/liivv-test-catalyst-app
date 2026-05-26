import {
  Checkbox,
  Group,
  Image,
  List,
  Number,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import { archiveComponentLabel } from '~/lib/makeswift/archive-component-label';
import {
  bodyTextPopoverControls,
  headingPopoverControls,
  sectionBackgroundControls,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';

import { ArchiveRevealTestimonials } from './client';

export const COMPONENT_TYPE = 'archive-reveal-testimonials';

const testimonialItem = Group({
  label: 'Testimonial',
  props: {
    quote: TextArea({
      label: 'Quote',
      defaultValue: 'Add customer reviews and testimonials to showcase your store’s happy customers.',
    }),
    author: TextInput({ label: 'Author name', defaultValue: 'Author’s name' }),
    role: TextInput({ label: 'Author role (optional)', defaultValue: '' }),
    avatar: Image({ label: 'Avatar (optional)' }),
    parallaxStartPx: Number({
      label: 'Parallax start (px)',
      description: 'Initial Y offset when the card enters the viewport. Positive = below resting position.',
      defaultValue: 0,
      suffix: 'px',
    }),
    parallaxStopPx: Number({
      label: 'Parallax stop (px)',
      description: 'Final Y offset when the card leaves the viewport. Negative = above resting position.',
      defaultValue: 0,
      suffix: 'px',
    }),
  },
});

runtime.registerComponent(ArchiveRevealTestimonials, {
  type: COMPONENT_TYPE,
  label: archiveComponentLabel(3, 'Testimonials (parallax cards)'),
  icon: 'cards',
  props: {
    className: Style(),
    ...sectionBackgroundControls('142 165 141'),
    ...headingPopoverControls({
      label: 'Section heading',
      textDefault: 'What people are saying',
      textColorDefault: '0 2% 19%',
    }),
    ...bodyTextPopoverControls('0 2% 19%'),
    items: List({
      label: 'Testimonials',
      type: testimonialItem,
      getItemLabel(item, index) {
        const fallback = `Testimonial ${(index ?? 0) + 1}`;
        const author = item?.author?.trim();

        return author != null && author.length > 0 ? author : fallback;
      },
    }),
    columnMaxWidthPx: Number({
      label: 'Column max width',
      defaultValue: 720,
      suffix: 'px',
    }),
    desktopGapPx: Number({
      label: 'Desktop gap',
      defaultValue: 40,
      suffix: 'px',
    }),
    mobileGapPx: Number({
      label: 'Mobile gap',
      defaultValue: 16,
      suffix: 'px',
    }),
    disableParallax: Checkbox({
      label: 'Disable parallax',
      description: 'Useful for users on slow devices or with motion sensitivity.',
      defaultValue: false,
    }),
  },
});
