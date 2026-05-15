import { Group, Image, Link, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareBlogPostsCollage } from './client';

export const COMPONENT_TYPE = 'diabetes-care-blog-posts-collage';

runtime.registerComponent(DiabetesCareBlogPostsCollage, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / 7. Blog posts collage',
  icon: 'layout',
  props: {
    className: Style(),
    headingBefore: TextInput({
      label: 'Section heading (before accent)',
      defaultValue: 'The',
    }),
    headingEmphasis: TextInput({
      label: 'Section heading (accent, half underline)',
      defaultValue: '"Every Day" ',
    }),
    headingAfter: TextInput({
      label: 'Section heading (after accent)',
      defaultValue: 'Feed',
    }),
    featureImageSrc: Image({ label: 'Featured post — image (large, left)' }),
    featureImageAlt: TextInput({ label: 'Featured post — image alt', defaultValue: '' }),
    featureTitle: TextInput({
      label: 'Featured post — title',
      defaultValue: 'Ongoing Ostomy Support: Finding What Works, Every Day',
    }),
    featureBody: TextArea({
      label: 'Featured post — body (line breaks become paragraphs)',
      defaultValue:
        'Starting out is one thing. But what really shapes your experience over time is what comes next. The small adjustments. The routines that evolve.',
    }),
    featureLinkText: TextInput({
      label: 'Featured post — link label',
      defaultValue: 'Read more',
    }),
    featureLink: Link({ label: 'Featured post — link URL' }),
    sidePosts: List({
      label: 'Right column posts (exactly two; image + text row on desktop)',
      type: Group({
        label: 'Post',
        props: {
          imageSrc: Image({ label: 'Image' }),
          imageAlt: TextInput({ label: 'Image alt', defaultValue: '' }),
          title: TextInput({ label: 'Title', defaultValue: 'Post title' }),
          body: TextArea({
            label: 'Body (line breaks become paragraphs)',
            defaultValue: 'Short summary for this post.',
          }),
          linkText: TextInput({ label: 'Link label', defaultValue: 'Read more' }),
          link: Link({ label: 'Link URL' }),
        },
      }),
      getItemLabel(item) {
        const t = item?.title;

        return t != null && String(t).trim().length > 0 ? String(t).trim() : 'Post';
      },
    }),
  },
});
