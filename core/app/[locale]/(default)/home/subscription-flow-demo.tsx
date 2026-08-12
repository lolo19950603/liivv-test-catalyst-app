'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SUB_FLOW_STEPS = [
  {
    id: 'subscribe',
    num: '01',
    title: 'Subscribe & save',
    body: 'On a product page, switch from one-time to Subscribe & save.',
  },
  {
    id: 'frequency',
    num: '02',
    title: 'Pick frequency',
    body: 'Choose how often it arrives — weekly, monthly, or every 14 / 30 days.',
  },
  {
    id: 'start',
    num: '03',
    title: 'Pick a start date',
    body: 'Start today, or schedule up to a year ahead. Billing follows your date.',
  },
  {
    id: 'checkout',
    num: '04',
    title: 'Checkout as usual',
    body: 'Add to cart and check out like any other order — subscription badge included.',
  },
  {
    id: 'manage',
    num: '05',
    title: 'Manage anytime',
    body: 'Pause, resume, skip a delivery, change frequency, or cancel in Account.',
  },
] as const;

const FREQUENCIES = ['Every week', 'Every month', 'Every 14 days', 'Every 30 days'] as const;

type PointerTarget = 'purchase-type' | 'frequency' | 'start-date' | 'checkout' | 'manage';

/**
 * KitFlowDemo-style instructional loop for subscriptions (animated mock UI, not an MP4).
 */
export function SubscriptionFlowDemo() {
  const [step, setStep] = useState(0);
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const [freqIndex, setFreqIndex] = useState(1);
  const [startLabel, setStartLabel] = useState('Today');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [pulse, setPulse] = useState<string | null>('purchase-type');
  const [activeTarget, setActiveTarget] = useState<PointerTarget | null>(null);
  const [pointer, setPointer] = useState({ x: 72, y: 48, visible: false, clicking: false });

  const pageRef = useRef<HTMLDivElement>(null);
  const purchaseRef = useRef<HTMLDivElement>(null);
  const frequencyRef = useRef<HTMLDivElement>(null);
  const startDateRef = useRef<HTMLDivElement>(null);
  const checkoutRef = useRef<HTMLButtonElement>(null);
  const manageRef = useRef<HTMLSpanElement>(null);

  const active = SUB_FLOW_STEPS[hoverStep ?? step] ?? SUB_FLOW_STEPS[0];

  const measurePointer = useCallback((target: PointerTarget | null, clicking = false) => {
    const page = pageRef.current;
    if (!page || !target) {
      setPointer((prev) => ({ ...prev, visible: Boolean(target), clicking: false }));
      return;
    }

    const node =
      target === 'purchase-type'
        ? purchaseRef.current
        : target === 'frequency'
          ? frequencyRef.current
          : target === 'start-date'
            ? startDateRef.current
            : target === 'checkout'
              ? checkoutRef.current
              : manageRef.current;

    if (!node) return;

    const pageBox = page.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    const x = box.left - pageBox.left + box.width * 0.55;
    const y = box.top - pageBox.top + box.height * 0.55;
    setPointer({ x, y, visible: true, clicking });
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reduceMotion || !activeTarget) return;
    const id = window.requestAnimationFrame(() => {
      measurePointer(activeTarget, false);
    });
    return () => window.cancelAnimationFrame(id);
  }, [activeTarget, step, freqIndex, startLabel, measurePointer, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      setStep(0);
      setFreqIndex(1);
      setStartLabel('Today');
      setPulse(null);
      setActiveTarget(null);
      setPointer((prev) => ({ ...prev, visible: false, clicking: false }));
      return;
    }

    let cancelled = false;
    let timerId = 0;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timerId = window.setTimeout(() => {
          if (!cancelled) resolve();
        }, ms);
      });

    const aim = async (target: PointerTarget, settleMs = 700) => {
      if (cancelled) return;
      setActiveTarget(target);
      setPulse(target === 'manage' ? 'manage' : target);
      await wait(50);
      if (cancelled) return;
      measurePointer(target, false);
      await wait(settleMs);
    };

    const click = async (target: PointerTarget) => {
      if (cancelled) return;
      setActiveTarget(target);
      measurePointer(target, true);
      await wait(260);
      if (cancelled) return;
      setPointer((prev) => ({ ...prev, clicking: false }));
      await wait(200);
    };

    const run = async () => {
      while (!cancelled) {
        setStep(0);
        setFreqIndex(1);
        setStartLabel('Today');
        setPulse('purchase-type');
        setActiveTarget(null);
        setPointer((prev) => ({ ...prev, visible: false, clicking: false }));
        await wait(450);
        if (cancelled) break;

        await aim('purchase-type');
        if (cancelled) break;
        await click('purchase-type');
        if (cancelled) break;
        await wait(900);
        if (cancelled) break;

        setStep(1);
        await wait(300);
        if (cancelled) break;
        await aim('frequency');
        if (cancelled) break;
        await click('frequency');
        if (cancelled) break;
        setFreqIndex(2);
        await wait(700);
        if (cancelled) break;
        await click('frequency');
        if (cancelled) break;
        setFreqIndex(1);
        await wait(800);
        if (cancelled) break;

        setStep(2);
        await wait(300);
        if (cancelled) break;
        await aim('start-date');
        if (cancelled) break;
        await click('start-date');
        if (cancelled) break;
        setStartLabel('Mar 18');
        await wait(1100);
        if (cancelled) break;

        setStep(3);
        await wait(300);
        if (cancelled) break;
        await aim('checkout');
        if (cancelled) break;
        await click('checkout');
        if (cancelled) break;
        await wait(1400);
        if (cancelled) break;

        setStep(4);
        await wait(350);
        if (cancelled) break;
        await aim('manage', 800);
        if (cancelled) break;
        await click('manage');
        if (cancelled) break;
        await wait(1800);
        if (cancelled) break;
      }
    };

    void run();

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [measurePointer, reduceMotion]);

  return (
    <div className="lh-sub-flow" data-step={active.id}>
      <div
        aria-label="How subscriptions work"
        className="lh-sub-flow-steps"
        onMouseLeave={() => setHoverStep(null)}
        role="tablist"
      >
        {SUB_FLOW_STEPS.map((item, index) => (
          <div className="lh-sub-flow-step" key={item.id}>
            <button
              aria-selected={index === (hoverStep ?? step)}
              className={
                [
                  index === (hoverStep ?? step) ? 'is-active' : '',
                  hoverStep === index ? 'is-preview' : '',
                ]
                  .filter(Boolean)
                  .join(' ') || undefined
              }
              onBlur={() => setHoverStep(null)}
              onFocus={() => setHoverStep(index)}
              onMouseEnter={() => setHoverStep(index)}
              role="tab"
              type="button"
            >
              <span className="lh-sub-flow-num">{item.num}</span>
              <span className="lh-sub-flow-label">{item.title}</span>
            </button>
            {index < SUB_FLOW_STEPS.length - 1 ? (
              <span aria-hidden className="lh-sub-flow-arrow">
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <p aria-live="polite" className="lh-sub-flow-caption">
        <strong>{active.title}.</strong> {active.body}
      </p>

      <div aria-hidden className="lh-sub-page" ref={pageRef}>
        <div className="lh-sub-page-chrome">
          <span />
          <span />
          <span />
          <em>
            {step >= 4 ? 'liivv.ca/account/subscriptions' : 'liivv.ca/product/everyday-essentials'}
          </em>
        </div>

        {step < 4 ? (
          <div className="lh-sub-page-body">
            <div className="lh-sub-page-product">
              <div className="lh-sub-page-swatch" />
              <span className="lh-sub-badge">Subscribe &amp; save</span>
              <h3>Everyday Essentials</h3>
              <p>Recurring delivery on your schedule. Cancel anytime.</p>
            </div>

            <div className="lh-sub-page-panel">
              <div
                className={`lh-sub-option${pulse === 'purchase-type' ? ' is-pulse' : ''}${
                  step >= 0 ? ' is-selected' : ''
                }${activeTarget === 'purchase-type' && pointer.clicking ? ' is-pressed' : ''}`}
                ref={purchaseRef}
              >
                <span>Subscribe &amp; save</span>
                <em>Best value</em>
              </div>
              <div className="lh-sub-option is-muted">
                <span>One-time purchase</span>
              </div>

              <label className="lh-sub-field">
                <span>Deliver every</span>
                <div
                  className={`lh-sub-select${pulse === 'frequency' ? ' is-pulse' : ''}${
                    activeTarget === 'frequency' && pointer.clicking ? ' is-pressed' : ''
                  }`}
                  ref={frequencyRef}
                >
                  {FREQUENCIES[freqIndex]}
                </div>
              </label>

              <label className="lh-sub-field">
                <span>Starts</span>
                <div
                  className={`lh-sub-select${pulse === 'start-date' ? ' is-pulse' : ''}${
                    activeTarget === 'start-date' && pointer.clicking ? ' is-pressed' : ''
                  }`}
                  ref={startDateRef}
                >
                  {startLabel}
                </div>
              </label>

              <div className="lh-sub-consent">I understand the price may change over time.</div>

              <button
                className={`lh-sub-cart${pulse === 'checkout' ? ' is-pulse' : ''}${
                  activeTarget === 'checkout' && pointer.clicking ? ' is-pressed' : ''
                }`}
                ref={checkoutRef}
                type="button"
              >
                {step >= 3 ? 'Added to cart · Subscription' : 'Add to cart'}
              </button>
            </div>
          </div>
        ) : (
          <div className="lh-sub-manage">
            <div className="lh-sub-manage-head">
              <h3>Your subscriptions</h3>
              <span>Active</span>
            </div>
            <div className={`lh-sub-manage-card${pulse === 'manage' ? ' is-pulse' : ''}`}>
              <div>
                <strong>Everyday Essentials</strong>
                <em>Every month · Next on Apr 18</em>
              </div>
              <div className="lh-sub-manage-actions">
                <span>Pause</span>
                <span
                  className={`is-accent${activeTarget === 'manage' && pointer.clicking ? ' is-pressed' : ''}`}
                  ref={manageRef}
                >
                  Skip delivery
                </span>
                <span>Frequency</span>
                <span>Cancel</span>
              </div>
            </div>
            <p className="lh-sub-manage-note">No charge and nothing ships when you skip a cycle.</p>
          </div>
        )}

        {!reduceMotion && pointer.visible ? (
          <div
            className={`lh-sub-cursor${pointer.clicking ? ' is-clicking' : ''}`}
            style={{
              transform: `translate3d(${Math.max(pointer.x - 3, 0)}px, ${Math.max(pointer.y - 2, 0)}px, 0)`,
            }}
          >
            <svg fill="none" height="28" viewBox="0 0 24 28" width="24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 2.5 4 22.2l5.1-4.4 3.1 7.3 2.6-1.1-3.1-7.2L19.5 16 4 2.5Z"
                fill="#312f2f"
                stroke="#f5f2ed"
                strokeLinejoin="round"
                strokeWidth="1.4"
              />
            </svg>
            <span className="lh-sub-cursor-ripple" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
