/* Twin of ostomy-care/chapters/resource-shelf.tsx @3b343c6e — port fixes both ways until Phase 2 */

'use client';

/*
 * =============================================================================
 * RESOURCES SHELF — after the band slot, before the pharmacist panel
 * =============================================================================
 * Where the site's clinicians send people: guides, teaching, directories and
 * peer networks. A few groups, each a short list of links to someone else's
 * site.
 *
 * We link, and we do nothing else. No embedded video, no framed page, no copy
 * of a guide. Links open in the same tab, and each one names the organisation
 * it belongs to and says when the page it opens is in the other language.
 *
 * No manufacturer enrolment program appears here. The shelf sits outside every
 * shop band on purpose: nothing on it is for sale, and nothing on it depends on
 * buying from Liivv.
 *
 * Words come from `chapters.<slug>.shelf` and `ui.chapter.shelf`; the
 * organisations, URLs, link languages and holds come from the site's
 * chapters-meta.ts. The French gate is the site's `features.shelf`.
 * =============================================================================
 */

import { useSite, useSiteT } from '../site-context';

import type { Shelf as ShelfData, ShelfLink } from './compose';
import { FrDraftMarker, Glyph, OutboundLabel } from './figure-parts';

function ShelfItem({ link }: { link: ShelfLink }) {
  const t = useSiteT('ui.chapter');

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
  const t = useSiteT('ui.chapter');
  const { gates } = useSite();

  return (
    <section
      aria-labelledby="chapter-shelf-heading"
      className="oc-ch-shelf rounded-top"
      id="chapter-shelf"
    >
      <div className="oc-ch-wrap">
        <FrDraftMarker gate={gates.features.shelf} />
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
