import './clair-health-demo.css';

const IMG = '/archive/womens-health-demo';
const WOMEN_HREF = '/liivv-health/womens-health-demo';
const PREORDER_HREF = '/clair-health-wristband/';

const COUNTERS = [
  {
    value: '24',
    suffix: '/7',
    body: "continuous reading of your body's key signals — no guessing, no gaps",
  },
  {
    value: '0',
    body: 'pinpricks, blood draws, or urine strips — just wear it like jewellery',
  },
  {
    value: '4',
    body: 'key signals including estrogen, progesterone, LH, and FSH',
  },
  {
    value: 'Nov',
    body: '2026 expected ship date — pre-order through Liivv to stay first in line',
  },
] as const;

const STEPS = [
  {
    category: 'Wear',
    title: 'Slip it on',
    body: 'Clair sits on your wrist like a quiet piece of jewellery — light, familiar, ready whenever you are. No setup ritual. No lab appointment. Just wear it and let it read.',
  },
  {
    category: 'See',
    title: 'Watch your month take shape',
    body: 'Continuous readings paint the quiet weeks and the loud ones — energy dips, cycle shifts, the patterns you used to only feel.',
  },
  {
    category: 'Understand',
    title: 'Connect the dots',
    body: "When sleep frays or mood swings, Clair helps you see whether your body's signals line up. Clarity first — then you decide what to do with it.",
  },
  {
    category: 'Know',
    title: 'Live with the fuller picture',
    body: "Insights you can glance at anytime. No guessing through your month — just a gentler sense of what's yours this week.",
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
    body: "Energy that comes and goes isn't random when you can see the shape of your month. Clair maps it for you.",
    image: `${IMG}/clair-official-training.jpg`,
  },
  {
    title: 'Skin',
    sub: 'Glow that follows your cycle',
    body: 'Hormonal skin changes often track with the phases Clair watches — so you see the pattern before you guess at it.',
    image: `${IMG}/clair-official-people.jpg`,
  },
  {
    title: 'Mood',
    sub: 'The weeks that feel louder',
    body: 'Some weeks feel like yours; others ask more of you. Clair gives you the map so those weeks make more sense.',
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
    a: "You wear Clair like jewellery. It continuously reads your body's key signals and shows the shape of your month — quiet weeks and loud ones — without pinpricks, blood, or urine strips. Check it like a glance at your wrist.",
  },
  {
    q: 'Do I need a lab visit or prescription?',
    a: "No lab appointment is required to wear Clair. Pre-order through Liivv and we'll guide you through what's next as ship dates firm up.",
  },
  {
    q: 'Who is Liivv?',
    a: "Liivv is the Canadian health home where you pre-order Clair. Beyond the wristband, Liivv offers women's wellness, sleep support, skin care, diabetes care, ostomy supplies, wound care, and Ontario pharmacist chat — all with discreet delivery. This page stays focused on Clair; explore Liivv whenever you're ready.",
  },
  {
    q: 'How private is my order?',
    a: "Very. Everything arrives in plain, discreet packaging, and your conversations with our team stay between you and us. What you order is nobody's business but yours.",
  },
] as const;

const SOFT_LIST = [
  "Women's wellness",
  'Sleep & rest',
  'Skin care',
  'Diabetes care',
  'Ostomy supplies',
  'Wound care',
] as const;

function Pic({ src, className = '', alt = '' }: { src: string; className?: string; alt?: string }) {
  return (
    <div aria-hidden={alt === '' || undefined} className={`clair-pic ${className}`.trim()}>
      <img alt={alt} src={src} />
    </div>
  );
}

export function ClairHealthDemoPage() {
  return (
    <div id="clair-demo">
      <section className="clair-hero">
        <Pic className="clair-hero-bg" src={`${IMG}/clair-official-hero.jpg`} />
        <a className="clair-back" href={WOMEN_HREF}>
          ← Women&apos;s Health &amp; Wellness
        </a>
        <div className="clair-hero-inner">
          <span className="eyebrow">Clair Health · available through Liivv</span>
          <h1>Know your rhythm</h1>
          <p>
            Clair is the first wearable that reads your body&apos;s key signals continuously — so you finally see
            the shape of your month instead of guessing through it. Pre-order through Liivv.
          </p>
          <div className="clair-cta-row">
            <a className="btn btn-white" href={PREORDER_HREF}>
              Preorder
            </a>
            <a className="btn btn-outline-light" href="#how-it-works">
              How Clair Works
            </a>
          </div>
        </div>
      </section>

      <section className="clair-highlight rounded-top">
        <div className="clair-pill-row">
          <Pic src={`${IMG}/clair-official-product.jpg`} />
          <Pic src={`${IMG}/clair-official-frame-10.jpg`} />
          <Pic src={`${IMG}/clair-official-fertility.jpg`} />
          <Pic src={`${IMG}/clair-official-frame-20.jpg`} />
        </div>
        <h2>
          <span className="swash">Clair</span> by Clair Health — continuous clarity,{' '}
          <span className="swash sage">through Liivv</span>
        </h2>
        <div className="clair-pill-row">
          <Pic src={`${IMG}/clair-1.jpg`} />
          <Pic src={`${IMG}/clair-2.jpg`} />
          <Pic src={`${IMG}/clair-3.jpg`} />
          <Pic src={`${IMG}/clair-4.jpg`} />
        </div>
      </section>

      <section className="clair-counters">
        <div className="container clair-counters-grid">
          {COUNTERS.map((item) => (
            <div key={item.value}>
              <div className="num">
                {item.value}
                {'suffix' in item ? <sup>{item.suffix}</sup> : null}
              </div>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="clair-story rounded-top" id="how-it-works">
        <div className="container">
          <div className="clair-story-banner">
            <h2>Meet Clair.</h2>
            <Pic alt="Clair Health wristband" src={`${IMG}/clair-official-product.jpg`} />
          </div>
          <div className="clair-story-grid">
            <h2>
              Your body&apos;s signals, <span className="accent">worn like jewellery.</span>
            </h2>
            <div>
              <p>
                Clair is a wearable continuous hormone monitor from Clair Health — the first of its kind. It reads
                your body&apos;s key signals without blood or urine, so you can see the shape of your cycle in real
                time.
              </p>
              <p>
                No pinpricks. No waiting on a lab. Just a clear, gentle picture of your rhythm, checked like a
                glance at your wrist.
              </p>
              <p className="strong-close">
                Pre-order Clair through Liivv — and stay first in line for expected November 2026 shipping.
              </p>
              <div className="clair-cta-row">
                <a className="btn btn-dark" href={PREORDER_HREF}>
                  Preorder
                </a>
                <a className="btn btn-outline" href="#faq">
                  Good questions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="clair-timeline">
        <div className="container">
          <div className="clair-timeline-header">
            <p className="small-heading">From first glance to everyday clarity — here&apos;s how Clair fits into your life.</p>
            <h2>
              Wear. See. Understand. <span className="swash">Know.</span>
            </h2>
          </div>
          <div className="clair-steps">
            {STEPS.map((step) => (
              <article className="clair-step" key={step.category}>
                <p className="category">{step.category}</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="clair-pillars rounded-top">
        <div className="container">
          <span className="eyebrow">What Clair helps you see</span>
          <h2>Insights that touch real life</h2>
          <p className="intro">
            Clair shows the shape of your month — so the weeks that used to feel random start to make sense.
          </p>
          <div className="clair-pillars-grid">
            {PILLARS.map((pillar) => (
              <article className="clair-pillar" key={pillar.title}>
                <Pic src={pillar.image} />
                <h3>{pillar.title}</h3>
                <div className="sub">{pillar.sub}</div>
                <p>{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="clair-band rounded-top">
        <span className="eyebrow">Available through Liivv</span>
        <h2>Clair, from a brand that stays with you</h2>
        <p>
          Liivv is where you pre-order Clair — and where comfort, care, and kind answers already live. We&apos;re a
          calm health home for everyday living, not just one product.
        </p>
        <p>
          Besides Clair, Liivv also supports women&apos;s wellness, sleep, skin care, diabetes care, ostomy
          supplies, and more — whenever you&apos;re ready to explore.
        </p>
        <div aria-label="Liivv also offers" className="clair-soft-list">
          {SOFT_LIST.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="clair-cta-row">
          <a className="btn btn-outline" href={WOMEN_HREF}>
            Back to Women&apos;s Health
          </a>
          <a className="btn btn-dark" href={PREORDER_HREF}>
            Preorder
          </a>
        </div>
      </section>

      <section className="clair-faq" id="faq">
        <h2>Good questions, honest answers</h2>
        <p className="intro">Everything you need to know about Clair — answered like a friend would.</p>
        {FAQS.map((faq, index) => (
          <details key={faq.q} open={index === 0}>
            <summary>{faq.q}</summary>
            <p>{faq.a}</p>
          </details>
        ))}
      </section>

      <section className="clair-closing rounded-top">
        <Pic className="clair-closing-bg" src={`${IMG}/clair-official-frame-30.jpg`} />
        <div className="container">
          <h2>
            Know your rhythm. <em>Pre-order Clair.</em>
          </h2>
          <p>Continuous clarity on your wrist — available through Liivv.</p>
          <div className="clair-cta-row">
            <a className="btn btn-white" href={PREORDER_HREF}>
              Preorder
            </a>
            <a className="btn btn-outline-light" href={WOMEN_HREF}>
              Women&apos;s Health
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
