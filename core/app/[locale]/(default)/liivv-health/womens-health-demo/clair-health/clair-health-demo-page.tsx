'use client';

import { useEffect, useState } from 'react';

import './clair-health-demo.css';

const IMG = '/archive/womens-health-demo';
const WOMEN_HREF = '/liivv-health/womens-health-demo';
const PREORDER_HREF = '/clair-health-wristband/';

const RIVER_TOP = [
  `${IMG}/clair-official-product.jpg`,
  `${IMG}/clair-official-frame-10.jpg`,
  `${IMG}/clair-official-fertility.jpg`,
  `${IMG}/clair-official-frame-20.jpg`,
  `${IMG}/clair-official-frame.jpg`,
  `${IMG}/clair-official-training.jpg`,
] as const;

const RIVER_BOTTOM = [
  `${IMG}/clair-1.jpg`,
  `${IMG}/clair-2.jpg`,
  `${IMG}/clair-3.jpg`,
  `${IMG}/clair-4.jpg`,
  `${IMG}/clair-official-people.jpg`,
  `${IMG}/clair-official-peri.jpg`,
] as const;

const COUNTERS = [
  {
    value: '24',
    suffix: '/7',
    label: 'Always reading',
    body: "Continuous reading of your body's key signals — no guessing, no gaps.",
  },
  {
    value: '0',
    label: 'No labs',
    body: 'Pinpricks, blood draws, or urine strips — just wear it like jewellery.',
  },
  {
    value: '4',
    label: 'Key signals',
    body: 'Estrogen, progesterone, LH, and FSH — the shape of your month.',
  },
  {
    value: 'Nov',
    label: '2026 ship',
    body: 'Expected ship date — pre-order through Liivv to stay first in line.',
  },
] as const;

const STEPS = [
  {
    num: '01',
    category: 'Wear',
    title: 'Slip it on',
    body: 'Clair sits on your wrist like a quiet piece of jewellery — light, familiar, ready whenever you are.',
  },
  {
    num: '02',
    category: 'See',
    title: 'Watch your month take shape',
    body: 'Continuous readings paint the quiet weeks and the loud ones — energy dips, cycle shifts, the patterns you used to only feel.',
  },
  {
    num: '03',
    category: 'Understand',
    title: 'Connect the dots',
    body: "When sleep frays or mood swings, Clair helps you see whether your body's signals line up.",
  },
  {
    num: '04',
    category: 'Know',
    title: 'Live with the fuller picture',
    body: "Insights you can glance at anytime — a gentler sense of what's yours this week.",
  },
] as const;

const PILLARS = [
  {
    title: 'Sleep',
    sub: 'Restless nights, explained',
    body: 'See when hormone shifts line up with restless nights — so you understand the pattern, not just the tired morning.',
    image: `${IMG}/clair-official-frame.jpg`,
  },
  {
    title: 'Energy',
    sub: 'The dips and the peaks',
    body: "Energy that comes and goes isn't random when you can see the shape of your month.",
    image: `${IMG}/clair-official-training.jpg`,
  },
  {
    title: 'Skin',
    sub: 'Glow that follows your cycle',
    body: 'Hormonal skin changes often track with the phases Clair watches — so you see the pattern before you guess.',
    image: `${IMG}/clair-official-people.jpg`,
  },
  {
    title: 'Mood',
    sub: 'The weeks that feel louder',
    body: 'Some weeks feel like yours; others ask more of you. Clair gives you the map.',
    image: `${IMG}/clair-official-peri.jpg`,
  },
] as const;

const FAQS = [
  {
    q: 'What is Clair?',
    a: "Clair is a wearable continuous hormone monitor from Clair Health — the first of its kind. It reads your body's key signals (including estrogen, progesterone, LH, and FSH) without blood or urine, so you can see the shape of your cycle in real time. Pre-order it through Liivv.",
  },
  {
    q: 'When does Clair ship?',
    a: "Clair is expected to ship around November 2026. You can pre-order through Liivv now so you're first in line — we'll keep you posted as dates firm up.",
  },
  {
    q: 'How does Clair work?',
    a: "You wear Clair like jewellery. It continuously reads your body's key signals and shows the shape of your month — quiet weeks and loud ones — without pinpricks, blood, or urine strips.",
  },
  {
    q: 'Do I need a lab visit or prescription?',
    a: "No lab appointment is required to wear Clair. Pre-order through Liivv and we'll guide you through what's next as ship dates firm up.",
  },
  {
    q: 'Who is Liivv?',
    a: "Liivv is the Canadian health home where you pre-order Clair. Beyond the wristband, Liivv offers women's wellness, sleep support, skin care, diabetes care, ostomy supplies, wound care, and Ontario pharmacist chat — all with discreet delivery.",
  },
  {
    q: 'How private is my order?',
    a: "Very. Everything arrives in plain, discreet packaging, and your conversations with our team stay between you and us.",
  },
] as const;

function Pic({
  src,
  className = '',
  alt = '',
  priority = false,
}: {
  src: string;
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <div aria-hidden={alt === '' || undefined} className={`clair-pic ${className}`.trim()}>
      <img alt={alt} decoding="async" loading={priority ? 'eager' : 'lazy'} src={src} />
    </div>
  );
}

function River({ images, reverse = false }: { images: readonly string[]; reverse?: boolean }) {
  const loop = [...images, ...images];

  return (
    <div aria-hidden className={`clair-river${reverse ? ' clair-river--reverse' : ''}`}>
      <div className="clair-river-track">
        {loop.map((src, index) => (
          <Pic className="clair-river-frame" key={`${src}-${index}`} src={src} />
        ))}
      </div>
    </div>
  );
}

export function ClairHealthDemoPage() {
  const [scrolled, setScrolled] = useState(false);
  const [featured, ...restPillars] = PILLARS;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div id="clair-demo">
      <a className={`clair-back${scrolled ? ' is-scrolled' : ''}`} href={WOMEN_HREF}>
        ← Women&apos;s Health
      </a>

      <section className="clair-hero">
        <Pic className="clair-hero-bg" priority src={`${IMG}/clair-official-hero.jpg`} />
        <div aria-hidden className="clair-hero-veil" />
        <div className="clair-hero-inner">
          <div className="clair-hero-copy">
            <span className="clair-eyebrow clair-hero-kicker">Clair Health · through Liivv</span>
            <h1>Know your rhythm</h1>
            <p>
              The first wearable that reads your body&apos;s key signals continuously — so you see the shape of
              your month instead of guessing through it.
            </p>
            <div className="clair-cta-row">
              <a className="clair-btn clair-btn-white" href={PREORDER_HREF}>
                Preorder
              </a>
              <a className="clair-btn clair-btn-ghost" href="#how-it-works">
                How Clair works
              </a>
            </div>
          </div>
          <div aria-hidden className="clair-hero-mark">
            <span>Clair</span>
            <span>Nov 2026</span>
          </div>
        </div>
        <a aria-label="Scroll to explore Clair" className="clair-scroll" href="#clair-pulse">
          <span />
        </a>
      </section>

      <section className="clair-pulse clair-rounded" id="clair-pulse">
        <River images={RIVER_TOP} />
        <div className="clair-container clair-pulse-copy">
          <p className="clair-eyebrow">Continuous clarity</p>
          <h2>
            Clair by Clair Health — worn like jewellery,{' '}
            <em>understood through Liivv</em>
          </h2>
        </div>
        <River images={RIVER_BOTTOM} reverse />
      </section>

      <section className="clair-signals">
        <div className="clair-container">
          <header className="clair-section-head">
            <span className="clair-eyebrow">At a glance</span>
            <h2>Signals that change the month</h2>
          </header>
          <div className="clair-signals-grid">
            {COUNTERS.map((item, index) => (
              <article
                className="clair-signal"
                key={item.label}
                style={{ ['--stagger' as string]: `${index * 60}ms` }}
              >
                <div className="clair-signal-value">
                  {item.value}
                  {'suffix' in item ? <sup>{item.suffix}</sup> : null}
                </div>
                <p className="clair-signal-label">{item.label}</p>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="clair-story clair-rounded" id="how-it-works">
        <div className="clair-container clair-story-grid">
          <div className="clair-story-media">
            <Pic alt="Clair Health wristband" src={`${IMG}/clair-official-product.jpg`} />
            <span aria-hidden className="clair-story-glow" />
            <p className="clair-story-caption">Clair Health wristband</p>
          </div>
          <div className="clair-story-copy">
            <span className="clair-eyebrow">Meet Clair</span>
            <h2>
              Your body&apos;s signals, <em>worn like jewellery.</em>
            </h2>
            <p>
              Clair is a wearable continuous hormone monitor from Clair Health — the first of its kind. It reads
              your body&apos;s key signals without blood or urine, so you can see the shape of your cycle in real
              time.
            </p>
            <p>
              No pinpricks. No waiting on a lab. Just a clear, gentle picture of your rhythm, checked like a glance
              at your wrist.
            </p>
            <p className="clair-story-close">
              Pre-order through Liivv — and stay first in line for expected November 2026 shipping.
            </p>
            <div className="clair-cta-row">
              <a className="clair-btn clair-btn-dark" href={PREORDER_HREF}>
                Preorder
              </a>
              <a className="clair-btn clair-btn-outline" href="#faq">
                Good questions
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="clair-journey">
        <div className="clair-container">
          <header className="clair-section-head clair-section-head--left">
            <span className="clair-eyebrow">How it fits your life</span>
            <h2>
              Wear. See. Understand. <em>Know.</em>
            </h2>
            <p className="clair-intro">From first glance to everyday clarity — four quiet steps.</p>
          </header>
          <ol className="clair-journey-rail">
            {STEPS.map((step) => (
              <li className="clair-journey-step" key={step.num}>
                <span aria-hidden className="clair-journey-num">
                  {step.num}
                </span>
                <p className="clair-journey-cat">{step.category}</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="clair-insights clair-rounded">
        <div className="clair-container">
          <header className="clair-section-head">
            <span className="clair-eyebrow">What Clair helps you see</span>
            <h2>Insights that touch real life</h2>
            <p className="clair-intro">
              Clair shows the shape of your month — so the weeks that used to feel random start to make sense.
            </p>
          </header>

          {featured ? (
            <article className="clair-feature">
              <Pic className="clair-feature-media" src={featured.image} />
              <div className="clair-feature-copy">
                <span className="clair-eyebrow">{featured.sub}</span>
                <h3>{featured.title}</h3>
                <p>{featured.body}</p>
              </div>
            </article>
          ) : null}

          <div className="clair-insights-grid">
            {restPillars.map((pillar, index) => (
              <article
                className="clair-insight"
                key={pillar.title}
                style={{ ['--stagger' as string]: `${index * 50}ms` }}
              >
                <Pic src={pillar.image} />
                <div className="clair-insight-body">
                  <p className="clair-insight-sub">{pillar.sub}</p>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="clair-band">
        <div className="clair-container clair-band-inner">
          <span className="clair-eyebrow">Available through Liivv</span>
          <h2>Clair, from a brand that stays with you</h2>
          <p>
            Liivv is where you pre-order Clair — and where comfort, care, and kind answers already live. A calm
            health home for everyday living, not just one product.
          </p>
          <p className="clair-band-also">
            Also on Liivv: women&apos;s wellness · sleep &amp; rest · skin care · diabetes care · ostomy · wound
            care
          </p>
          <div className="clair-cta-row">
            <a className="clair-btn clair-btn-outline" href={WOMEN_HREF}>
              Back to Women&apos;s Health
            </a>
            <a className="clair-btn clair-btn-dark" href={PREORDER_HREF}>
              Preorder
            </a>
          </div>
        </div>
      </section>

      <section className="clair-faq" id="faq">
        <div className="clair-container clair-faq-inner">
          <header className="clair-section-head clair-section-head--left">
            <span className="clair-eyebrow">FAQ</span>
            <h2>Good questions, honest answers</h2>
            <p className="clair-intro">Everything you need to know about Clair — answered like a friend would.</p>
          </header>
          {FAQS.map((faq, index) => (
            <details key={faq.q} open={index === 0}>
              <summary>{faq.q}</summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="clair-closing">
        <Pic className="clair-closing-bg" src={`${IMG}/clair-official-frame-30.jpg`} />
        <div aria-hidden className="clair-closing-veil" />
        <div className="clair-container">
          <span className="clair-eyebrow">Keep going</span>
          <h2>
            Know your rhythm.
            <em>Pre-order Clair.</em>
          </h2>
          <p>Continuous clarity on your wrist — available through Liivv.</p>
          <div className="clair-cta-row">
            <a className="clair-btn clair-btn-white" href={PREORDER_HREF}>
              Preorder
            </a>
            <a className="clair-btn clair-btn-ghost" href={WOMEN_HREF}>
              Women&apos;s Health
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
