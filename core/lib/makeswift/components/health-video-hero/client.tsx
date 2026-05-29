'use client';

import {
  DiabetesCareVideoHero,
  type DiabetesCareVideoHeroProps,
} from '~/lib/makeswift/components/diabetes-care-video-hero/client';
import { resolveHealthSectionDomId } from '~/lib/makeswift/health-page-section-id';

export const HEALTH_VIDEO_HERO_SECTION_ID =
  'shopify-section-template--26491503870243__video_with_text_overlay_BRd8Y9';

export type HealthVideoHeroProps = DiabetesCareVideoHeroProps & {
  /** Unique per page when placing multiple instances (appended to section id). */
  instanceSuffix?: string;
};

export function HealthVideoHero({ sectionDomId, instanceSuffix, ...props }: HealthVideoHeroProps) {
  return (
    <DiabetesCareVideoHero
      {...props}
      sectionDomId={resolveHealthSectionDomId(
        sectionDomId ?? HEALTH_VIDEO_HERO_SECTION_ID,
        instanceSuffix,
      )}
    />
  );
}
