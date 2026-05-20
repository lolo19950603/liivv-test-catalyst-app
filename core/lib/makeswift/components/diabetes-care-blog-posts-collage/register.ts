import { Group, Image, Link, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  fontSizeFields,
  highlightSwashFields,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { runtime } from '~/lib/makeswift/runtime';
import { ARCHIVE_BLOG_COLLAGE_BACKGROUND_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';

import { DiabetesCareBlogPostsCollage } from './client';

export const COMPONENT_TYPE = 'diabetes-care-blog-posts-collage';

const collagePostFields = {
  image: Group({
    label: 'Image',
    preferredLayout: Group.Layout.Popover,
    props: {
      imageSrc: Image({ label: 'Image' }),
      imageAlt: TextInput({ label: 'Image alt', defaultValue: '' }),
    },
  }),
  title: Group({
    label: 'Title',
    preferredLayout: Group.Layout.Popover,
    props: {
      text: TextInput({ label: 'Text', defaultValue: 'Post title' }),
      ...textColorFields('0 0% 100%'),
      ...fontSizeFields(),
    },
  }),
  body: Group({
    label: 'Body',
    preferredLayout: Group.Layout.Popover,
    props: {
      text: TextArea({
        label: 'Body (line breaks become paragraphs)',
        defaultValue: 'Short summary for this post.',
      }),
      ...textColorFields('0 0% 100%'),
      ...fontSizeFields(),
    },
  }),
  link: Group({
    label: 'Link',
    preferredLayout: Group.Layout.Popover,
    props: {
      linkText: TextInput({ label: 'Link label', defaultValue: 'Read more' }),
      link: Link({ label: 'Link URL' }),
    },
  }),
};

runtime.registerComponent(DiabetesCareBlogPostsCollage, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / 7. Blog posts collage',
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(ARCHIVE_BLOG_COLLAGE_BACKGROUND_HSL),
    heading: Group({
      label: 'Heading',
      preferredLayout: Group.Layout.Popover,
      props: {
        before: TextInput({
          label: 'Before accent',
          defaultValue: 'The',
        }),
        emphasis: TextInput({
          label: 'Accent (half underline)',
          defaultValue: '"Every Day" ',
        }),
        after: TextInput({
          label: 'After accent',
          defaultValue: 'Feed',
        }),
        ...textColorFields('0 0% 100%'),
        ...fontSizeFields(),
        ...highlightSwashFields(),
      },
    }),
    posts: List({
      label: 'Posts',
      description:
        'Order = layout: the first post is the large featured card on the left; the next two are the right column on desktop. Additional items are ignored on the live site.',
      type: Group({
        label: 'Post',
        props: collagePostFields,
      }),
      getItemLabel(item) {
        const raw = item?.title;
        const t = typeof raw === 'string' ? raw : raw?.text;

        return t != null && String(t).trim().length > 0 ? String(t).trim() : 'Post';
      },
    }),
  },
});
