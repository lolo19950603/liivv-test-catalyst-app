'use client';

import { openLiveChat } from '~/components/virtual-care/live-chat-widget';

import { OliviaFigure } from './olivia-figure';

import './olivia.css';

/*
 * Every word here is a prop with an English default, because this band renders
 * on /fr too: on the Ostomy Care landing it sits between fully translated
 * French sections, and the three strings that used to be written into the JSX —
 * the bubble, the ghost link and the note — published in English there. A
 * caller that passes nothing still gets exactly what it got before.
 */
export function OliviaHelpBand({
  kicker = 'Meet Olivia',
  title = 'Your sprout-sized shopping sidekick',
  body = 'Olivia helps with products, orders, subscriptions, and account how-tos — anytime. She does not give medical advice.',
  ctaLabel = 'Chat with Olivia',
  bubble = 'Hi — I live in the corner.',
  moreLabel = 'What she can do →',
  note = 'Look for the bouncing sprout in the corner. Clinical questions still belong with a pharmacist.',
  className,
}: {
  kicker?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  bubble?: string;
  moreLabel?: string;
  note?: string;
  className?: string;
}) {
  const rootClass = className ? `olivia-help-band ${className}` : 'olivia-help-band';

  /*
   * The region's accessible name is the kicker, so it is in the page language
   * too rather than a fourth English string left in the markup.
   */
  return (
    <aside aria-label={kicker} className={rootClass}>
      <div className="olivia-help-band__inner">
        <div className="olivia-help-band__mascot">
          <OliviaFigure mood="live" size="lg" />
          <span className="olivia-bubble olivia-bubble--center">{bubble}</span>
        </div>
        <div className="olivia-help-band__copy">
          <span className="olivia-help-band__kicker">{kicker}</span>
          <h2>{title}</h2>
          <p>{body}</p>
          <div className="olivia-help-band__actions">
            <button className="olivia-help-band__cta" onClick={() => openLiveChat()} type="button">
              {ctaLabel}
            </button>
            <a className="olivia-help-band__ghost" href="/#olivia">
              {moreLabel}
            </a>
          </div>
          <p className="olivia-help-band__note">{note}</p>
        </div>
      </div>
    </aside>
  );
}
