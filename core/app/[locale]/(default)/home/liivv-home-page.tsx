'use client';

import { useEffect, useMemo, useState } from 'react';

import { HOME_CORNERS, type CornerStatus, type HomeCorner } from './corners-data';

import './liivv-home.css';

/*
 * =============================================================================
 * LIIVV HOME — Living Map
 * =============================================================================
 * Distinct from Women's Health: atlas / wayfinding layout, not doors+bento cards.
 * Page URL: /
 * Corners: ./corners-data.ts
 * Images: /public/archive/liivv-home/ (AI lifestyle, brand palette)
 * =============================================================================
 */

const IMG = '/archive/liivv-home';
const PHARMACIST_HREF = '/account/virtual-care';
const HUB_HREF = '/pages/liivv-health';
const WOMENS_HREF = '/liivv-health/womens-health';

const FEELING_WORDS = ['at ease', 'like yourself', 'steady', 'unfiltered', 'ready'] as const;

const TRUST_ITEMS = [
  'Discreet delivery',
  'Ontario pharmacist chat',
  'Customize & save kits',
  'No shame. Just health.',
  'Science with style',
  'Wellness that works IRL',
] as const;

const WAYS = [
  {
    id: 'map',
    num: '01',
    title: 'Find your corner',
    body: 'Eleven everyday-living spaces — open the one that feels like today.',
    href: '#corners',
  },
  {
    id: 'care',
    num: '02',
    title: 'Ask a pharmacist',
    body: 'Ontario chat — kind answers, no waiting room energy.',
    href: '#care',
  },
  {
    id: 'live',
    num: '03',
    title: 'Start where it is live',
    body: "Women's, Diabetes, and Ostomy are open. The rest are warming up.",
    href: '#corners',
  },
] as const;

const CORNER_FILTERS = [
  { id: 'all', label: 'All eleven' },
  { id: 'live', label: 'Open now' },
  { id: 'soon', label: 'On the way' },
] as const;

type CornerFilterId = (typeof CORNER_FILTERS)[number]['id'];

function WaveDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div aria-hidden className={`lh-wave${flip ? ' is-flip' : ''}`}>
      <svg preserveAspectRatio="none" viewBox="0 0 1440 64">
        <path d="M0,32 C240,64 480,0 720,24 C960,48 1200,8 1440,32 L1440,64 L0,64 Z" />
      </svg>
    </div>
  );
}

function CornerPreview({ corner }: { corner: HomeCorner }) {
  const cta =
    corner.status === 'live' && corner.href ? (
      <a className="btn btn-dark" href={corner.href}>
        Step into this corner
      </a>
    ) : (
      <span className="lh-soon-note">
        Coming soon
        {corner.ontarioOnly ? ' · Ontario only' : ''}
      </span>
    );

  return (
    <div className="lh-atlas-preview" data-accent={corner.accent}>
      <div className="lh-atlas-preview-media">
        <img alt="" src={corner.image} />
        <div className="lh-atlas-preview-veil" />
        <span className="lh-atlas-preview-num">{corner.num}</span>
      </div>
      <div className="lh-atlas-preview-copy">
        <div className="lh-atlas-preview-meta">
          {corner.status === 'live' ? (
            <span className="lh-pill lh-pill--live">Open</span>
          ) : (
            <span className="lh-pill lh-pill--soon">Coming soon</span>
          )}
          {corner.ontarioOnly ? <span className="lh-pill lh-pill--on">Ontario</span> : null}
        </div>
        <h3>{corner.title}</h3>
        <p>{corner.vibe}</p>
        {cta}
      </div>
    </div>
  );
}

export function LiivvHomePage() {
  const [feelingIndex, setFeelingIndex] = useState(0);
  const [cornerFilter, setCornerFilter] = useState<CornerFilterId>('all');
  const [activeId, setActiveId] = useState(HOME_CORNERS[0]?.id ?? '');

  useEffect(() => {
    const id = window.setInterval(() => {
      setFeelingIndex((i) => (i + 1) % FEELING_WORDS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, []);

  const filteredCorners = useMemo(() => {
    if (cornerFilter === 'all') return HOME_CORNERS;
    return HOME_CORNERS.filter((c) => c.status === (cornerFilter as CornerStatus));
  }, [cornerFilter]);

  useEffect(() => {
    if (!filteredCorners.some((c) => c.id === activeId)) {
      setActiveId(filteredCorners[0]?.id ?? '');
    }
  }, [filteredCorners, activeId]);

  const activeCorner =
    filteredCorners.find((c) => c.id === activeId) ?? filteredCorners[0] ?? HOME_CORNERS[0];

  const marqueeCorners = [...HOME_CORNERS, ...HOME_CORNERS];
  const trustLoop = [...TRUST_ITEMS, ...TRUST_ITEMS];

  return (
    <div id="liivv-home">
      {/* =====================================================================
          SECTION 1 — HERO (brand billboard + kinetic corner ribbon)
          ===================================================================== */}
      <section aria-label="Liivv home hero" className="lh-hero">
        <div className="lh-hero-board">
          <p className="lh-hero-brand">Liivv</p>
          <p className="lh-hero-kicker">Health, your way · Everyday living</p>
          <h1>
            A calm home for care that helps you feel{' '}
            <span aria-live="polite" className="lh-feel" key={FEELING_WORDS[feelingIndex]}>
              {FEELING_WORDS[feelingIndex]}
            </span>
            .
          </h1>
          <p className="lh-hero-lead">
            Not a clinic lobby — a living map of eleven corners. Shop, learn, and ask without the awkward.
          </p>
          <div className="lh-hero-cta">
            <a className="btn btn-dark" href="#corners">
              Open the map
            </a>
            <a className="btn btn-outline" href={PHARMACIST_HREF}>
              Talk to a pharmacist
            </a>
          </div>
        </div>

        <div aria-hidden className="lh-hero-panel">
            <img alt="" src={`${IMG}/hero-living.png`} />
          <div className="lh-hero-stamp">
            <span>11</span>
            corners of living
          </div>
        </div>

        <div aria-hidden className="lh-hero-ribbon">
          <div className="lh-hero-ribbon-track">
            {marqueeCorners.map((corner, i) => (
              <span key={`${corner.id}-${i}`}>
                {corner.title}
                <i />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2 — TRUST TICKER
          ===================================================================== */}
      <section aria-label="Why Liivv" className="lh-ticker">
        <div className="lh-ticker-track">
          {trustLoop.map((item, i) => (
            <span key={`${item}-${i}`}>{item}</span>
          ))}
        </div>
      </section>

      <WaveDivider />

      {/* =====================================================================
          SECTION 3 — WAYFINDING (text paths, not photo door cards)
          ===================================================================== */}
      <section aria-label="Start here" className="lh-ways" id="doors">
        <div className="lh-ways-head">
          <span className="eyebrow">Wayfinding</span>
          <h2>Three paths. Same calm home.</h2>
        </div>
        <ol className="lh-ways-list">
          {WAYS.map((way) => (
            <li key={way.id}>
              <a href={way.href}>
                <span className="lh-ways-num">{way.num}</span>
                <span className="lh-ways-copy">
                  <strong>{way.title}</strong>
                  <em>{way.body}</em>
                </span>
                <span aria-hidden className="lh-ways-arrow">
                  →
                </span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      {/* =====================================================================
          SECTION 4 — ATLAS (index + preview) — centerpiece
          ===================================================================== */}
      <section aria-label="Your corners of living" className="lh-atlas" id="corners">
        <div className="lh-atlas-head">
          <div>
            <span className="eyebrow">The living map</span>
            <h2>What part of living needs a little help?</h2>
            <p>
              Pick a corner on the left — peek on the right. Open the ones that are live; the rest are on the
              way.
            </p>
          </div>
          <div aria-label="Filter corners" className="lh-atlas-filters" role="tablist">
            {CORNER_FILTERS.map((filter) => (
              <button
                aria-selected={cornerFilter === filter.id}
                className={cornerFilter === filter.id ? 'is-active' : undefined}
                key={filter.id}
                onClick={() => setCornerFilter(filter.id)}
                role="tab"
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="lh-atlas-shell">
          <div aria-label="Corner index" className="lh-atlas-index" role="listbox">
            {filteredCorners.map((corner) => {
              const selected = corner.id === activeCorner?.id;
              return (
                <button
                  aria-selected={selected}
                  className={selected ? 'is-active' : undefined}
                  data-accent={corner.accent}
                  data-status={corner.status}
                  key={corner.id}
                  onClick={() => setActiveId(corner.id)}
                  onFocus={() => setActiveId(corner.id)}
                  onMouseEnter={() => setActiveId(corner.id)}
                  role="option"
                  type="button"
                >
                  <span className="lh-atlas-index-num">{corner.num}</span>
                  <span className="lh-atlas-index-title">{corner.title}</span>
                  <span className={`lh-atlas-index-status is-${corner.status}`}>
                    {corner.status === 'live' ? 'Open' : 'Soon'}
                  </span>
                </button>
              );
            })}
            {filteredCorners.length === 0 ? (
              <p className="lh-atlas-empty">Nothing in this filter — try All eleven.</p>
            ) : null}
          </div>

          {activeCorner ? <CornerPreview corner={activeCorner} /> : null}
        </div>
      </section>

      <WaveDivider flip />

      {/* =====================================================================
          SECTION 5 — BRAND FEEL (sun motif + manifesto line)
          ===================================================================== */}
      <section aria-label="The Liivv feel" className="lh-manifest" id="feel">
        <div className="lh-manifest-orb" aria-hidden />
        <div className="lh-manifest-copy">
          <span className="eyebrow">The Liivv vibe</span>
          <h2>
            Science with style.
            <br />
            At your pace.
          </h2>
          <p>
            We mix clinical support and lifestyle so health feels natural, modern, and authentically yours —
            captured in the small, everyday moments. No filters. No false promises.
          </p>
          <ul className="lh-manifest-traits">
            <li>Boldly authentic</li>
            <li>Effortlessly modern</li>
            <li>Inclusive &amp; relatable</li>
            <li>Empowering</li>
          </ul>
        </div>
      </section>

      {/* =====================================================================
          SECTION 6 — CARE (postcard, not 3-up collage)
          ===================================================================== */}
      <section aria-label="Pharmacist care" className="lh-care" id="care">
        <div className="lh-care-card">
          <div className="lh-care-media">
            <img alt="" src={`${IMG}/care-chat.png`} />
          </div>
          <div className="lh-care-copy">
            <span className="eyebrow">Available in Ontario</span>
            <h2>Relief that doesn&apos;t wait on a waiting room</h2>
            <p>
              Clear answers, no med-speak, no judgment. Chat with an Ontario pharmacist during business hours
              — until 5 p.m. Eastern.
            </p>
            <p>
              Outside those hours, Olivia can help with shopping and your account — she does not give medical
              advice.
            </p>
            <a className="btn btn-dark" href={PHARMACIST_HREF}>
              Talk to a Pharmacist
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 7 — FAQ
          ===================================================================== */}
      <section aria-label="Frequently asked questions" className="lh-faq" id="faq">
        <div className="lh-faq-rail">
          <span className="eyebrow">FAQ</span>
          <h2>Good questions, honest answers</h2>
          <p>The things people actually ask — answered like a friend would.</p>
        </div>
        <div className="lh-faq-list">
          <details open>
            <summary>What is Liivv?</summary>
            <p>
              Liivv is your calm health home for everyday living — curated shops, kind guidance, and discreet
              delivery. We bring science-backed care into your life in a way that feels natural and real.
            </p>
          </details>
          <details>
            <summary>Which corners are open right now?</summary>
            <p>
              Women&apos;s Health &amp; Wellness, Diabetes Care &amp; Everyday Living, and Ostomy Care &amp;
              Everyday Living are open. The rest are coming soon — same calm place when they arrive.
            </p>
          </details>
          <details>
            <summary>How private is my order?</summary>
            <p>Plain packaging. Quiet checkout. Your order is nobody&apos;s business but yours.</p>
          </details>
          <details>
            <summary>What can I chat with a pharmacist about?</summary>
            <p>
              Everyday concerns in Ontario during business hours (until 5 p.m. Eastern). Olivia helps with
              shopping anytime — she does not give medical advice.
            </p>
          </details>
        </div>
      </section>

      {/* =====================================================================
          SECTION 8 — CLOSING (soft cream, not dark photo manifesto)
          ===================================================================== */}
      <section aria-label="The Liivv promise" className="lh-close" id="manifesto">
        <p className="lh-close-kicker">The Liivv promise</p>
        <h2>
          No shame. No hype.
          <span>Just you — at your best.</span>
        </h2>
        <p>
          We&apos;re done with filters and false promises. Health should feel natural, modern, and
          authentically yours — at your pace.
        </p>
        <div className="lh-close-cta">
          <a className="btn btn-dark" href="#corners">
            Open the map
          </a>
          <a className="btn btn-outline" href={WOMENS_HREF}>
            Visit Women&apos;s Health
          </a>
          <a className="btn btn-outline" href={HUB_HREF}>
            Liivv Health hub
          </a>
        </div>
      </section>
    </div>
  );
}
