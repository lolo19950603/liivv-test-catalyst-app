import {
  Group,
  Image,
  Link,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import {
  buttonColorFields,
  fontSizeFields,
  nestedSplitHeadingPopoverControls,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { ARCHIVE_BUTTON_PRIMARY_WHITE_ON_BANNER } from '~/lib/makeswift/utils/archive-button-presets';
import { diabetesCareComponentLabel } from '~/lib/makeswift/diabetes-care-component-label';
import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareImageTextOverlay } from './client';

export const COMPONENT_TYPE = 'diabetes-care-image-text-overlay';

runtime.registerComponent(DiabetesCareImageTextOverlay, {
  type: COMPONENT_TYPE,
  label: diabetesCareComponentLabel(15, 'Image with text overlay'),
  icon: 'image',
  props: {
    className: Style(),
    ...sectionBackgroundControls('0 0% 100%'),
    imageSrc: Image({ label: 'Background image' }),
    ...nestedSplitHeadingPopoverControls({
      primaryLabel: 'Primary heading',
      secondaryLabel: 'Secondary heading',
      primaryDefault: "We're Here if",
      secondaryDefault: 'You Need Us',
      primaryTextColorDefault: '0 0% 100%',
      secondaryTextColorDefault: '0 0% 100%',
      includeHighlightSwash: false,
    }),
    body: Group({
      label: 'Body',
      preferredLayout: Group.Layout.Popover,
      props: {
        html: TextArea({
          label: 'Body (HTML)',
          defaultValue:
            '<p>If you have questions — or want a second opinion — we’re always here.</p>',
          description: 'Supports HTML (e.g. &lt;p&gt;, &lt;em&gt;, &lt;strong&gt;).',
        }),
        ...textColorFields('0 0% 100%'),
        ...fontSizeFields(),
      },
    }),
    button: Group({
      label: 'Button',
      preferredLayout: Group.Layout.Popover,
      props: {
        label: TextInput({ label: 'Button label', defaultValue: 'Reach Out' }),
        link: Link({ label: 'Button link' }),
        ...buttonColorFields(ARCHIVE_BUTTON_PRIMARY_WHITE_ON_BANNER),
      },
    }),
  },
});
