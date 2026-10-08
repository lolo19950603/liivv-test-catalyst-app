'use client';

/*
 * =============================================================================
 * PAPER MEASURING GUIDE — Chapter 02, card 9, and one-line links elsewhere
 * =============================================================================
 * The holes a reader cuts are in the PDF, drawn at real millimetres by
 * core/scripts/render-stoma-measuring-guide.mjs. Nothing on the page is a
 * measuring tool. The preview circles are a picture of the sheet, and the
 * line above them says they are not actual size.
 *
 * Print opens the PDF. The chapter's HTML print path is the wrong tool here:
 * a browser rescales the page, and the holes would no longer be the labelled
 * size. Download is the same file, which is what a phone can save and take
 * to a printer.
 *
 * `variant: 'link'` is one line to that file. The sheet itself stays on the
 * measuring card.
 * =============================================================================
 */

import { useLocale, useTranslations } from 'next-intl';

import type { CategoryCard } from './chapters-data';
import { FrDraftMarker, Glyph } from './figure-parts';

export function measuringGuidePdf(locale: string) {
  return locale === 'fr'
    ? '/archive/ostomy-care/stoma-measuring-guide-fr.pdf'
    : '/archive/ostomy-care/stoma-measuring-guide-en.pdf';
}

/* A picture of the sheet. The sizes are arbitrary on purpose. */
function GuidePreview() {
  return (
    <div aria-hidden className="oc-fig-guide-preview">
      <span className="is-1" />
      <span className="is-2" />
      <span className="is-3" />
      <span className="is-4" />
      <span className="is-5" />
    </div>
  );
}

export function MeasuringGuideFigure({
  card,
  variant,
}: {
  card: CategoryCard;
  variant: 'panel' | 'link';
}) {
  const t = useTranslations('OstomyCare.ui.chapter.measuringGuide');
  const locale = useLocale();
  const pdf = measuringGuidePdf(locale);
  const text = card.figureText;

  if (variant === 'link') {
    if (!text?.guideLink) return null;

    return (
      // A <div>, not a <p>: the French draft marker is a paragraph of its own,
      // and a paragraph inside a paragraph breaks hydration on /fr (QA, 2026-10-08).
      <div className="oc-fig-guide-link">
        <FrDraftMarker gate="measuringGuide" />
        <a download href={pdf}>
          <Glyph name="print" />
          {text.guideLink}
        </a>
      </div>
    );
  }

  return (
    <div className="oc-fig-guide">
      <FrDraftMarker gate="measuringGuide" />
      {text?.guideHeading ? <p className="oc-fig-heading">{text.guideHeading}</p> : null}
      {text?.guidePreview ? <p className="oc-fig-guide-preview-note">{text.guidePreview}</p> : null}
      <GuidePreview />
      {text?.guideBody ? <p>{text.guideBody}</p> : null}
      {text?.guidePhone ? <p className="oc-fig-guide-phone">{text.guidePhone}</p> : null}
      <p className="oc-fig-guide-actions">
        <a className="oc-fig-print is-primary" download href={pdf}>
          <Glyph name="print" />
          {t('download')}
        </a>
        <a className="oc-fig-print" href={pdf} rel="noopener noreferrer" target="_blank">
          {t('print')}
        </a>
      </p>
    </div>
  );
}
