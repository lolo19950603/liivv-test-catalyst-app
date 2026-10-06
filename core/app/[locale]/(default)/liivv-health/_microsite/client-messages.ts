import 'server-only';

import type { AbstractIntlMessages } from 'next-intl';

import { withoutHeldMessages } from '../ostomy-care/chapters/held-messages';

/*
 * =============================================================================
 * WHICH MESSAGES A BROWSER IS GIVEN, AND WHERE
 * =============================================================================
 * The root layout hands the message tree to `NextIntlClientProvider`, and
 * whatever it is given ships in the RSC payload of every page on the store —
 * /cart, every product page, and every Ostomy page included. D22 deferred
 * `pick()` scoping, so today that is the whole tree minus what an Ostomy hold
 * covers (see ../ostomy-care/chapters/held-messages).
 *
 * A care site added after Ostomy keeps its copy in its own top-level
 * namespace, and that namespace is NOT part of what the root ships. It is
 * taken out here, before the provider, and handed back only under that site's
 * own layout, through a nested provider. Two reasons:
 *
 *   - Nothing outside the site reads it, so it would only make every other
 *     page heavier.
 *   - Ostomy chapters rebuild themselves on the client from `useMessages()`.
 *     A namespace the root did not strip would change the payload of every
 *     Ostomy page, and the Ostomy payload is checked against a byte-for-byte
 *     baseline.
 *
 * Ostomy itself stays at the root until it moves onto the shared engine.
 *
 * Server-only: this runs in layouts, before a provider, and nothing in a
 * browser bundle should be able to reach the unfiltered tree through it.
 * =============================================================================
 */

/*
 * Top-level namespaces that belong to one care site and are only shipped
 * under that site's layout. A site's namespace goes here the day it is added
 * to the message files, not after.
 */
const SITE_NAMESPACES = ['DiabetesCare'] as const;

export type SiteNamespace = (typeof SITE_NAMESPACES)[number];

/* Removes a site's holds from the whole tree, by paths from the root. */
export type WithoutSiteHeld = (messages: AbstractIntlMessages) => AbstractIntlMessages;

/*
 * The tree without one top-level key. When the key is not there, the same
 * object comes back, so a namespace that does not exist yet changes nothing.
 * The rest spread keeps every other key in its original order.
 */
function withoutNamespace(messages: AbstractIntlMessages, ns: string): AbstractIntlMessages {
  if (!(ns in messages)) {
    return messages;
  }

  const { [ns]: _removed, ...kept } = messages;

  return kept;
}

/*
 * What the root layout gives the browser: everything except the site
 * namespaces, with the Ostomy holds applied exactly as before.
 */
export function rootClientMessages(messages: AbstractIntlMessages): AbstractIntlMessages {
  return withoutHeldMessages(SITE_NAMESPACES.reduce(withoutNamespace, messages));
}

/*
 * What a site's own layout gives the browser. A nested provider replaces its
 * parent's messages rather than adding to them, so this is the root bundle,
 * which the landing's shared islands still need, plus that one site's
 * namespace with the site's own holds applied. The site namespace is last,
 * where it sits in the message files.
 */
export function siteClientMessages(
  messages: AbstractIntlMessages,
  ns: SiteNamespace,
  withoutSiteHeld: WithoutSiteHeld,
): AbstractIntlMessages {
  const root = rootClientMessages(messages);
  const site = withoutSiteHeld(messages)[ns];

  return site === undefined ? root : { ...root, [ns]: site };
}
