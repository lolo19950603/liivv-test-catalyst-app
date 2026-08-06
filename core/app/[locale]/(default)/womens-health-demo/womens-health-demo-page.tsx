'use client';

import { useState, type ReactNode } from 'react';

import './womens-health-demo.css';

const SHOP_HREF = '/liivv-health/womens-health/shop-womens-health';
const PHARMACIST_HREF = '/account/virtual-care';
const IMG = '/archive/womens-health-demo';

function Pic({
  src,
  className = '',
  alt = '',
}: {
  src: string;
  className?: string;
  alt?: string;
}) {
  return (
    <div aria-hidden={alt === '' || undefined} className={`wh-pic ${className}`.trim()}>
      {/* Local assets under /public — avoids Unsplash / archive .media conflicts */}
      <img alt={alt} src={src} />
    </div>
  );
}

const TIMELINE = [
  {
    category: 'Know your rhythm',
    heading: 'Start with you',
    paragraphs: [
      'Tell us a little about your everyday — what feels good, what feels off, what you’d love more of.',
      'That’s all we need to start shaping care around your life, not the other way around.',
    ],
    cta: 'Get Started',
    href: SHOP_HREF,
    image: `${IMG}/timeline-1.jpg`,
    peek: `${IMG}/timeline-1b.jpg`,
  },
  {
    category: 'Stock your calm',
    heading: 'Essentials on repeat',
    paragraphs: [
      'Your comfort staples, chosen once and delivered before you run out.',
      'The little things stay on the shelf — so your energy stays on your week.',
    ],
    cta: 'Get Started',
    href: SHOP_HREF,
    image: `${IMG}/timeline-2.jpg`,
    peek: `${IMG}/timeline-2b.jpg`,
  },
  {
    category: 'Ask without the awkward',
    heading: 'Chat when you need it',
    paragraphs: [
      'Some questions are easier typed than said out loud.',
      'Talk with a friendly pharmacist from wherever you’re comfiest — no waiting room, no judgment.',
    ],
    cta: 'Talk to a Pharmacist',
    href: PHARMACIST_HREF,
    image: `${IMG}/timeline-3.jpg`,
    peek: `${IMG}/timeline-3b.jpg`,
  },
  {
    category: 'Shop what fits',
    heading: 'Your marketplace',
    paragraphs: [
      'A marketplace curated for real routines — comfort, care, and glow.',
      'Minus the overwhelm of a thousand tabs and the whisper aisle.',
    ],
    cta: 'Explore the Shop',
    href: SHOP_HREF,
    image: `${IMG}/timeline-4.jpg`,
    peek: `${IMG}/timeline-4b.jpg`,
  },
  {
    category: 'Liivv well',
    heading: 'Living, not managing',
    paragraphs: [
      'Routines that quietly hold you in the background.',
      'So your energy goes where it belongs: the life you’re actually living.',
    ],
    cta: 'Liivv Well',
    href: SHOP_HREF,
    image: `${IMG}/timeline-5.jpg`,
    peek: `${IMG}/timeline-5b.jpg`,
  },
] as const;

const CHAPTERS = [
  {
    eyebrow: 'Chapter one',
    num: '01',
    title: 'Foundation & First Cycles',
    focus:
      'First period nerves, irregular cycles, hormonal skin, discretion at school, and the vitamins that build a strong start.',
    vibe: 'Supportive, demystifying, and parent-friendly — without talking down to the teen.',
    image: `${IMG}/chapter-1.jpg`,
  },
  {
    eyebrow: 'Chapter two',
    num: '02',
    title: 'Rhythm & Balance',
    focus:
      'Busy schedules, hormonal breakouts, gut + vaginal health, sleep + stress, and birth control side effects or options.',
    vibe: 'Modern, aesthetic, and highly functional. Wellness that works IRL.',
    image: `${IMG}/chapter-2.jpg`,
  },
  {
    eyebrow: 'Chapter three',
    num: '03',
    title: 'Reset & Recharge',
    focus:
      'Hormonal imbalance, weight fluctuations, skin aging, stress, and burnout — met with care, not judgment.',
    vibe: 'Aspirational but accessible. Acknowledging burnout without making it a medical deficiency.',
    image: `${IMG}/chapter-3.jpg`,
  },
  {
    eyebrow: 'Chapter four',
    num: '04',
    title: 'Grow & Recover',
    focus:
      'Fertility challenges, physical discomfort, recovery after birth, and breastfeeding stress — with room to breathe.',
    vibe: 'Empowering, deeply supportive, and strictly no shame.',
    image: `${IMG}/chapter-4.jpg`,
  },
  {
    eyebrow: 'Chapter five',
    num: '05',
    title: 'Transition & Relief',
    focus:
      'Sleep disruption, bone density, low metabolism, night sweats, and mood swings — comfort you can feel.',
    vibe: 'Reclaiming comfort. Sleek, discreet, and highly effective.',
    image: `${IMG}/chapter-5.jpg`,
  },
  {
    eyebrow: 'Chapter six',
    num: '06',
    title: 'Longevity & Vitality',
    focus:
      'Joint comfort, cognitive health, mobility, and energy — so the years ahead stay full of your favourite things.',
    vibe: 'Active, capable, and vibrant. Removing the stigma of aging aids.',
    image: `${IMG}/chapter-6.jpg`,
  },
] as const;

const COUNTERS = [
  {
    num: '10k',
    suffix: '+',
    text: 'women in the Liivv community, and growing every day',
    image: `${IMG}/counter-1.jpg`,
  },
  {
    num: '24',
    suffix: '/7',
    text: 'Olivia for shopping and account help — anytime',
    image: `${IMG}/counter-2.jpg`,
  },
  {
    num: '19',
    suffix: '+',
    text: 'everyday concerns our Ontario pharmacists can help with in chat',
    image: `${IMG}/counter-3.jpg`,
  },
  {
    num: '1',
    suffix: '',
    text: 'place for your wellness — your way, your pace',
    image: `${IMG}/counter-4.jpg`,
  },
] as const;

const PILLARS = [
  {
    title: 'Daily Comfort',
    sub: 'For the every-month and the every-day',
    body: 'Cycle care and comfort essentials that show up on time, so that week is just another week.',
    image: `${IMG}/pillar-1.jpg`,
  },
  {
    title: 'Body Confidence',
    sub: 'Personal care, zero whisper aisle',
    body: 'Intimate and personal care picked with honesty — delivered discreetly, discussed openly whenever you want.',
    image: `${IMG}/pillar-2.jpg`,
  },
  {
    title: 'Nourish & Glow',
    sub: 'From the inside out',
    body: 'Daily nutrition and skin-loving staples that keep pace with busy weeks and full plates.',
    image: `${IMG}/pillar-3.jpg`,
  },
  {
    title: 'Rest that Restores',
    sub: 'Because tomorrow needs you',
    body: 'Wind-down rituals and sleep support for nights that actually recharge you.',
    image: `${IMG}/pillar-4.jpg`,
  },
] as const;

const VOICES = [
  {
    quote:
      'I finally asked a pharmacist a question I’d been too shy to ask anyone for a year. Got a kind, straight answer on my lunch break — no waiting room, no judgment.',
    name: 'Priya',
    meta: 'Toronto · juggling two kids and a startup',
    monogram: 'P',
    tone: 'blush',
  },
  {
    quote:
      'My monthly box shows up like clockwork. I genuinely forgot what running-out-of-everything panic feels like.',
    name: 'Dana',
    meta: 'Ottawa · marathon-in-training',
    monogram: 'D',
    tone: 'sage',
  },
  {
    quote:
      'I used to keep three apps and a drawer of half-finished bottles. Now my essentials arrive before I run out — and Sundays feel like mine again.',
    name: 'Maya',
    meta: '34 · Liivv member since 2024',
    monogram: 'M',
    tone: 'sand',
  },
  {
    quote:
      'The sleep support and skin staples in one place changed my month. I stopped bouncing between three different shops.',
    name: 'Sofia',
    meta: 'Mississauga · Liivv Women regular',
    monogram: 'S',
    tone: 'taupe',
  },
] as const;

const MARQUEE_IMGS = [
  `${IMG}/marquee-1.jpg`,
  `${IMG}/marquee-2.jpg`,
  `${IMG}/marquee-3.jpg`,
  `${IMG}/marquee-4.jpg`,
  `${IMG}/marquee-5.jpg`,
  `${IMG}/pillar-1.jpg`,
  `${IMG}/pillar-2.jpg`,
  `${IMG}/mosaic-1.jpg`,
  `${IMG}/mosaic-3.jpg`,
  `${IMG}/mosaic-5.jpg`,
];

const MARQUEE_LABELS = [
  'Everyday Rhythm',
  'Glow & Nourish',
  'Cycle Comfort',
  'Finding Balance',
  'Aging Softly',
  'Personal Care',
  'Rest & Restore',
  'Skin & Glow',
  'Body Kindness',
  'Quiet Strength',
];

export function WomensHealthDemoPage() {
  const [timelineIndex, setTimelineIndex] = useState(0);
  const slide = TIMELINE[timelineIndex] ?? TIMELINE[0];

  return (
    <div id="wh-demo">
      <section className="hero" aria-label="Women's Health hero">
        <div className="hero-inner">
          <span className="hero-kicker">Liivv Women · Health, your way</span>
          <h1>You, in every season</h1>
          <p>
            No quick fixes — just real care that moves with your life. From everyday rhythm to whole new
            chapters, wellness that works IRL, at your pace.
          </p>
          <div className="hero-cta">
            <a className="btn btn-dark" href={SHOP_HREF}>
              Shop the edit
            </a>
            <a className="btn btn-outline" href="#find-your-chapter">
              Find your chapter
            </a>
          </div>
        </div>
        <div aria-hidden className="hero-stack">
          <div className="hero-stack-main">
            <img alt="" src={`${IMG}/hero.jpg`} />
          </div>
          <div className="hero-chip">
            <span>Liivv vibe</span>
            Wellness that works IRL
          </div>
          <div className="hero-frame hero-frame--a">
            <img alt="" src={`${IMG}/hero-a.jpg`} />
          </div>
          <div className="hero-frame hero-frame--b">
            <img alt="" src={`${IMG}/hero-b.jpg`} />
          </div>
        </div>
      </section>

      <div aria-hidden className="photo-river">
        <div className="photo-river-track">
          {[0, 1].flatMap((copy) =>
            [1, 2, 3, 4, 5].map((n) => (
              <Pic key={`${copy}-${n}`} src={`${IMG}/river-${n}.jpg`} />
            )),
          )}
        </div>
      </div>

      <section className="highlight-text rounded-top">
        <h2>
          Liivv <span className="swash">Women</span> is your{' '}
          <span className="swash sage">everyday rhythm</span> for living well
        </h2>
        <div aria-hidden className="mosaic">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Pic className={`m${n}`} key={n} src={`${IMG}/mosaic-${n}.jpg`} />
          ))}
        </div>
      </section>

      <section className="counters">
        <div className="container counters-grid">
          {COUNTERS.map((c) => (
            <div className="counter-card" key={c.text}>
              <Pic src={c.image} />
              <div className="num">
                {c.num}
                {c.suffix ? <sup>{c.suffix}</sup> : null}
              </div>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-hidden className="img-marquee">
        <div className="img-marquee-track">
          {[0, 1].flatMap((copy) =>
            MARQUEE_IMGS.flatMap((src, i) => {
              const nodes: ReactNode[] = [
                <Pic key={`${copy}-img-${src}`} src={src} />,
                <span className="chip" key={`${copy}-chip-${MARQUEE_LABELS[i]}`}>
                  {MARQUEE_LABELS[i]}
                </span>,
              ];

              return nodes;
            }),
          )}
        </div>
      </section>

      <section className="timeline rounded-top">
        <div className="container">
          <div className="timeline-header">
            <p className="small-heading">
              No two of us live the same week. Liivv fits itself around yours — your health, your pace.
            </p>
            <h2>
              Your journey, <span className="swash">your pace</span>
            </h2>
          </div>

          <div className="timeline-nav">
            <button
              aria-label="Previous journey step"
              onClick={() => setTimelineIndex((i) => (i === 0 ? TIMELINE.length - 1 : i - 1))}
              type="button"
            >
              ‹
            </button>
            <button
              aria-label="Next journey step"
              onClick={() => setTimelineIndex((i) => (i === TIMELINE.length - 1 ? 0 : i + 1))}
              type="button"
            >
              ›
            </button>
          </div>

          <div className="timeline-slide">
            <div className="copy">
              <p className="category">{slide.category}</p>
              <h3>{slide.heading}</h3>
              {slide.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <a className="btn btn-dark" href={slide.href}>
                {slide.cta}
              </a>
            </div>
            <div className="timeline-visual">
              <Pic className="wh-pic-main" src={slide.image} />
              <Pic className="wh-pic-peek" src={slide.peek} />
            </div>
          </div>

          <div aria-label="Timeline steps" className="timeline-dots" role="tablist">
            {TIMELINE.map((step, i) => (
              <button
                aria-selected={i === timelineIndex}
                className={i === timelineIndex ? 'active' : undefined}
                key={step.category}
                onClick={() => setTimelineIndex(i)}
                role="tab"
                type="button"
              >
                {step.category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pillars rounded-top">
        <div className="container">
          <span className="eyebrow">The Liivv Women edit</span>
          <h2>Four ways to feel like yourself</h2>
          <p className="intro">
            Health, simplified — everything here earns its place by making an ordinary day a little softer.
          </p>
          <div className="pillars-grid">
            {PILLARS.map((pillar) => (
              <div className="pillar" key={pillar.title}>
                <Pic src={pillar.image} />
                <h3>{pillar.title}</h3>
                <div className="sub">{pillar.sub}</div>
                <p>{pillar.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="images-text rounded-top">
        <div className="container images-text-grid">
          <div className="visuals">
            <Pic className="big" src={`${IMG}/care-1.jpg`} />
            <Pic className="mid" src={`${IMG}/care-2.jpg`} />
            <Pic className="small" src={`${IMG}/care-3.jpg`} />
          </div>
          <div>
            <span className="eyebrow">Available in Ontario</span>
            <h2>Relief that doesn&apos;t wait on a waiting room</h2>
            <p>
              Some days your body just asks for a little backup — and you shouldn&apos;t need to rearrange
              your whole week to get it. Clear answers, no med-speak, no judgment.
            </p>
            <p>
              Our friendly Ontario pharmacists can chat through everyday concerns — from monthly cramps to
              skin flare-ups — during business hours (until 5 p.m. Eastern). No appointment, no waiting room
              playlist.
            </p>
            <p>
              Real expertise, delivered like a conversation with someone who gets it. Outside those hours,
              Olivia can help with shopping and your account — she does not give medical advice.
            </p>
            <a className="btn btn-white" href={PHARMACIST_HREF}>
              Talk to a Pharmacist
            </a>
          </div>
        </div>
      </section>

      <section className="images-text tips-pair rounded-top">
        <div className="container images-text-grid">
          <div className="visuals">
            <Pic className="big" src={`${IMG}/tips-1.jpg`} />
            <Pic className="mid" src={`${IMG}/tips-2.jpg`} />
            <Pic className="small" src={`${IMG}/tips-3.jpg`} />
          </div>
          <div className="copy">
            <span className="eyebrow">A little wisdom for the week</span>
            <h2>Tips that meet you where you are</h2>
            <p>
              Women&apos;s health isn&apos;t one routine — it&apos;s small habits that soften the loud weeks
              and stretch the quiet ones. No shame. Just health.
            </p>
            <p>
              Track how you feel across your month. Stock comfort essentials before you need them. Prioritize
              sleep the same week your energy dips. And when something feels off, chat with an Ontario
              pharmacist during business hours — until 5 p.m. Eastern.
            </p>
            <p>Small adjustments, real rhythm. Wellness that works IRL.</p>
            <a className="btn btn-dark" href={SHOP_HREF}>
              Explore Women&apos;s Essentials
            </a>
          </div>
        </div>
      </section>

      <section className="story rounded-top" id="clair">
        <div className="container">
          <div className="banner">
            <h2>Also in the edit: Clair</h2>
            <div aria-hidden className="clair-collage">
              <Pic className="c1" src={`${IMG}/clair-1.jpg`} />
              <Pic className="c2" src={`${IMG}/clair-2.jpg`} />
              <Pic className="c3" src={`${IMG}/clair-3.jpg`} />
              <Pic className="c4" src={`${IMG}/clair-4.jpg`} />
            </div>
          </div>
          <div className="story-grid">
            <h2>
              Continuous clarity, <span className="accent">when you want it.</span>
            </h2>
            <div>
              <p>
                Clair is a wearable from Clair Health that reads your body&apos;s key signals continuously —
                so you can see the shape of your month instead of guessing through it.
              </p>
              <p>
                It&apos;s one part of the Liivv Women lineup, right beside comfort essentials, personal care,
                nutrition, and sleep support. Same calm place. Same discreet delivery.
              </p>
              <p className="strong-close">
                Curious how it works, when it ships, or how to pre-order? A dedicated Clair page is next in
                this demo set — for now, explore the Women&apos;s edit.
              </p>
              <div className="story-cta">
                <a className="btn btn-dark" href={SHOP_HREF}>
                  Shop Women&apos;s Essentials
                </a>
                <a className="btn btn-outline" href="#find-your-chapter">
                  Find your chapter
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Find your chapter" className="chapters" id="find-your-chapter">
        {CHAPTERS.map((chapter) => (
          <div className="chapter" key={chapter.title}>
            <Pic src={chapter.image} />
            <div className="copy">
              <span aria-hidden className="chapter-num">
                {chapter.num}
              </span>
              <span className="eyebrow">{chapter.eyebrow}</span>
              <h3>{chapter.title}</h3>
              <div className="chapter-meta">
                <div>
                  <span className="chapter-pill">The Focus</span>
                  <p>{chapter.focus}</p>
                </div>
                <div>
                  <span className="chapter-pill chapter-pill--vibe">The Liivv Vibe</span>
                  <p>{chapter.vibe}</p>
                </div>
              </div>
              <a className="btn btn-dark" href="#find-your-chapter">
                Learn more
              </a>
            </div>
          </div>
        ))}
      </section>

      <section className="voices rounded-top">
        <div className="container">
          <h2>
            Real talk <em>from the community</em>
          </h2>
          <div className="voice-cards">
            {VOICES.map((v) => (
              <div className="voice" key={v.name}>
                <div aria-hidden className={`voice-mark voice-mark--${v.tone}`}>
                  <span>{v.monogram}</span>
                </div>
                <div className="body">
                  <blockquote>&ldquo;{v.quote}&rdquo;</blockquote>
                  <div className="who">
                    {v.name}
                    <span>{v.meta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="faq rounded-top">
        <div className="faq-layout">
          <div aria-hidden className="faq-art">
            <Pic src={`${IMG}/faq-1.jpg`} />
            <Pic src={`${IMG}/faq-2.jpg`} />
          </div>
          <div>
            <h2>Good questions, honest answers</h2>
            <p className="intro">
              The things people actually ask us — answered like a friend would, not a form letter.
            </p>

            <details open>
              <summary>Is this only for one age or stage of life?</summary>
              <p>
                Not at all. Liivv Women is built around life chapters — Foundation &amp; First Cycles, Rhythm
                &amp; Balance, Reset &amp; Recharge, Grow &amp; Recover, Transition &amp; Relief, and Longevity
                &amp; Vitality. Chapters follow where you are, not a number. You pick what fits; we follow your
                lead.
              </p>
            </details>
            <details>
              <summary>What is Clair?</summary>
              <p>
                Clair is a wearable continuous hormone monitor from Clair Health, available through Liivv as
                part of the Women lineup. For how it works, shipping, and pre-order details, see the Clair
                feature above — a dedicated Clair page is next in this demo set.
              </p>
            </details>
            <details>
              <summary>What kinds of products does Liivv Women include?</summary>
              <p>
                Cycle comfort, personal care, nutrition and glow, sleep support, CarePack for daily essentials
                — plus pharmacist chat in Ontario. Clair sits in the lineup as an optional wearable if you
                want continuous clarity on your rhythm.
              </p>
            </details>
            <details>
              <summary>How private is my order?</summary>
              <p>
                Very. Everything arrives in plain, discreet packaging, and your conversations with our team
                stay between you and us. What you order is nobody&apos;s business but yours.
              </p>
            </details>
            <details>
              <summary>What can I actually chat with a pharmacist about?</summary>
              <p>
                Everyday stuff — monthly comfort, skin flare-ups, sleep that won&apos;t come, &ldquo;is this
                normal?&rdquo; moments. In Ontario, our pharmacists can assess and help with 19+ everyday
                concerns in chat during business hours (until 5 p.m. Eastern). Olivia is available anytime for
                orders, products, and account help — she does not give medical advice.
              </p>
            </details>
            <details>
              <summary>What&apos;s a CarePack?</summary>
              <p>
                Your daily essentials, organized by day and dose into one tidy pack — so mornings start with
                one small rip instead of a shelf of bottles. Set it once and it keeps arriving.
              </p>
            </details>
            <details>
              <summary>Can I change or pause my routine anytime?</summary>
              <p>
                Always. Life shifts, and your Liivv should shift with it. Swap products, skip a month, or pause
                entirely — no phone calls, no guilt trips.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="closing rounded-top">
        <div className="closing-bg">
          <img alt="" src={`${IMG}/closing.jpg`} />
        </div>
        <div className="container">
          <div aria-hidden className="closing-thumbs">
            <Pic src={`${IMG}/pillar-1.jpg`} />
            <Pic src={`${IMG}/mosaic-5.jpg`} />
            <Pic src={`${IMG}/marquee-4.jpg`} />
          </div>
          <h2>
            Your next chapter <span>starts soft</span>
          </h2>
          <p>
            No shame. No hype. Just you — at your best. Whatever season you&apos;re in, there&apos;s a
            version of well that feels like yours.
          </p>
          <a className="btn btn-white" href={SHOP_HREF}>
            Shop Women&apos;s Wellness
          </a>
        </div>
      </section>
    </div>
  );
}
