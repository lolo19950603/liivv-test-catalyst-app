'use client';

import { useState } from 'react';

import './womens-health-demo.css';

const SHOP_HREF = '/liivv-health/womens-health/shop-womens-health';
const PHARMACIST_HREF = '/account/virtual-care';

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

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
    image: u('photo-1492725764893-90b379c2b6e1'),
    peek: u('photo-1516589178581-6cd7833ae3b2', 800),
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
    image: u('photo-1556228578-0d85b1a4d571'),
    peek: u('photo-1571781926291-c77df8097c0a', 800),
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
    image: u('photo-1576091160399-112ba8d25d1d'),
    peek: u('photo-1512941937669-90a1b58e7e9c', 800),
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
    image: u('photo-1487412720507-e7ab37603c6f'),
    peek: u('photo-1596462502278-27bfdc403348', 800),
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
    image: u('photo-1518611012118-696072aa579a'),
    peek: u('photo-1506126613408-eca07ce68773', 800),
  },
] as const;

const CHAPTERS = [
  {
    eyebrow: 'Chapter one',
    title: 'Foundation & First Cycles',
    focus:
      'First period nerves, irregular cycles, hormonal skin, discretion at school, and the vitamins that build a strong start.',
    vibe: 'Supportive, demystifying, and parent-friendly — without talking down to the teen.',
    image: u('photo-1529626455594-4ff0802cfb7e', 1400),
  },
  {
    eyebrow: 'Chapter two',
    title: 'Rhythm & Balance',
    focus:
      'Busy schedules, hormonal breakouts, gut + vaginal health, sleep + stress, and birth control side effects or options.',
    vibe: 'Modern, aesthetic, and highly functional. Wellness that works IRL.',
    image: u('photo-1487412912498-0447578c4214', 1400),
  },
  {
    eyebrow: 'Chapter three',
    title: 'Reset & Recharge',
    focus:
      'Hormonal imbalance, weight fluctuations, skin aging, stress, and burnout — met with care, not judgment.',
    vibe: 'Aspirational but accessible. Acknowledging burnout without making it a medical deficiency.',
    image: u('photo-1545205597-3d9d02c29597', 1400),
  },
  {
    eyebrow: 'Chapter four',
    title: 'Grow & Recover',
    focus:
      'Fertility challenges, physical discomfort, recovery after birth, and breastfeeding stress — with room to breathe.',
    vibe: 'Empowering, deeply supportive, and strictly no shame.',
    image: u('photo-1515488042361-ee00e0ddd4e4', 1400),
  },
  {
    eyebrow: 'Chapter five',
    title: 'Transition & Relief',
    focus:
      'Sleep disruption, bone density, low metabolism, night sweats, and mood swings — comfort you can feel.',
    vibe: 'Reclaiming comfort. Sleek, discreet, and highly effective.',
    image: u('photo-1506126613408-eca07ce68773', 1400),
  },
  {
    eyebrow: 'Chapter six',
    title: 'Longevity & Vitality',
    focus:
      'Joint comfort, cognitive health, mobility, and energy — so the years ahead stay full of your favourite things.',
    vibe: 'Active, capable, and vibrant. Removing the stigma of aging aids.',
    image: u('photo-1469474968028-56623f02e42e', 1400),
  },
] as const;

const RIVER = [
  u('photo-1494790108377-be9c29b29330', 800),
  u('photo-1515886657613-9f3515b0c78f', 800),
  u('photo-1534528741775-53994a69daeb', 800),
  u('photo-1524504388940-b1c1722653e1', 800),
  u('photo-1544005313-94ddf0286df2', 800),
];

const MOSAIC = [
  u('photo-1515886657613-9f3515b0c78f', 900),
  u('photo-1484101403537-ffe3e70ffa29', 800),
  u('photo-1514228742587-6b1558fcca3d', 800),
  u('photo-1476480862126-209bfaa8edc8', 700),
  u('photo-1506126613408-eca07ce68773', 900),
  u('photo-1438761681033-6461ffad8d80', 700),
];

const MARQUEE_IMGS = [
  u('photo-1596462502278-27bfdc403348', 600),
  u('photo-1571781926291-c77df8097c0a', 600),
  u('photo-1556228720-195a672e8a03', 600),
  u('photo-1608571423902-eed4a5ad8108', 600),
  u('photo-1611930022073-b7a4ba5fcccd', 600),
  u('photo-1580870069867-74c57ee1bb07', 600),
  u('photo-1515377905703-c4788e51af15', 600),
  u('photo-1487412720507-e7ab37603c6f', 600),
  u('photo-1492725764893-90b379c2b6e1', 600),
  u('photo-1518611012118-696072aa579a', 600),
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

const COUNTERS = [
  {
    num: '10k',
    suffix: '+',
    text: 'women in the Liivv community, and growing every day',
    image: u('photo-1529626455594-4ff0802cfb7e', 800),
  },
  {
    num: '24',
    suffix: '/7',
    text: 'Olivia for shopping and account help — anytime',
    image: u('photo-1512941937669-90a1b58e7e9c', 800),
  },
  {
    num: '19',
    suffix: '+',
    text: 'everyday concerns our Ontario pharmacists can help with in chat',
    image: u('photo-1576091160550-2173dba999ef', 800),
  },
  {
    num: '1',
    suffix: '',
    text: 'place for your wellness — your way, your pace',
    image: u('photo-1515377905703-c4788e51af15', 800),
  },
] as const;

const PILLARS = [
  {
    title: 'Daily Comfort',
    sub: 'For the every-month and the every-day',
    body: 'Cycle care and comfort essentials that show up on time, so that week is just another week.',
    image: u('photo-1514228742587-6b1558fcca3d', 900),
  },
  {
    title: 'Body Confidence',
    sub: 'Personal care, zero whisper aisle',
    body: 'Intimate and personal care picked with honesty — delivered discreetly, discussed openly whenever you want.',
    image: u('photo-1487412720507-e7ab37603c6f', 900),
  },
  {
    title: 'Nourish & Glow',
    sub: 'From the inside out',
    body: 'Daily nutrition and skin-loving staples that keep pace with busy weeks and full plates.',
    image: u('photo-1490645935967-10de6ba17061', 900),
  },
  {
    title: 'Rest that Restores',
    sub: 'Because tomorrow needs you',
    body: 'Wind-down rituals and sleep support for nights that actually recharge you.',
    image: u('photo-1506126613408-eca07ce68773', 900),
  },
] as const;

const VOICES = [
  {
    quote:
      'I finally asked a pharmacist a question I’d been too shy to ask anyone for a year. Got a kind, straight answer on my lunch break — no waiting room, no judgment.',
    name: 'Priya',
    meta: 'Toronto · juggling two kids and a startup',
    image: u('photo-1494790108377-be9c29b29330', 700),
  },
  {
    quote:
      'My monthly box shows up like clockwork. I genuinely forgot what running-out-of-everything panic feels like.',
    name: 'Dana',
    meta: 'Ottawa · marathon-in-training',
    image: u('photo-1438761681033-6461ffad8d80', 700),
  },
  {
    quote:
      'I used to keep three apps and a drawer of half-finished bottles. Now my essentials arrive before I run out — and Sundays feel like mine again.',
    name: 'Maya',
    meta: '34 · Liivv member since 2024',
    image: u('photo-1534528741775-53994a69daeb', 700),
  },
  {
    quote:
      'The sleep support and skin staples in one place changed my month. I stopped bouncing between three different shops.',
    name: 'Sofia',
    meta: 'Mississauga · Liivv Women regular',
    image: u('photo-1544005313-94ddf0286df2', 700),
  },
] as const;

export function WomensHealthDemoPage() {
  const [timelineIndex, setTimelineIndex] = useState(0);
  const slide = TIMELINE[timelineIndex] ?? TIMELINE[0];

  const goPrev = () => {
    setTimelineIndex((i) => (i === 0 ? TIMELINE.length - 1 : i - 1));
  };

  const goNext = () => {
    setTimelineIndex((i) => (i === TIMELINE.length - 1 ? 0 : i + 1));
  };

  return (
    <div id="wh-demo">
      <section className="hero" aria-label="Women's Health hero">
        <div className="hero-inner">
          <span className="hero-kicker">Liivv Women</span>
          <h1>You, in every season</h1>
          <p>
            Care that moves with your life — never against it. From your everyday rhythm to whole new
            chapters, Liivv is right beside you.
          </p>
          <div className="hero-cta">
            <a className="btn btn-white" href={SHOP_HREF}>
              Shop the edit
            </a>
            <a className="btn btn-outline" href="#find-your-chapter" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.7)' }}>
              Find your chapter
            </a>
          </div>
        </div>
        <div aria-hidden className="hero-stack">
          <div
            className="hero-frame hero-frame--a"
            style={{ backgroundImage: `url('${u('photo-1515886657613-9f3515b0c78f', 900)}')` }}
          />
          <div
            className="hero-frame hero-frame--b"
            style={{ backgroundImage: `url('${u('photo-1529626455594-4ff0802cfb7e', 700)}')` }}
          />
          <div
            className="hero-frame hero-frame--c"
            style={{ backgroundImage: `url('${u('photo-1494790108377-be9c29b29330', 500)}')` }}
          />
        </div>
      </section>

      <div aria-hidden className="photo-river">
        {RIVER.map((src) => (
          <div className="media" key={src} style={{ backgroundImage: `url('${src}')` }} />
        ))}
      </div>

      <section className="highlight-text rounded-top">
        <h2>
          Liivv <span className="swash">Women</span> is your{' '}
          <span className="swash sage">everyday rhythm</span> for living well
        </h2>
        <div aria-hidden className="mosaic">
          {MOSAIC.map((src, i) => (
            <div className={`media m${i + 1}`} key={src} style={{ backgroundImage: `url('${src}')` }} />
          ))}
        </div>
      </section>

      <section className="counters">
        <div className="container counters-grid">
          {COUNTERS.map((c) => (
            <div className="counter-card" key={c.text}>
              <div aria-hidden className="media" style={{ backgroundImage: `url('${c.image}')` }} />
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
            MARQUEE_IMGS.flatMap((src, i) => [
              <div className="media" key={`${copy}-img-${src}`} style={{ backgroundImage: `url('${src}')` }} />,
              <span className="chip" key={`${copy}-chip-${MARQUEE_LABELS[i]}`}>
                {MARQUEE_LABELS[i]}
              </span>,
            ]),
          )}
        </div>
      </section>

      <section className="timeline rounded-top">
        <div className="container">
          <div className="timeline-header">
            <p className="small-heading">
              No two of us live the same week. Here&apos;s how Liivv fits itself around yours — not the
              other way around.
            </p>
            <h2>
              Your journey, <span className="swash">your pace</span>
            </h2>
          </div>

          <div className="timeline-nav">
            <button aria-label="Previous journey step" onClick={goPrev} type="button">
              ‹
            </button>
            <button aria-label="Next journey step" onClick={goNext} type="button">
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
              <div
                aria-hidden
                className="media media-main"
                style={{ backgroundImage: `url('${slide.image}')` }}
              />
              <div
                aria-hidden
                className="media media-peek"
                style={{ backgroundImage: `url('${slide.peek}')` }}
              />
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
            Everything here earns its place the same way — it makes an ordinary day a little softer.
          </p>
          <div className="pillars-grid">
            {PILLARS.map((pillar) => (
              <div className="pillar" key={pillar.title}>
                <div aria-hidden className="media" style={{ backgroundImage: `url('${pillar.image}')` }} />
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
            <div
              aria-hidden
              className="media big"
              style={{ backgroundImage: `url('${u('photo-1576091160550-2173dba999ef', 1100)}')` }}
            />
            <div
              aria-hidden
              className="media mid"
              style={{ backgroundImage: `url('${u('photo-1516589178581-6cd7833ae3b2', 800)}')` }}
            />
            <div
              aria-hidden
              className="media small"
              style={{ backgroundImage: `url('${u('photo-1512941937669-90a1b58e7e9c', 700)}')` }}
            />
          </div>
          <div>
            <span className="eyebrow">Available in Ontario</span>
            <h2>Relief that doesn&apos;t wait on a waiting room</h2>
            <p>
              Some days your body just asks for a little backup — and you shouldn&apos;t need to rearrange
              your whole week to get it.
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
            <div
              aria-hidden
              className="media big"
              style={{ backgroundImage: `url('${u('photo-1484101403537-ffe3e70ffa29', 1100)}')` }}
            />
            <div
              aria-hidden
              className="media mid"
              style={{ backgroundImage: `url('${u('photo-1515377905703-c4788e51af15', 800)}')` }}
            />
            <div
              aria-hidden
              className="media small"
              style={{ backgroundImage: `url('${u('photo-1492725764893-90b379c2b6e1', 700)}')` }}
            />
          </div>
          <div className="copy">
            <span className="eyebrow">A little wisdom for the week</span>
            <h2>Tips that meet you where you are</h2>
            <p>
              Women&apos;s health isn&apos;t one routine — it&apos;s small habits that soften the loud weeks
              and stretch the quiet ones.
            </p>
            <p>
              Track how you feel across your month. Stock comfort essentials before you need them. Prioritize
              sleep the same week your energy dips. And when something feels off, chat with an Ontario
              pharmacist during business hours — until 5 p.m. Eastern.
            </p>
            <p>Small adjustments, real rhythm. That&apos;s the Liivv Women way.</p>
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
              <div
                className="media c1"
                style={{ backgroundImage: `url('${u('photo-1611652022419-a9419f74343d', 1200)}')` }}
              />
              <div
                className="media c2"
                style={{ backgroundImage: `url('${u('photo-1515886657613-9f3515b0c78f', 800)}')` }}
              />
              <div
                className="media c3"
                style={{ backgroundImage: `url('${u('photo-1524504388940-b1c1722653e1', 800)}')` }}
              />
              <div
                className="media c4"
                style={{ backgroundImage: `url('${u('photo-1494790108377-be9c29b29330', 600)}')` }}
              />
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
            <div aria-hidden className="media" style={{ backgroundImage: `url('${chapter.image}')` }} />
            <div className="copy">
              <span className="eyebrow">{chapter.eyebrow}</span>
              <h3>{chapter.title}</h3>
              <p className="focus-label">The Focus</p>
              <p>{chapter.focus}</p>
              <p className="vibe-label">The Liivv Vibe</p>
              <p>{chapter.vibe}</p>
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
            What women <em>are saying</em>
          </h2>
          <div className="voice-cards">
            {VOICES.map((v) => (
              <div className="voice" key={v.name}>
                <div
                  aria-hidden
                  className="media portrait"
                  style={{ backgroundImage: `url('${v.image}')` }}
                />
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
            <div
              className="media"
              style={{ backgroundImage: `url('${u('photo-1515886657613-9f3515b0c78f', 900)}')` }}
            />
            <div
              className="media"
              style={{ backgroundImage: `url('${u('photo-1487412912498-0447578c4214', 900)}')` }}
            />
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
        <div className="container">
          <div aria-hidden className="closing-thumbs">
            <div
              className="media"
              style={{ backgroundImage: `url('${u('photo-1494790108377-be9c29b29330', 300)}')` }}
            />
            <div
              className="media"
              style={{ backgroundImage: `url('${u('photo-1534528741775-53994a69daeb', 300)}')` }}
            />
            <div
              className="media"
              style={{ backgroundImage: `url('${u('photo-1544005313-94ddf0286df2', 300)}')` }}
            />
          </div>
          <h2>
            Your next chapter <span>starts soft</span>
          </h2>
          <p>
            Whatever season you&apos;re in, there&apos;s a version of well that feels like you. Let&apos;s find
            it together.
          </p>
          <a className="btn btn-white" href={SHOP_HREF}>
            Shop Women&apos;s Wellness
          </a>
        </div>
      </section>
    </div>
  );
}
