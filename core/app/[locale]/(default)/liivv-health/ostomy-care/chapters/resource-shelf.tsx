'use client';

/*
 * =============================================================================
 * RESOURCES SHELF (C14) — after the band slot, before the pharmacist panel
 * =============================================================================
 * Where Canadian nurses send people: the guides, the video teaching, the nurse
 * directory and the peer network. Four groups, each a short list of links to
 * someone else's site.
 *
 * We link, and we do nothing else. No embedded video, no framed page, no copy
 * of a guide — NSWOCC's guides may be reproduced only unmodified and with
 * permission, and a volunteer contact on a chapter listing is theirs, not ours.
 * Links open in the same tab, and each one names the organisation it belongs to
 * and says when the page it opens is in the other language.
 *
 * No manufacturer enrolment program appears here. The shelf sits outside every
 * shop band on purpose: nothing on it is for sale, and nothing on it depends on
 * buying from Liivv.
 *
 * Words come from `chapters.<slug>.shelf` and `ui.chapter.shelf`; the
 * organisations, URLs, link languages and holds come from chapters-meta.ts.
 * =============================================================================
 */

import { useTranslations } from 'next-intl';

import type { Shelf as ShelfData, ShelfLink } from './chapters-data';
import { FrDraftMarker, Glyph, OutboundLabel } from './figure-parts';

function ShelfItem({ link }: { link: ShelfLink }) {
  const t = useTranslations('OstomyCare.ui.chapter');

  return (
    <li>
      <a className="oc-ch-shelf-link" href={link.href} hrefLang={link.hrefLang}>
        <OutboundLabel hrefLang={link.hrefLang} label={link.title} />
      </a>
      <p className="oc-ch-shelf-org">
        {link.org} · {t('opensOnTheirSite')}
      </p>
      <p className="oc-ch-shelf-body">
        {link.body}
        {link.note ? <span className="oc-ch-shelf-note"> · {link.note}</span> : null}
      </p>
    </li>
  );
}

export function ResourceShelf({ shelf }: { shelf: ShelfData }) {
  const t = useTranslations('OstomyCare.ui.chapter');

  return (
    <section
      aria-labelledby="chapter-shelf-heading"
      className="oc-ch-shelf rounded-top"
      id="chapter-shelf"
    >
      <div className="oc-ch-wrap">
        <FrDraftMarker gate="shelf" />
        <header className="oc-ch-care-head">
          <span className="oc-ch-eyebrow">{t('resourcesEyebrow')}</span>
          <h2 id="chapter-shelf-heading">{shelf.heading}</h2>
        </header>
        <div className="oc-ch-shelf-grid">
          {shelf.groups.map((group) => (
            <section className="oc-ch-shelf-group" key={group.heading}>
              <h3>
                <Glyph name={group.glyph} />
                {group.heading}
              </h3>
              <ul>
                {group.links.map((link) => (
                  <ShelfItem key={link.href} link={link} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
