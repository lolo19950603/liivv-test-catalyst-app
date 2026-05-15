import { Image, Link, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareRevealImageWithText } from './client';

export const COMPONENT_TYPE = 'diabetes-care-reveal-image-text';

runtime.registerComponent(DiabetesCareRevealImageWithText, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / 6. Reveal + story',
  icon: 'image',
  props: {
    className: Style(),
    bannerTitle: TextInput({
      label: 'Banner headline (scroll reveal area)',
      defaultValue: 'Meet Armaan...',
    }),
    heroImageSrc: Image({ label: 'Hero image' }),
    heroImageAlt: TextInput({ label: 'Hero image alt text', defaultValue: '' }),
    storyHeadingLead: TextInput({
      label: 'Story heading — before accent',
      defaultValue: 'You Are',
    }),
    storyHeadingHighlight: TextInput({
      label: 'Story heading — accent (highlighted)',
      defaultValue: 'Not Alone...',
    }),
    body: TextArea({
      label:
        'Story body (blank line = new paragraph; quote-style paragraphs use italics. Wrap a line in **double asterisks** for bold.)',
      defaultValue: `"I got diagnosed in March of 2020 at age 20.

The first sign that something was wrong was in February where I was doing sprints on a treadmill to get ready for a soccer season and after finishing I felt sick and dizzy to where I might need to go to the hospital.

I thought maybe I just went "too hard" and I was upset because it meant that I was way out of shape for the upcoming soccer season. Then I was getting very thirsty and seeing my weight drop despite working out and bulking..."

**Sometimes the best resource is a conversation. Connect with community partners who have walked the path before you.**`,
    }),
    primaryButtonText: TextInput({
      label: 'Primary button label',
      defaultValue: "Read Armaan's Full Story",
    }),
    primaryButtonLink: Link({ label: 'Primary button link' }),
    secondaryButtonText: TextInput({
      label: 'Secondary button label',
      defaultValue: 'Find Support',
    }),
    secondaryButtonLink: Link({ label: 'Secondary button link' }),
  },
});
