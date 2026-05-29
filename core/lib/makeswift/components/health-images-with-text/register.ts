import { Checkbox, Group, Image, Link, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import {
  buttonColorFields,
  fontSizeFields,
  headingPopoverControls,
  roundedTopControl,
  sectionBackgroundControls,
  textColorFields,
} from '~/lib/makeswift/controls/diabetes-care-section-controls';
import { healthPageComponentLabel } from '~/lib/makeswift/health-page-component-label';
import { runtime } from '~/lib/makeswift/runtime';
import { ARCHIVE_BUTTON_PRIMARY_DARK } from '~/lib/makeswift/utils/archive-button-presets';
import { ARCHIVE_SAGE_BACKGROUND_HSL } from '~/lib/makeswift/utils/diabetes-care-archive-theme';

import { HealthImagesWithText } from './client';

export const COMPONENT_TYPE = 'health-images-with-text';

const DEFAULT_BODY_HTML = `<p>Experience a smarter way to manage your health with personalized medication packaging and virtual consulting for minor ailments.</p>
<p>CarePack organizes your prescriptions by dose, eliminating the guesswork of multiple bottles and ensuring you never miss a dose.</p>
<p>It's professional pharmacy expertise delivered with absolute convenience, so you can focus on living well.</p>`;

runtime.registerComponent(HealthImagesWithText, {
  type: COMPONENT_TYPE,
  label: healthPageComponentLabel(3, 'Images with text'),
  icon: 'layout',
  props: {
    className: Style(),
    instanceSuffix: TextInput({
      label: 'Instance suffix (optional)',
      defaultValue: '',
      description: 'Use "carepack" for the second images-with-text block.',
    }),
    layoutReverse: Checkbox({
      label: 'Reverse layout on desktop (image right)',
      defaultValue: false,
    }),
    ...sectionBackgroundControls(ARCHIVE_SAGE_BACKGROUND_HSL),
    ...roundedTopControl(),
    primaryImage: Image({ label: 'Primary image' }),
    primaryImageAlt: TextInput({ label: 'Primary image alt', defaultValue: '' }),
    secondaryImage: Image({ label: 'Secondary image (optional)' }),
    secondaryImageAlt: TextInput({ label: 'Secondary image alt', defaultValue: '' }),
    subheading: Group({
      label: 'Subheading',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({
          label: 'Subheading',
          defaultValue: 'Available in Ontario',
        }),
        ...textColorFields('0 0% 100%'),
        ...fontSizeFields(),
      },
    }),
    heading: Group({
      label: 'Heading',
      preferredLayout: Group.Layout.Popover,
      props: {
        text: TextInput({
          label: 'Heading',
          defaultValue: 'Medications, Vitamins, Minor Ailment',
        }),
        ...textColorFields('0 0% 100%'),
        ...fontSizeFields(),
      },
    }),
    body: Group({
      label: 'Body',
      preferredLayout: Group.Layout.Popover,
      props: {
        html: TextArea({
          label: 'HTML',
          defaultValue: DEFAULT_BODY_HTML,
        }),
        ...textColorFields('0 0% 100%'),
        ...fontSizeFields(),
      },
    }),
    button: Group({
      label: 'Button',
      preferredLayout: Group.Layout.Popover,
      props: {
        label: TextInput({ label: 'Button label', defaultValue: 'Explore CarePack' }),
        link: Link({ label: 'Button link' }),
        ...buttonColorFields(ARCHIVE_BUTTON_PRIMARY_DARK),
      },
    }),
  },
});
