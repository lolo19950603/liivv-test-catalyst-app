/* Twin of ostomy-care/chapters/chapter-disclosure.tsx (CardShop) @3b343c6e — port fixes both ways until Phase 2 */

'use client';

/*
 * Commerce, in its own band under a card's teaching.
 *
 * Which card sells what is declared in the site's merchandising record
 * (SiteConfig.shop, the site's chapters/chapter-shop.ts). The band sits after
 * the card's referral chip, so the referral is the last clinical thing said,
 * and it carries its own label and note rather than borrowing the card's.
 *
 * Nothing renders where the site has no shop, where its switch is off, where
 * the page has no ShopProvider, where the card has no shelf, or where the
 * catalogue left the shelf empty (./shop-strip.tsx). Ostomy's supply list and
 * go-bag band stay with Ostomy.
 */

import type { CategoryCard } from '../chapters/compose';
import { useSite } from '../site-context';

import { useShop } from './shop-context';
import { ShopStrip } from './shop-strip';

export function CardShop({ card }: { card: CategoryCard }) {
  const { shop: record } = useSite();
  const shop = useShop();

  if (!record?.on || !shop?.chapter) return null;

  const shelf = record.shelfForCard(shop.chapter, card.number);

  if (!shelf) return null;

  return (
    <div className="oc-merch-slot">
      <ShopStrip shelf={shelf} />
    </div>
  );
}
