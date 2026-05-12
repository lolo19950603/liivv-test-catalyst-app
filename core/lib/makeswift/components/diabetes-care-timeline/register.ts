import { Group, Image, Link, List, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DiabetesCareTimeline } from './client';

/** Stable id aligned with `timeline_nyTDKQ` in `diabetes-care.html` (dedicated slice, not HTML fetch). */
export const COMPONENT_TYPE = 'diabetes-care-timeline';

runtime.registerComponent(DiabetesCareTimeline, {
  type: COMPONENT_TYPE,
  label: 'Diabetes care / Timeline',
  icon: 'carousel',
  props: {
    className: Style(),
    topHeading: TextInput({
      label: 'Main heading',
      defaultValue: 'Your Care Journey, Simp(liivv)fied',
    }),
    headingAccentPhrase: TextInput({
      label: 'Heading accent phrase (highlighted segment)',
      defaultValue: 'liivv',
    }),
    sections: List({
      label: 'Journey sections (order = timeline left to right)',
      type: Group({
        label: 'Section',
        props: {
          editorLabel: TextInput({
            label: 'Section label (left list in editor)',
            defaultValue: 'Journey step',
          }),
          timelineLabel: TextInput({
            label: 'Timeline label (bottom bar)',
            defaultValue: 'Personalize Your Space',
          }),
          categoryLabel: TextInput({
            label: 'Category label (small text above title)',
            defaultValue: 'Personalize Your Space',
          }),
          sectionHeading: TextInput({
            label: 'Section heading',
            defaultValue: 'Your Liivv Account',
          }),
          subtext: TextArea({
            label: 'Intro text',
            defaultValue: "Keep it simple and make it yours. Here's what we'd love to know:",
          }),
          bulletPoints: List({
            label: 'Bullet list',
            type: Group({
              label: 'Line',
              props: {
                text: TextInput({ label: 'Text', defaultValue: 'Name' }),
              },
            }),
            getItemLabel(item) {
              return item?.text != null && String(item.text).length > 0
                ? String(item.text)
                : 'Line';
            },
          }),
          buttonText: TextInput({ label: 'Button text', defaultValue: 'Get Started' }),
          buttonLink: Link({ label: 'Button link' }),
          imageSrc: Image({ label: 'Image' }),
          imageAlt: TextInput({ label: 'Image alt text', defaultValue: 'Care journey' }),
        },
      }),
      getItemLabel(section) {
        return (
          section?.editorLabel || section?.timelineLabel || section?.sectionHeading || 'Section'
        );
      },
    }),
  },
});
