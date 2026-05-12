import { Checkbox, Style, TextArea, TextInput } from '@makeswift/runtime/controls';
import { createElement } from 'react';

import {
  DIABETES_CARE_SECTION_OPTIONS,
  type DiabetesCareSectionSuffix,
} from '~/lib/archived-pages/diabetes-care-section-allowlist';
import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareSectionArchive } from './section-archive-client';

/** Sections replaced by dedicated React components (not raw HTML slices). */
const SECTIONS_WITH_DEDICATED_COMPONENT = new Set<DiabetesCareSectionSuffix>([
  'video_with_text_overlay_RnWXxE',
  'custom_section_WpXaJg',
  'number_counter_dTAx7w',
  'timeline_nyTDKQ',
]);

const sharedProps = {
  className: Style(),
  hidden: Checkbox({ label: 'Hide this section', defaultValue: false }),
  ariaLabel: TextInput({ label: 'Accessibility label (optional)', defaultValue: '' }),
  footnote: TextArea({
    label: 'Optional footnote below section',
    defaultValue: '',
  }),
};

/**
 * Stable Makeswift component `type` for a diabetes-care.html slice.
 *
 * @param {DiabetesCareSectionSuffix} suffix - Shopify section suffix from the export.
 * @returns {string} Makeswift component type id.
 */
export function diabetesCareArchiveComponentType(suffix: DiabetesCareSectionSuffix): string {
  return `diabetes-care-archive__${suffix}`;
}

DIABETES_CARE_SECTION_OPTIONS.forEach((option) => {
  if (SECTIONS_WITH_DEDICATED_COMPONENT.has(option.value)) {
    return;
  }

  const suffix = option.value;

  const BoundSection = (props: {
    className?: string;
    hidden?: boolean;
    ariaLabel?: string;
    footnote?: string;
  }) => createElement(DiabetesCareSectionArchive, { ...props, section: suffix });

  BoundSection.displayName = `DiabetesCareSectionArchive(${suffix})`;

  runtime.registerComponent(BoundSection, {
    type: diabetesCareArchiveComponentType(suffix),
    label: `Diabetes care / ${option.label}`,
    icon: 'layout',
    props: sharedProps,
  });
});
