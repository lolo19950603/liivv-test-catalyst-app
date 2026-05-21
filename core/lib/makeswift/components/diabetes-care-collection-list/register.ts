import { Group, Image, Link, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  fontSizeFields,
  sectionBackgroundControls,
  nestedSplitHeadingPopoverControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { diabetesCareComponentLabel } from '~/lib/makeswift/diabetes-care-component-label';
import { runtime } from '~/lib/makeswift/runtime';
import { ARCHIVE_HIGHLIGHT_SWASH_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';

import { DiabetesCareCollectionList } from './client';

export const COMPONENT_TYPE = 'diabetes-care-collection-list';

runtime.registerComponent(DiabetesCareCollectionList, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(13, 'Collection list'),
  icon: 'layout',
  props: {
    className: Style(),
    ...sectionBackgroundControls(),
    ...nestedSplitHeadingPopoverControls({
      primaryLabel: 'Primary heading',
      secondaryLabel: 'Secondary heading (accent)',
      primaryDefault: 'Care Designed for',
      secondaryDefault: 'Every Stage of Health',
      primaryTextColorDefault: '0 2% 19%',
      secondaryTextColorDefault: '0 2% 19%',
      highlightDefault: ARCHIVE_HIGHLIGHT_SWASH_HSL,
    }),
    body: Group({
      label: 'Body',
      preferredLayout: Group.Layout.Popover,
      props: {
        descriptionHtml: TextArea({
          label: 'Description (HTML)',
          defaultValue: '<p>Liivv connects you to the care you need—when you need it.</p>',
          description: 'Supports HTML (e.g. &lt;p&gt;, &lt;em&gt;, &lt;strong&gt;).',
        }),
        ...textColorFields(),
        ...fontSizeFields(),
      },
    }),
    cards: List({
      label: 'Collections',
      type: Group({
        label: 'Collection card',
        props: {
          imageSrc: Image({ label: 'Image' }),
          imageAlt: TextInput({ label: 'Image alt', defaultValue: '' }),
          title: TextInput({ label: 'Title', defaultValue: 'Collection' }),
          cardLink: Link({ label: 'Link' }),
          ariaLabel: TextInput({ label: 'Card aria-label (optional)', defaultValue: '' }),
        },
      }),
      getItemLabel(item) {
        const t = item?.title;

        return t != null && String(t).trim().length > 0 ? String(t).trim() : 'Collection';
      },
    }),
  },
});
