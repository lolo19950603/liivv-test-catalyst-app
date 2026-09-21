'use client';

/*
 * =============================================================================
 * BOWEL REFERENCE STILL (C04) — Chapter 02, card 1
 * =============================================================================
 * Normal small and large intestine, seen from the front, with eight numbered
 * markers over the picture and the same eight names in a list beside it.
 *
 * It is one pre-rendered image, not a 3D viewer: no WebGL, no model to
 * download, no control of any kind. Every word and marker is in the server HTML
 * and no script touches any of it; the only thing that can change is which file
 * the browser picks out of the srcset.
 *
 * A reader with JavaScript off sees it too, now. The `loading.tsx` that used to
 * sit at `app/[locale]/(default)` wrapped every route in the group in a Suspense
 * boundary, so the body arrived in a `<div hidden>` that only an inline script
 * moved into the document. It has been removed, and the page's own markup — this
 * figure included — is in the first flush of the HTML.
 *
 * THE PICTURE CARRIES NO WORDS. Every label is HTML, so it translates, reflows,
 * scales with the reader's font size, can be selected, and is read aloud. The
 * numbers drawn on the picture are `aria-hidden`: they are a pointer into the
 * list below, and a screen reader that read "1 2 3 4 5 6 7 8" over an image
 * would be reading noise. The list is an <ol>, so its numbering is the marker
 * numbering and the two cannot drift.
 *
 * The alt text describes the picture. It never repeats the card's own
 * sentences: a reader who cannot see the image should get what the image adds,
 * not the paragraph they have already read.
 *
 * Nothing here is the reader's own body. No stoma is drawn, no pouch, no exit,
 * and nothing is dimmed to say it was removed — which surgery removed what
 * varies far too much for one picture, and the caption says exactly that.
 *
 * The credit is fixed English in both locales (anatomy-meta.ts): CC BY 4.0 asks
 * for the creator, the licence, a link to it and an indication of changes, and
 * an attribution is not a thing a copy edit or a translation pass may soften.
 * =============================================================================
 */

import { useLocale, useTranslations } from 'next-intl';

import { ANATOMY_PARTS, BOWEL_CREDIT, BOWEL_STILL } from './anatomy-meta';
import { FrDraftMarker } from './figure-parts';

/*
 * The widest the picture is ever laid out (see `.oc-fig-anatomy-frame` in
 * chapter-page.css), so a phone never downloads the 1280 file for a box a
 * third of that. Below the stacking breakpoint the picture takes most of the
 * card's width.
 */
const SIZES = '(min-width: 640px) 18rem, 78vw';

const srcSet = (type: string) =>
  BOWEL_STILL.widths.map((width) => `${BOWEL_STILL.src}-${width}.${type} ${width}w`).join(', ');

/*
 * The heading the part list is named by. A fixed id rather than useId(): this
 * figure appears once on a page, and a generated id would differ between the
 * server HTML and the browser.
 */
const PARTS_LABEL_ID = 'oc-anatomy-parts-label';

/*
 * The credit, assembled from the identifiers in anatomy-meta.ts.
 *
 * WHAT IS TRANSLATED HERE AND WHAT IS NOT
 * -----------------------------------------------------------------------------
 * The identifiers are not: a collection name, two work titles, their versions
 * and DOIs, two author surnames, a consortium and a licence code are the names
 * of published things, and translating a name misattributes it.
 *
 * The three sentences beside them are. "Recoloured for this page, with some
 * structures hidden" and "For education, not diagnosis" are prose — the second
 * is the one sentence in the credit a reader is actually meant to act on — and
 * they rendered in English on the French page for no reason except that they
 * happened to sit in the same constant as the DOIs. They are now
 * `ui.chapter.anatomy.credit.*` in both message files.
 *
 * The NLM courtesy sentence stays verbatim English, because the NLM asks for
 * those words. On /fr it is followed by a French gloss in brackets, so a
 * francophone reader is not left with an unexplained English sentence; the
 * required wording is untouched and `lang` marks which is which.
 *
 * The licence link is the one link in the figure. It opens in the same tab and
 * carries no "(in English)" note, because Creative Commons serves that deed in
 * the reader's own language.
 */
function BowelCredit() {
  const t = useTranslations('OstomyCare.ui.chapter.anatomy.credit');
  const locale = useLocale();
  const works = BOWEL_CREDIT.works
    .map((work) => `${work.title} ${work.version} (doi:${work.doi})`)
    .join(' and ');

  return (
    <p className="oc-fig-anatomy-credit">
      <span lang="en">
        {`${BOWEL_CREDIT.lead}: ${BOWEL_CREDIT.collection} — ${works}. `}
        {`${BOWEL_CREDIT.authors}; ${BOWEL_CREDIT.consortium}. `}
      </span>
      <a href={BOWEL_CREDIT.licenceHref} rel="license">
        {BOWEL_CREDIT.licence}
      </a>
      {`. ${t('modification')} `}
      <span lang="en">{BOWEL_CREDIT.courtesy}</span>
      {locale === 'en' ? null : ` (${t('courtesyGloss')})`}
      {` ${t('purpose')}`}
    </p>
  );
}

export function BowelReferenceFigure() {
  const t = useTranslations('OstomyCare.ui.chapter.anatomy');

  return (
    <figure className="oc-fig-anatomy">
      <FrDraftMarker gate="bowelReference" />

      <div className="oc-fig-anatomy-body">
        <div className="oc-fig-anatomy-frame">
          <picture>
            <source sizes={SIZES} srcSet={srcSet('avif')} type="image/avif" />
            {/*
             * The WebP set is the fallback, and its middle file is the plain
             * `src` for anything that ignores a srcset. There is no third
             * format: every browser that reaches this page reads one of the two.
             */}
            <img
              alt={t('alt')}
              decoding="async"
              height={BOWEL_STILL.height}
              loading="lazy"
              sizes={SIZES}
              src={`${BOWEL_STILL.src}-960.webp`}
              srcSet={srcSet('webp')}
              width={BOWEL_STILL.width}
            />
          </picture>
          <span aria-hidden className="oc-fig-anatomy-marks">
            {ANATOMY_PARTS.map((part, index) => (
              <span
                className="oc-fig-anatomy-mark"
                key={part.key}
                style={{ left: `${part.x}%`, top: `${part.y}%` }}
              >
                {index + 1}
              </span>
            ))}
          </span>
        </div>

        <div className="oc-fig-anatomy-names">
          <p className="oc-fig-anatomy-parts-h" id={PARTS_LABEL_ID}>
            {t('partsHeading')}
          </p>
          <ol aria-labelledby={PARTS_LABEL_ID} className="oc-fig-anatomy-parts">
            {ANATOMY_PARTS.map((part) => (
              <li key={part.key}>{t(`parts.${part.key}`)}</li>
            ))}
          </ol>
          <p className="oc-fig-anatomy-orient">{t('orientation')}</p>
        </div>
      </div>

      <figcaption className="oc-fig-anatomy-caption">
        <p>{t('caption')}</p>
        <BowelCredit />
      </figcaption>
    </figure>
  );
}
