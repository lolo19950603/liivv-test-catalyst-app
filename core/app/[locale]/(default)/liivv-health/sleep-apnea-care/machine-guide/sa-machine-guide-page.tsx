'use client';

/*
 * =============================================================================
 * SLEEP APNEA CARE — COMMON SLEEP APNEA MACHINES, COMPARED
 * =============================================================================
 * The machine guide (ruling N2, 2026-10-13; docs/sleep-content/machine-guide.md),
 * at /liivv-health/sleep-apnea-care/machine-guide: its own page (D13 option 1,
 * spec 8.3), linked from nowhere while LANDING_GATES.machineGuideLinked is
 * false. It helps a reader talk to their prescriber about the machines in it.
 * It recommends none, and Liivv sells none (N1): the page says so first
 * ("…yet", N10 open).
 *
 * Order: the title, the "not sold" line and the intro; the chart's two tables
 * (./machine-compare.tsx); the six cards (machine types, ASV, travel, data,
 * recalls and safety, questions to ask), each with its own sources; then the
 * discovery band and the governance block, with Your Treatment Options'
 * disclaimer. The site's urgent signpost sits under the intro, never gated.
 *
 * No shop strip, product link, price, cart, retailer, pressure or setting
 * anywhere on the page. The ASV card is never collapsed (it carries a Type I
 * recall); no card here collapses.
 *
 * Inside `id="oc-chapter"` with `data-site`, so it takes the chapter palette
 * and this site's own rules (./sa-machine-guide.css). French: the page's
 * words ship on /fr flagged as machine translated; gate `machineGuide`
 * decides the draft marker on previews. The chart's cells stay the makers'
 * English, marked as English.
 * =============================================================================
 */

import { useLocale, useMessages } from 'next-intl';
import type { CSSProperties } from 'react';

import { DiscoveryBand, GovernanceBlock } from '../../_microsite/_components/page-furniture';
import { SourceChip } from '../../_microsite/_components/source-chip';
import { OutboundLabel } from '../../_microsite/chapters/figure-parts';
import { FigureGlyphs, UrgentExit } from '../../_microsite/chapters/figures';
import { chapterHref, localeHref } from '../../_microsite/chapters/hrefs';
import { SiteProvider, useSiteSources } from '../../_microsite/site-context';
import { lookUpSources, type ResolvedSource } from '../../_microsite/sources';
import { showsFrDraftMarker } from '../chapters/review-gates';
import { SLEEP_SITE } from '../chapters/site';
import { URGENT_EXIT_CHAPTER } from '../landing-meta';

import { MachineCompare } from './machine-compare';
import { CHART_A, CHART_B } from './machine-guide-data';
import { type GuideCardMeta, MACHINE_GUIDE } from './machine-guide-meta';

import '../../ostomy-care/chapters/chapter-page.css';
import './sa-machine-guide.css';

/* Placeholders until the Sleep image set and palette are chosen (landing D12). */
const IMG = '/archive/liivv-home/corner-sleep.png';
const ACCENT = '#b9aecf';

/* The chapter whose governance disclaimer the guide carries (spec 1.1). */
const DISCLAIMER_CHAPTER = 'treatment-options';

interface GuideCardWords {
  title: string;
  items: Record<string, string>;
  note?: string;
  links?: Record<string, string>;
}

const ordered = (node: Record<string, string>) =>
  Object.keys(node)
    .map(Number)
    .sort((a, b) => a - b)
    .map((key) => node[String(key)] ?? '')
    .filter(Boolean);

/* One card: its sentences, note, outward links and sources, never collapsed. */
function GuideCard({
  meta,
  words,
  index,
}: {
  meta: GuideCardMeta;
  words: GuideCardWords | undefined;
  index: number;
}) {
  const map = useSiteSources();

  if (!words) return null;

  const items = ordered(words.items);

  return (
    <article className="oc-ch-row is-open sa-guide-card" id={`guide-${meta.key}`}>
      <span aria-hidden className="oc-ch-row-index">
        {String(index).padStart(2, '0')}
      </span>
      <div>
        <h3>{words.title}</h3>
        <ul className="sa-guide-items">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {words.note ? <p className="oc-ch-row-note">{words.note}</p> : null}
        {meta.links?.length ? (
          <p className="oc-ch-card-after">
            {meta.links.map((link) => {
              const label = words.links?.[link.key];
              const source = map?.[link.source];

              return label ? (
                <a
                  href={source?.href ?? link.href}
                  hrefLang={source?.hrefLang}
                  key={link.key}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <OutboundLabel hrefLang={source?.hrefLang} label={label} />
                </a>
              ) : null;
            })}
          </p>
        ) : null}
        {map ? (
          <SourceChip
            className="ms-src-card"
            label={words.title}
            sources={lookUpSources(map, meta.sources)}
          />
        ) : null}
      </div>
    </article>
  );
}

function GuideBody({ pageSources }: { pageSources: ResolvedSource[] }) {
  const locale = useLocale();
  const messages = useMessages().SleepApneaCare;
  const guide = messages.machineGuide;
  const cards: Record<string, GuideCardWords | undefined> = guide.cards;
  const exitWords = messages.chapters[URGENT_EXIT_CHAPTER].urgentExit;
  const { redFlags } = SLEEP_SITE.anchors;
  /* CSS custom property, typed without an assertion. */
  const accentStyle: CSSProperties & Record<string, string> = { '--chapter-accent': ACCENT };

  return (
    <div data-site={SLEEP_SITE.rootAttr} id={SLEEP_SITE.rootId} style={accentStyle}>
      <section className="oc-ch-hero">
        <div className="oc-ch-hero-bg">
          <img alt="" decoding="async" src={IMG} />
        </div>
        <div aria-hidden className="oc-ch-hero-veil" />
        <div className="oc-ch-hero-inner">
          <h1>{guide.title}</h1>
          <p className="oc-ch-hero-lead sa-guide-not-sold">{guide.notSold}</p>
          {showsFrDraftMarker('machineGuide', locale) ? (
            <p className="oc-fig-draft">{messages.ui.chapter.frDraft}</p>
          ) : null}
        </div>
      </section>

      <FigureGlyphs />

      <section className="oc-ch-journal rounded-top">
        <div className="oc-ch-wrap sa-guide-intro">
          <p>{guide.intro}</p>
          <UrgentExit
            exit={{
              lead: exitWords.lead,
              link: exitWords.link,
              href: localeHref(
                `${chapterHref(SLEEP_SITE, redFlags.chapter)}#${redFlags.id}`,
                locale,
              ),
            }}
          />
        </div>
      </section>

      <section className="oc-ch-care rounded-top" id="compare">
        <div className="oc-ch-wrap">
          <header className="oc-ch-care-head">
            <h2>{guide.chart.label}</h2>
          </header>
          <MachineCompare
            adpNoteSources={MACHINE_GUIDE.chart.adpNoteSources}
            chartSources={MACHINE_GUIDE.chart.sources}
            rowsA={CHART_A}
            rowsB={CHART_B}
          />
        </div>
      </section>

      <section className="oc-ch-care rounded-top" id="guide-cards">
        <div className="oc-ch-wrap">
          <div className="oc-ch-rows">
            {MACHINE_GUIDE.cards.map((meta, index) => (
              <GuideCard index={index + 1} key={meta.key} meta={meta} words={cards[meta.key]} />
            ))}
          </div>
        </div>
      </section>

      <DiscoveryBand />

      <GovernanceBlock
        governance={{
          ...SLEEP_SITE.governance,
          disclaimer: messages.chapters[DISCLAIMER_CHAPTER].governance.disclaimer,
        }}
        sources={pageSources}
      />
    </div>
  );
}

export function SaMachineGuidePage({
  sources,
  pageSources,
}: {
  /* Every register entry the page names, by id, resolved for the page locale. */
  sources: Readonly<Record<string, ResolvedSource>>;
  /* The same, once each, for the foot list. */
  pageSources: ResolvedSource[];
}) {
  return (
    <SiteProvider sources={sources} value={SLEEP_SITE}>
      <GuideBody pageSources={pageSources} />
    </SiteProvider>
  );
}
