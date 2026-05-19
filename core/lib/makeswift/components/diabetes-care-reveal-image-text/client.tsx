import { clsx } from 'clsx';
import { useId, type ReactNode } from 'react';

import {
  ScrollReveal,
  SplittingBanner,
  SplitWordsHeading,
} from '~/lib/makeswift/diabetes-care-scroll-animate';

function IconArrowRight() {
  return (
    <svg
      className="icon icon-arrow-right icon-sm transform"
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 21 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 10H18M18 10L12.1667 4.16675M18 10L12.1667 15.8334"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const DEFAULT_BODY = `"I got diagnosed in March of 2020 at age 20.

The first sign that something was wrong was in February where I was doing sprints on a treadmill to get ready for a soccer season and after finishing I felt sick and dizzy to where I might need to go to the hospital.

I thought maybe I just went "too hard" and I was upset because it meant that I was way out of shape for the upcoming soccer season. Then I was getting very thirsty and seeing my weight drop despite working out and bulking..."

**Sometimes the best resource is a conversation. Connect with community partners who have walked the path before you.**`;

/** Split on blank lines; collapse single newlines inside a block into spaces. */
function bodyParagraphStrings(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter((p) => p.length > 0);
}

function renderBodyParagraphs(body: string): ReactNode {
  return bodyParagraphStrings(body).map((block, i) => {
    const inner = block.trim();
    const boldWrapped =
      inner.startsWith('**') &&
      inner.endsWith('**') &&
      inner.length > 4 &&
      !inner.slice(2, -2).includes('**');

    if (boldWrapped) {
      return (
        <p key={`body-p-${i}`}>
          <strong>{inner.slice(2, -2)}</strong>
        </p>
      );
    }

    return (
      <p key={`body-p-${i}`}>
        <em>{inner}</em>
      </p>
    );
  });
}

export interface DiabetesCareRevealImageTextProps {
  className?: string;
  bannerTitle?: string;
  heroImageSrc?: string;
  heroImageAlt?: string;
  storyHeadingLead?: string;
  storyHeadingHighlight?: string;
  body?: string;
  primaryButtonText?: string;
  primaryButtonLink?: { href?: string; target?: string };
  secondaryButtonText?: string;
  secondaryButtonLink?: { href?: string; target?: string };
}

export function DiabetesCareRevealImageWithText({
  className,
  bannerTitle,
  heroImageSrc,
  heroImageAlt,
  storyHeadingLead,
  storyHeadingHighlight,
  body,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
}: DiabetesCareRevealImageTextProps) {
  const instance = useId().replace(/:/g, '');
  const revealSectionId = `dcrift-reveal-${instance}`;
  const richSectionId = `dcrift-rich-${instance}`;

  const richSectionStyle = `#${richSectionId}{--section-padding-top:72px;--section-padding-bottom:100px;--color-button-background:142 165 141;--color-button-border:142 165 141}`;

  const title = bannerTitle?.trim() ?? 'Meet Armaan...';
  const imageSrc = heroImageSrc?.trim() ?? '';
  const imageAlt = heroImageAlt?.trim() ?? '';
  const lead = storyHeadingLead?.trim() ?? 'You Are';
  const highlight = storyHeadingHighlight?.trim() ?? 'Not Alone...';
  const bodyText = (body?.trim().length ?? 0) > 0 ? (body ?? '').trim() : DEFAULT_BODY;

  const primaryLabel = primaryButtonText?.trim() ?? '';
  const secondaryLabel = secondaryButtonText?.trim() ?? '';
  const primaryHref = primaryButtonLink?.href ?? '#';
  const secondaryHref = secondaryButtonLink?.href ?? '#';

  return (
    <div className={clsx('diabetes-care-reveal-image-text', className)}>
      <div className="shopify-section contents" id={revealSectionId}>
        <div className="section inline">
          <div className="relative contents">
            <SplittingBanner className="splitting-banner reveal-banner relative inline">
              <span className="reveal-banner__tracker absolute top-0 h-full" />
              <div className="reveal-banner__scroller sticky top-0 overflow-hidden">
                <div className="banner relative h-screen w-full">
                  <div className="banner__content left-0 h-full w-full overflow-hidden">
                    <div className="page-width flex h-full w-full items-center justify-center">
                      <div className="banner__box banner__box--large text-center">
                        <div className="splitting-wrapper relative">
                          <h2 className="heading title-xl tracking-heading splitting words chars leading-none">
                            <SplitWordsHeading text={title} />
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SplittingBanner>
            <ScrollReveal className="section--padding relative w-full" delayMs={80}>
              {imageSrc.length > 0 ? (
                <div className="page-width page-width--narrow relative mx-auto w-full">
                  <picture className="media media--adapt media--transparent relative flex w-full justify-center overflow-hidden rounded-3xl">
                    <img
                      alt={imageAlt}
                      className="aspect-adapt w-full max-w-full object-cover"
                      height={900}
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, min(720px, 90vw)"
                      src={imageSrc}
                      width={1200}
                    />
                  </picture>
                </div>
              ) : null}
            </ScrollReveal>
          </div>
        </div>
      </div>

      <div className="shopify-section" id={richSectionId}>
        <style dangerouslySetInnerHTML={{ __html: richSectionStyle }} />
        <div className="section section--padding">
          <div className="page-width page-width--narrow relative">
            <div className="rich-text relative z-1 text-center md:text-center">
              <h2 className="heading title-md leading-none">
                <SplitWordsHeading emphasis={highlight} lead={lead} />
              </h2>
              <ScrollReveal delayMs={80}>
              <div className="rte body subtext-md leading-normal">{renderBodyParagraphs(bodyText)}</div>
              {primaryLabel.length > 0 || secondaryLabel.length > 0 ? (
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  {primaryLabel.length > 0 ? (
                    <a
                      className="button button--primary button--md icon-with-text"
                      href={primaryHref}
                      rel={primaryButtonLink?.target === '_blank' ? 'noopener noreferrer' : undefined}
                      target={primaryButtonLink?.target}
                    >
                      <span className="btn-fill" data-fill />
                      <span className="btn-text">
                        {primaryLabel}
                        <IconArrowRight />
                      </span>
                    </a>
                  ) : null}
                  {secondaryLabel.length > 0 ? (
                    <a
                      className="button button--secondary button--md icon-with-text"
                      href={secondaryHref}
                      rel={secondaryButtonLink?.target === '_blank' ? 'noopener noreferrer' : undefined}
                      target={secondaryButtonLink?.target}
                    >
                      <span className="btn-fill" data-fill />
                      <span className="btn-text">
                        {secondaryLabel}
                        <IconArrowRight />
                      </span>
                    </a>
                  ) : null}
                </div>
              ) : null}
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
