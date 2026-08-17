'use client';

import { openLiveChat } from '~/components/virtual-care/live-chat-widget';

import { OliviaFigure } from './olivia-figure';

import './olivia.css';

export function OliviaHelpBand({
  kicker = 'Meet Olivia',
  title = 'Your sprout-sized shopping sidekick',
  body = 'Olivia helps with products, orders, subscriptions, and account how-tos — anytime. She does not give medical advice.',
  ctaLabel = 'Chat with Olivia',
  className,
}: {
  kicker?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  className?: string;
}) {
  const rootClass = className ? `olivia-help-band ${className}` : 'olivia-help-band';

  return (
    <aside aria-label="Meet Olivia" className={rootClass}>
      <div className="olivia-help-band__inner">
        <div className="olivia-help-band__mascot">
          <OliviaFigure mood="live" size="lg" />
          <span className="olivia-bubble olivia-bubble--center">Hi — I live in the corner.</span>
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
              What she can do →
            </a>
          </div>
          <p className="olivia-help-band__note">
            Look for the bouncing sprout in the corner. Clinical questions still belong with a pharmacist.
          </p>
        </div>
      </div>
    </aside>
  );
}
