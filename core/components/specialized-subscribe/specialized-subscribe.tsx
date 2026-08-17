'use client';

import { SubscriptionFlowDemo } from '~/components/subscription-flow-demo/subscription-flow-demo';

import './specialized-subscribe.css';

export type SpecializedSubscribeFeature = {
  title: string;
  body: string;
};

export function SpecializedSubscribe({
  eyebrow = 'Subscribe & save',
  title,
  lead,
  features,
  shopHref,
  shopLabel,
  primaryCtaClass,
  secondaryCtaClass,
  className,
  wrapClassName,
  align = 'start',
  reveal = false,
  demoProductName,
  demoProductBlurb,
  demoProductPath,
}: {
  eyebrow?: string;
  title: string;
  lead: string;
  features: readonly SpecializedSubscribeFeature[];
  shopHref: string;
  shopLabel: string;
  primaryCtaClass: string;
  secondaryCtaClass: string;
  className?: string;
  wrapClassName?: string;
  align?: 'start' | 'center';
  reveal?: boolean;
  demoProductName: string;
  demoProductBlurb: string;
  demoProductPath: string;
}) {
  const revealProps = reveal ? { 'data-reveal': true } : undefined;

  return (
    <section aria-label="Subscribe and save" className={className} id="subscriptions">
      <div className={wrapClassName}>
        <header className={`sp-subs-head${align === 'center' ? ' is-center' : ''}`} {...revealProps}>
          <span className="sp-subs-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{lead}</p>
        </header>

        <div className="sp-subs-features" {...revealProps}>
          {features.map((feature) => (
            <article className="sp-subs-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>

        <div className="sp-subs-demo" {...revealProps}>
          <SubscriptionFlowDemo
            productBlurb={demoProductBlurb}
            productName={demoProductName}
            productPath={demoProductPath}
          />
        </div>

        <div className={`sp-subs-cta${align === 'center' ? ' is-center' : ''}`} {...revealProps}>
          <a className={primaryCtaClass} href={shopHref}>
            {shopLabel}
          </a>
          <a className={secondaryCtaClass} href="/account/subscriptions">
            Manage subscriptions
          </a>
        </div>
      </div>
    </section>
  );
}
