'use client';

import {
  DiabetesCareTimeline,
  type DiabetesCareTimelineProps,
} from '~/lib/makeswift/components/diabetes-care-timeline/client';
import { resolveHealthSectionDomId } from '~/lib/makeswift/health-page-section-id';

export const HEALTH_TIMELINE_SECTION_ID =
  'shopify-section-template--26491503870243__timeline_bXVQnQ';
export const HEALTH_TIMELINE_SLIDER_ID = 'Slider-template--26491503870243__timeline_bXVQnQ';

export type HealthTimelineProps = DiabetesCareTimelineProps & {
  instanceSuffix?: string;
};

export function HealthTimeline({
  sectionDomId,
  sliderDomId,
  instanceSuffix,
  ...props
}: HealthTimelineProps) {
  const resolvedSectionId = resolveHealthSectionDomId(
    sectionDomId ?? HEALTH_TIMELINE_SECTION_ID,
    instanceSuffix,
  );
  const resolvedSliderId =
    sliderDomId ??
    (instanceSuffix?.trim()
      ? `Slider-template--26491503870243__timeline_${instanceSuffix.trim().replace(/[^a-zA-Z0-9_-]/g, '')}`
      : HEALTH_TIMELINE_SLIDER_ID);

  return (
    <DiabetesCareTimeline
      {...props}
      sectionDomId={resolvedSectionId}
      sliderDomId={resolvedSliderId}
    />
  );
}
