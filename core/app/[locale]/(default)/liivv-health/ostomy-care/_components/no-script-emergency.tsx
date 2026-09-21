'use client';

import { useMessages, useTranslations } from 'next-intl';

import { usePathname } from '~/i18n/routing';
import { isSensitiveOstomyPath } from '~/lib/analytics/ad-signals';

/*
 * =============================================================================
 * WHAT AN OSTOMY PAGE SAYS WHEN NOTHING ELSE ON IT RENDERS
 * =============================================================================
 * With JavaScript disabled or blocked, this store serves no page content at
 * all. Every route under `(default)` is streamed inside the Suspense boundary
 * that `app/[locale]/(default)/loading.tsx` opens, so the body arrives in the
 * HTML inside a `<div hidden>` that only an inline script moves into view. A
 * reader with scripts off gets the loading caption and nothing else: no
 * heading, no cards, no walk-through, no red-flag list, no crisis line.
 *
 * That is the whole store, not this microsite — the untouched home page behaves
 * identically — and fixing it means changing how every route in the app
 * streams, which is not this branch's to do. But on these pages, and only on
 * these, what is lost includes the two things a reader might need before
 * anything else: the signs that mean go to an emergency department, and the
 * 9-8-8 crisis line.
 *
 * So those two travel outside the boundary. This component is rendered from the
 * ROOT layout, above `(default)/layout.tsx`, which is the only place in the tree
 * that is not inside the streamed region — everything below it, nested layouts
 * included, is. Its markup is therefore in the first flush of the HTML, before
 * any script, and `<noscript>` shows it exactly when the rest of the page
 * cannot appear.
 *
 * WHAT IT IS NOT
 * -----------------------------------------------------------------------------
 * Not a fallback page. It carries no chapter content, no figure, no product and
 * no navigation, because a reader who cannot see the page cannot be given a
 * version of it here without maintaining a second copy of the microsite that
 * nobody reviews. It carries the emergency list, the crisis line, and a sentence
 * saying the page needs JavaScript.
 *
 * Every word comes from the message tree, in the reader's own locale, and every
 * word is copy that already exists on Chapter 02 and Chapter 01 — so there is
 * no second wording for a clinical reviewer to approve and no way for the two
 * to drift. The one new sentence is `ui.chapter.noScript.body`.
 *
 * It renders no ids and no anchors, so it cannot collide with the page's own
 * `#red-flags`, and `usePathname` from `~/i18n/routing` gives the same answer on
 * the server and in the browser, so there is nothing to mismatch on hydration
 * (the same reason `SensitiveScriptsProvider` matches on the path).
 * =============================================================================
 */
export function NoScriptEmergency() {
  const pathname = usePathname();
  const t = useTranslations('OstomyCare');
  const messages = useMessages();

  if (!isSensitiveOstomyPath(pathname)) {
    return null;
  }

  /*
   * The signs are read out of the message tree rather than listed here, so this
   * is the same list as the one on Chapter 02 and a sign added there cannot go
   * missing from the version a reader sees when the page itself will not
   * render. They are plain sentences with no placeholders, so reading them off
   * the messages object is the same text `t()` would return.
   */
  const signs = Object.entries(messages.OstomyCare.chapters['get-to-know-your-stoma'].urgent.signs);

  return (
    <noscript>
      <div className="oc-noscript">
        <p>{t('ui.chapter.noScript.body')}</p>
        <h2>{t('chapters.get-to-know-your-stoma.urgent.heading')}</h2>
        <p>{t('chapters.get-to-know-your-stoma.urgent.intro')}</p>
        <ul>
          {signs.map(([key, sign]) => (
            <li key={key}>{sign}</li>
          ))}
        </ul>
        <p>
          <strong>{t('chapters.get-to-know-your-stoma.urgent.action')}</strong>
        </p>
        <p>{t('ui.chapter.crisis.body')}</p>
      </div>
    </noscript>
  );
}
