'use client';

/*
 * =============================================================================
 * SLEEP APNEA CARE — THE SITE'S OWN FIGURES
 * =============================================================================
 * The figure kinds the shared engine does not draw itself, handed back here
 * through the registry the site's wrapper gives SiteProvider
 * (./sa-chapter-page.tsx). Structure comes from chapters-meta.ts; every word
 * from the SleepApneaCare messages: the card's own sentences by number, its
 * `figure` messages (`card.figureWords`, read with ./figure-words.ts) and the
 * `ui.<kind>` controls.
 *
 *   signsChecklist, ahiScale             ./signs-figures.tsx    (Ch01 cards 4, 9)
 *   licenceClasses                       ./safety-figures.tsx   (Ch02 card 3)
 *   followUpTimeline, maskPicker,
 *   usageExplainer, troubleshootFinder   ./cpap-figures.tsx     (Ch04 cards 1, 3, 8, 9)
 *   resupplyPlanner, tripList            ./everyday-figures.tsx (Ch05 cards 3, 8)
 *
 * Every figure is complete in the server HTML, keeps what a reader does in
 * component state only, and draws no product, price or cart action. A figure
 * whose French is not yet reviewed is dropped on /fr in production by the
 * composer (./review-gates.ts), and its card falls back to its own plain
 * lists; the checklist sits on an urgent card, so it is kept in every locale.
 * =============================================================================
 */

import type { CategoryCard, Chapter } from '../../_microsite/chapters/compose';
import type { SiteFigureRegistry } from '../../_microsite/site-context';

import type { FigureMeta } from './chapters-meta';
import {
  FollowUpTimelineFigure,
  MaskPickerFigure,
  TroubleshootFinderFigure,
  UsageExplainerFigure,
} from './cpap-figures';
import { ResupplyPlannerFigure, TripListFigure } from './everyday-figures';
import { LicenceClassesFigure } from './safety-figures';
import { AhiScaleFigure, SignsChecklistFigure } from './signs-figures';

export const SA_FIGURES: SiteFigureRegistry<
  FigureMeta,
  CategoryCard,
  NonNullable<Chapter['urgentExit']>
> = {
  render(figure, { card }) {
    switch (figure.kind) {
      case 'signsChecklist':
        return <SignsChecklistFigure card={card} figure={figure} />;

      case 'ahiScale':
        return <AhiScaleFigure card={card} figure={figure} />;

      case 'licenceClasses':
        return <LicenceClassesFigure card={card} figure={figure} />;

      case 'followUpTimeline':
        return <FollowUpTimelineFigure card={card} figure={figure} />;

      case 'maskPicker':
        return <MaskPickerFigure card={card} figure={figure} />;

      case 'usageExplainer':
        return <UsageExplainerFigure card={card} figure={figure} />;

      case 'troubleshootFinder':
        return <TroubleshootFinderFigure card={card} figure={figure} />;

      case 'resupplyPlanner':
        return <ResupplyPlannerFigure card={card} figure={figure} />;

      case 'tripList':
        return <TripListFigure card={card} figure={figure} />;

      default:
        return null;
    }
  },
};
