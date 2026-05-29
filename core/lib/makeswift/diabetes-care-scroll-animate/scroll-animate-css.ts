/** Scroll-reveal + split-word animations for the diabetes-care Makeswift page. */
export const DIABETES_CARE_SCROLL_ANIMATE_CSS = `
@media (prefers-reduced-motion: no-preference) {
  [data-dc-scroll-reveal][data-animate='fade-up']:not(.dc-animated) {
    opacity: 0;
    transform: translateY(2.5rem);
  }

  [data-dc-scroll-reveal][data-animate='fade-up'].dc-animated {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity var(--animation-primary, 0.5s cubic-bezier(0.3, 1, 0.3, 1)),
      transform var(--animation-primary, 0.5s cubic-bezier(0.3, 1, 0.3, 1));
    transition-delay: calc(var(--dc-animate-delay, 0) * 1ms);
  }

  [data-dc-scroll-reveal][data-animate='fade-up-large']:not(.dc-animated) {
    opacity: 0;
    transform: translateY(4rem);
  }

  [data-dc-scroll-reveal][data-animate='fade-up-large'].dc-animated {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity var(--animation-smooth, 0.7s cubic-bezier(0.7, 0, 0.3, 1)),
      transform var(--animation-smooth, 0.7s cubic-bezier(0.7, 0, 0.3, 1));
    transition-delay: calc(var(--dc-animate-delay, 0) * 1ms);
  }

  .split-words[data-animate] [data-dc-animate-child]:not(.dc-animated) {
    opacity: 0;
    transform: translateY(2.5rem);
  }

  .split-words[data-animate] [data-dc-animate-child].dc-animated {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity var(--animation-primary, 0.5s cubic-bezier(0.3, 1, 0.3, 1)),
      transform var(--animation-primary, 0.5s cubic-bezier(0.3, 1, 0.3, 1));
    transition-delay: calc(var(--dc-animate-delay, 0) * 1ms);
  }

  .highlighted-text[data-style='half_text'] {
    background-size: 100% 28%;
  }

  .split-words.dc-animated .highlighted-text[data-style='half_text'] {
    background-size: 100% 28%;
  }

  .split-words.dc-animated .highlighted-text[data-style='text'] {
    color: rgb(var(--color-highlight));
  }

  /* Word gaps scale with heading font-size (em); used by section titles in multicolumn, image comparison, etc. */
  .split-words.words.splitting.split-words--fluid-gap {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--dc-split-word-gap, 0.28em);
    letter-spacing: normal;
  }

  .split-words.words.splitting.split-words--fluid-gap .whitespace {
    display: none;
  }

  .split-words.words.splitting.split-words--fluid-gap .word {
    margin-inline: 0;
    padding-inline: 0;
  }

  .split-words.words.splitting.split-words--fluid-gap .split-words-segment,
  .split-words.words.splitting.split-words--fluid-gap .highlighted-text {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--dc-split-word-gap, 0.28em);
  }

  [data-animate='zoom-out']:not(.dc-animated) {
    transform: scale(1.08);
  }

  [data-animate='zoom-out'].dc-animated {
    transform: scale(1);
    transition: transform var(--animation-smooth, 0.7s cubic-bezier(0.7, 0, 0.3, 1));
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-dc-scroll-reveal],
  .split-words[data-animate],
  [data-animate='zoom-out'] {
    opacity: 1 !important;
    transform: none !important;
  }

  .split-words[data-animate] [data-dc-animate-child] {
    opacity: 1 !important;
    transform: none !important;
  }
}
`;
