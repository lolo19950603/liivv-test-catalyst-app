'use client';

/*
 * =============================================================================
 * MY SUPPLY LIST (C02)
 * =============================================================================
 * Chapter 01, cards 8 and 9, inside the labelled shop band. Approved on the
 * interactives review, 2026-09-15.
 *
 * This is a shopping tool, and it says so above its own heading. The clinical
 * sentences it was split out of stay in the card body above, untouched; nothing
 * here paraphrases them, adds a claim, or tells a reader what their body needs.
 * It replaces two sales notes ("Try The Fresh Start kit…", "Explore curated
 * go-bag kits…") and two kit cards with something the reader fills in and keeps.
 *
 * What it will not do:
 *   - tick anything for the reader, or default a pouching system;
 *   - show a price, a brand, an image, a quantity, a total, an "add all", a
 *     progress bar or a word of praise on the checklist itself. The shop
 *     disclosure under the list is where the kit and its products appear;
 *   - put a product beside the powder line, which is text only in every state,
 *     because broken skin is a question for an NSWOC and not a purchase;
 *   - send what the reader ticks anywhere. Choices stay in this component, and
 *     in this browser only if the reader asks for that. Nothing reaches the
 *     URL, analytics, ad tags or the server. The one server call carries a
 *     single allowlisted product id and nothing else.
 *
 * With JavaScript off the whole list still renders — every row unticked, every
 * "Liivv sells some options for this" link visible, nothing hidden — which is
 * why the hiding happens after hydration rather than in the markup.
 * =============================================================================
 */

import { useLocale, useTranslations } from 'next-intl';
import { Suspense, use, useActionState, useEffect, useId, useState } from 'react';

import { useRouter } from '~/i18n/routing';

import type { OcCatalogItem } from '../get-oc-catalog';

import { addSupplyItemToCart, type SupplyAddState } from './_actions/add-supply-item';
import { shelfForCard } from './chapter-shop';
import type { CategoryCard, FigureText, SupplyRowText } from './chapters-data';
import type { CriterionKey, FigureMeta, SupplyItemKey, SupplyListItem } from './chapters-meta';
import { FrDraftMarker, Glyph } from './figure-parts';
import type { SupplyItem } from './get-supply-items';
import { ShopStrip } from './shop-strip';
import {
  SUPPLY_CART_PRODUCTS,
  SUPPLY_COLLECTIONS,
  type SupplyCollection,
} from './supply-list-merchandising';
type SupplyFigure = Extract<FigureMeta, { kind: 'supplyList' }>;

/* No default: a reader who has not been told which system they have picks none. */
type SystemChoice = '' | 'one' | 'two' | 'notSure';

type StatusKey =
  | ''
  | 'restored'
  | 'cleared'
  | 'copied'
  | 'copyFailed'
  | 'remembering'
  | 'forgotten';

const SYSTEM_CHOICES: Array<Exclude<SystemChoice, ''>> = ['one', 'two', 'notSure'];

const isSystemChoice = (value: unknown): value is SystemChoice =>
  value === '' || SYSTEM_CHOICES.some((choice) => choice === value);

/* Off until the reader turns it on, and wiped by Clear. */
const STORE_KEY = 'oc-supply-list-v1';

interface Row {
  key: SupplyItemKey;
  label: string;
  condition?: string;
  alsoGoBag: boolean;
  textOnly: boolean;
  /** Which brand-free criterion this row asks for, once that is knowable. */
  criterion: CriterionKey | null;
}

/*
 * A one-piece pouch and a two-piece barrier are different things to buy, so
 * the row is named for the system the reader picked. Until they pick one it
 * keeps the general name the card already uses.
 */
function labelFor(words: SupplyRowText | undefined, system: SystemChoice) {
  if (!words) return '';

  if (system === 'one' && words.labelOne !== undefined) return words.labelOne;

  if (system === 'two' && words.labelTwo !== undefined) return words.labelTwo;

  return words.label;
}

/*
 * The criterion a row asks for. The pouch row and its go-bag spare follow the
 * chosen system and have none until one is chosen — which is honest: without
 * it Liivv cannot say which of its shelves would fit.
 */
function criterionFor(key: SupplyItemKey, system: SystemChoice): CriterionKey | null {
  if (key === 'powder') return null;

  if (key === 'pouch' || key === 'spareSystem') {
    if (system === 'one') return 'pouchOne';

    if (system === 'two') return 'pouchTwo';

    return null;
  }

  return key;
}

function toRows(items: SupplyListItem[], words: SupplyRowText[], system: SystemChoice): Row[] {
  return items.map((item, index) => {
    const text = words[index];
    const condition = item.conditional ? text?.condition : undefined;

    return {
      key: item.key,
      label: labelFor(text, system),
      ...(condition === undefined ? {} : { condition }),
      alsoGoBag: Boolean(item.alsoGoBag),
      textOnly: Boolean(item.textOnly),
      criterion: criterionFor(item.key, system),
    };
  });
}

/* Every label the list needs, resolved once so the component reads as markup. */
function supplyWords(text: FigureText | undefined) {
  return {
    intro: text?.intro ?? '',
    systemLegend: text?.systemLegend ?? '',
    starterHeading: text?.starterHeading ?? '',
    goBagHeading: text?.goBagHeading ?? '',
    alsoGoBag: text?.alsoGoBag ?? '',
    supplies: text?.supplies ?? [],
    goBagItems: text?.goBagItems ?? [],
  };
}

/*
 * The collection behind a row, if there is one. On /fr a destination with no
 * French commercial content is not linked to at all, rather than sending a
 * francophone reader to an English shelf.
 */
function collectionFor(row: Row, locale: string): SupplyCollection | null {
  const collection = row.criterion === null ? null : SUPPLY_COLLECTIONS[row.criterion];

  if (!collection) return null;

  return locale === 'fr' && !collection.frenchContent ? null : collection;
}

/* ------------------------------------------------------------------------- */
/* Rows                                                                       */
/* ------------------------------------------------------------------------- */

function ItemRow({
  alsoGoBagLabel,
  hydrated,
  onTick,
  row,
  sells,
  sellsLabel,
  ticked,
}: {
  alsoGoBagLabel: string;
  hydrated: boolean;
  onTick: (key: SupplyItemKey, checked: boolean) => void;
  row: Row;
  sells: SupplyCollection | null;
  sellsLabel: string;
  ticked: boolean;
}) {
  if (row.textOnly) {
    return <p className="oc-fig-supply-plain">{row.label}</p>;
  }

  return (
    <div className="oc-fig-supply-item">
      <label className="oc-fig-supply-check">
        <input
          checked={ticked}
          onChange={(event) => onTick(row.key, event.currentTarget.checked)}
          type="checkbox"
          value={row.key}
        />
        <span>
          {row.label}
          {row.alsoGoBag ? <small>{alsoGoBagLabel}</small> : null}
          {row.condition === undefined ? null : <small>{row.condition}</small>}
        </span>
      </label>
      {sells ? (
        <a className="oc-fig-supply-carry" hidden={hydrated && !ticked} href={sells.href}>
          {sellsLabel}
        </a>
      ) : null}
    </div>
  );
}

function RowGroup({
  alsoGoBagLabel,
  heading,
  hydrated,
  locale,
  onTick,
  rows,
  sellsLabel,
  ticked,
}: {
  alsoGoBagLabel: string;
  heading: string;
  hydrated: boolean;
  locale: string;
  onTick: (key: SupplyItemKey, checked: boolean) => void;
  rows: Row[];
  sellsLabel: string;
  ticked: ReadonlySet<string>;
}) {
  return (
    <fieldset className="oc-fig-supply-group">
      <legend>{heading}</legend>
      {rows.map((row) => (
        <ItemRow
          alsoGoBagLabel={alsoGoBagLabel}
          hydrated={hydrated}
          key={row.key}
          onTick={onTick}
          row={row}
          sells={collectionFor(row, locale)}
          sellsLabel={sellsLabel}
          ticked={ticked.has(row.key)}
        />
      ))}
    </fieldset>
  );
}

function SystemPicker({
  ask,
  legend,
  name,
  onPick,
  system,
}: {
  ask: string;
  legend: string;
  name: string;
  onPick: (choice: SystemChoice) => void;
  system: SystemChoice;
}) {
  const t = useTranslations('OstomyCare.ui.chapter.supplyList');

  return (
    <fieldset className="oc-fig-supply-group">
      <legend>{legend}</legend>
      <div className="oc-fig-supply-systems">
        {SYSTEM_CHOICES.map((choice) => (
          <label key={choice}>
            <input
              checked={system === choice}
              name={name}
              onChange={() => onPick(choice)}
              type="radio"
              value={choice}
            />
            {t(`systems.${choice}`)}
          </label>
        ))}
      </div>
      {system === 'notSure' ? (
        <p className="oc-fig-supply-ask">
          <Glyph name="nswoc" />
          {ask}
        </p>
      ) : null}
    </fieldset>
  );
}

/* ------------------------------------------------------------------------- */
/* Keep it: copy, share, remember                                             */
/* ------------------------------------------------------------------------- */

interface ControlProps {
  canCopy: boolean;
  canShare: boolean;
  hydrated: boolean;
  onClear: () => void;
  onCopy: () => void;
  onRemember: (checked: boolean) => void;
  onShare: () => void;
  remember: boolean;
}

function ListControls({
  canCopy,
  canShare,
  hydrated,
  onClear,
  onCopy,
  onRemember,
  onShare,
  remember,
}: ControlProps) {
  const t = useTranslations('OstomyCare.ui.chapter.supplyList');

  return (
    <div className="oc-fig-supply-controls">
      {canCopy ? (
        <button className="oc-fig-supply-btn" onClick={onCopy} type="button">
          {t('copy')}
        </button>
      ) : null}
      {canShare ? (
        <button className="oc-fig-supply-btn" onClick={onShare} type="button">
          {t('share')}
        </button>
      ) : null}
      {hydrated ? (
        <label className="oc-fig-supply-remember">
          <input
            checked={remember}
            onChange={(event) => onRemember(event.currentTarget.checked)}
            type="checkbox"
          />
          {t('remember')}
        </label>
      ) : null}
      {hydrated ? (
        <button className="oc-fig-supply-btn" onClick={onClear} type="button">
          {t('clear')}
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* The optional shop hand-off                                                 */
/* ------------------------------------------------------------------------- */

/*
 * One ticked row, and the one allowlisted product behind it. The row keeps its
 * own name — a catalogue product name would put a brand inside the list — so
 * the reader sees the thing they ticked, and the product page names itself.
 */
function ShopRow({ item, label }: { item: SupplyItem; label: string }) {
  const t = useTranslations('OstomyCare.ui.chapter.supplyList');
  const router = useRouter();
  const [state, formAction] = useActionState<SupplyAddState, FormData>(addSupplyItemToCart, {
    status: 'idle',
  });

  useEffect(() => {
    if (state.status === 'added') router.refresh();
  }, [state, router]);

  return (
    <li>
      <span>{label}</span>
      {item.optionFree && item.inStock ? (
        <form action={formAction}>
          <input name="productEntityId" type="hidden" value={item.entityId} />
          <button className="oc-fig-supply-btn" type="submit">
            {t('addToCart')}
          </button>
        </form>
      ) : (
        <a className="oc-fig-supply-btn" href={item.path}>
          {t('chooseOnProductPage')}
        </a>
      )}
      <p className="oc-fig-supply-status" role="status">
        {state.status === 'added' ? t('added') : null}
        {state.status === 'error' ? t('addError') : null}
      </p>
    </li>
  );
}

/* The first allowlisted product for a criterion that the catalogue answered. */
function productFor(criterion: CriterionKey, items: SupplyItem[]) {
  const ids = SUPPLY_CART_PRODUCTS[criterion] ?? [];

  return items.find((item) => ids.includes(item.entityId));
}

function ShopList({ rows, supplyItems }: { rows: Row[]; supplyItems: Promise<SupplyItem[]> }) {
  const t = useTranslations('OstomyCare.ui.chapter.supplyList');
  const items = use(supplyItems);
  const offers = rows.flatMap((row) => {
    const item = row.criterion === null ? undefined : productFor(row.criterion, items);

    return item ? [{ item, key: row.key, label: row.label }] : [];
  });

  if (!offers.length) {
    return <p className="oc-fig-supply-empty">{t('shopEmpty')}</p>;
  }

  return (
    <ul className="oc-fig-supply-offers">
      {offers.map((offer) => (
        <ShopRow item={offer.item} key={offer.key} label={offer.label} />
      ))}
    </ul>
  );
}

/*
 * Kits and the products inside them, last. Every group is in the server HTML,
 * so a reader without JavaScript still sees them. After hydration a group that
 * does not match the picked system is dropped, and nothing shows until a
 * system is chosen. "Not sure yet" is not a system, so it hides the block.
 */
function SupplyShop({
  hydrated,
  products,
  shelf,
  system,
}: {
  hydrated: boolean;
  products: Record<number, OcCatalogItem>;
  shelf: ReturnType<typeof shelfForCard>;
  system: SystemChoice;
}) {
  if (!shelf) return null;

  const waiting = hydrated && system !== 'one' && system !== 'two';
  const offers = shelf.offers.filter(
    (offer) => !hydrated || !offer.system || offer.system === system,
  );

  if (!offers.length) return null;

  return (
    <div className="oc-fig-supply-kits" hidden={waiting}>
      <ShopStrip nested products={products} shelf={{ ...shelf, offers }} />
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* Saved state                                                                */
/* ------------------------------------------------------------------------- */

interface SavedList {
  system: SystemChoice;
  items: string[];
  note: string;
}

function readSaved(): SavedList | null {
  let parsed: unknown = null;

  try {
    const raw = localStorage.getItem(STORE_KEY);

    parsed = raw === null ? null : JSON.parse(raw);
  } catch {
    /* Storage blocked, or the saved value is not JSON. Start empty. */
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null) return null;

  const system = 'system' in parsed ? parsed.system : '';
  const items = 'items' in parsed ? parsed.items : [];
  const note = 'note' in parsed ? parsed.note : '';

  return {
    system: isSystemChoice(system) ? system : '',
    items: Array.isArray(items) ? items.filter((v): v is string => typeof v === 'string') : [],
    note: typeof note === 'string' ? note : '',
  };
}

function writeSaved(saved: SavedList) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(saved));
  } catch {
    /* Storage blocked or full. The list still works for this visit. */
  }
}

function forgetSaved() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* Nothing to do: there is no copy to remove. */
  }
}

/* ------------------------------------------------------------------------- */
/* The list                                                                   */
/* ------------------------------------------------------------------------- */

export function SupplyList({
  card,
  figure,
  products,
  slug,
  supplyItems,
}: {
  card: CategoryCard;
  figure: SupplyFigure;
  products: Record<number, OcCatalogItem>;
  slug: string;
  supplyItems?: Promise<SupplyItem[]>;
}) {
  const t = useTranslations('OstomyCare.ui.chapter.supplyList');
  const locale = useLocale();
  const shopShelf = shelfForCard(slug, card.number);
  const words = supplyWords(card.figureText);
  const systemName = useId();
  const noteId = useId();

  const [system, setSystem] = useState<SystemChoice>('');
  const [ticked, setTicked] = useState<ReadonlySet<string>>(() => new Set());
  const [note, setNote] = useState('');
  const [remember, setRemember] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [canCopy, setCanCopy] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [statusKey, setStatusKey] = useState<StatusKey>('');

  const starter = toRows(figure.items, words.supplies, system);
  const goBag = toRows(figure.goBagItems, words.goBagItems, system);
  const rows = [...starter, ...goBag];
  const tickedRows = rows.filter((row) => !row.textOnly && ticked.has(row.key));

  /*
   * Everything the server rendered stays visible until this runs, so a reader
   * without JavaScript keeps the whole list. Clipboard and Web Share are
   * missing or blocked in some browsers and in insecure contexts, so their
   * buttons appear only where they were actually found.
   */
  useEffect(() => {
    const features: Partial<Navigator> = navigator;
    const saved = readSaved();

    setHydrated(true);
    setCanCopy(Boolean(features.clipboard));
    setCanShare(Boolean(features.share));

    if (!saved) return;

    setRemember(true);
    setSystem(saved.system);
    setTicked(new Set(saved.items));
    setNote(saved.note);
    setStatusKey('restored');
  }, []);

  useEffect(() => {
    if (remember) writeSaved({ system, items: [...ticked], note });
  }, [remember, system, ticked, note]);

  useEffect(() => {
    if (!hydrated) return;

    setShopOpen(system === 'one' || system === 'two');
  }, [hydrated, system]);

  /* Plain text: the rows the reader kept, their notes, and no Liivv links. */
  const listText = () => {
    const lines = [t('heading')];

    rows.forEach((row) => {
      if (!row.textOnly && !ticked.has(row.key)) return;

      lines.push(`- ${row.label}${row.condition === undefined ? '' : ` (${row.condition})`}`);
    });

    if (note.trim()) lines.push(`${t('productNumber')}: ${note.trim()}`);

    return lines.join('\n');
  };

  const onTick = (key: SupplyItemKey, checked: boolean) => {
    const next = new Set(ticked);

    if (checked) next.add(key);
    else next.delete(key);

    setTicked(next);
  };

  /*
   * Say what the tick box just did. Restore and Clear both announce, so a
   * silent Remember would be the one control in this group that gives no
   * feedback about the copy kept in this browser.
   */
  const onRemember = (checked: boolean) => {
    setRemember(checked);

    if (!checked) forgetSaved();

    setStatusKey(checked ? 'remembering' : 'forgotten');
  };

  const onClear = () => {
    setSystem('');
    setTicked(new Set());
    setNote('');
    setRemember(false);
    forgetSaved();
    setStatusKey('cleared');
  };

  const onCopy = () => {
    const features: Partial<Navigator> = navigator;

    void features.clipboard?.writeText(listText()).then(
      () => setStatusKey('copied'),
      () => setStatusKey('copyFailed'),
    );
  };

  const onShare = () => {
    const features: Partial<Navigator> = navigator;

    void features.share?.({ text: listText() }).catch(() => {
      /* Cancelled, or the sheet refused. Nothing to say about it. */
    });
  };

  return (
    <aside className="oc-ch-shop">
      <span className="oc-ch-shop-label">{t('toolLabel')}</span>
      <FrDraftMarker gate="supplyList" />
      <fieldset className="oc-fig-supply" id="oc-supply-list">
        <legend className="oc-fig-supply-head">{t('heading')}</legend>
        {words.intro ? <p className="oc-fig-supply-intro">{words.intro}</p> : null}

        <SystemPicker
          ask={t('askSystem')}
          legend={words.systemLegend}
          name={systemName}
          onPick={setSystem}
          system={system}
        />

        <RowGroup
          alsoGoBagLabel={words.alsoGoBag}
          heading={words.starterHeading}
          hydrated={hydrated}
          locale={locale}
          onTick={onTick}
          rows={starter}
          sellsLabel={t('sellsOptions')}
          ticked={ticked}
        />
        <RowGroup
          alsoGoBagLabel={words.alsoGoBag}
          heading={words.goBagHeading}
          hydrated={hydrated}
          locale={locale}
          onTick={onTick}
          rows={goBag}
          sellsLabel={t('sellsOptions')}
          ticked={ticked}
        />

        <div className="oc-fig-supply-field">
          <label htmlFor={noteId}>
            {t('productNumber')}
            <small>{t('productNumberHint')}</small>
          </label>
          <input
            autoComplete="off"
            id={noteId}
            onChange={(event) => setNote(event.currentTarget.value)}
            type="text"
            value={note}
          />
        </div>

        {/* Ruled space to write on, on paper only. */}
        <div aria-hidden className="oc-fig-supply-lines">
          <span />
          <span />
          <span />
        </div>

        <ListControls
          canCopy={canCopy}
          canShare={canShare}
          hydrated={hydrated}
          onClear={onClear}
          onCopy={onCopy}
          onRemember={onRemember}
          onShare={onShare}
          remember={remember}
        />
        <p className="oc-fig-supply-status" role="status">
          {statusKey === '' ? '' : t(statusKey)}
        </p>

        {/*
         * The optional shop section exists only where Liivv actually
         * merchandises something. The route withholds `supplyItems` while the
         * cart allowlist is empty. The kit-and-product strip is enough on its
         * own to open this disclosure. With both empty it would open on a
         * line telling the reader to tick items they have already ticked,
         * so it does not render at all.
         *
         * Before the first criterion earns an allowlisted product, `shopEmpty`
         * needs splitting in two — one line for nothing ticked yet and one for
         * "Liivv carries none of these" — because a reader who has ticked
         * cannot act on "tick items above".
         */}
        {supplyItems === undefined && !shopShelf ? null : (
          <details
            className="oc-fig-supply-shop"
            onToggle={(event) => {
              if (event.currentTarget.open !== shopOpen) setShopOpen(event.currentTarget.open);
            }}
            open={shopOpen}
          >
            <summary>{t('shopHeading')}</summary>
            {supplyItems === undefined ? null : (
              <Suspense fallback={<div className="oc-fig-supply-reserve" />}>
                <ShopList rows={tickedRows} supplyItems={supplyItems} />
              </Suspense>
            )}
            <SupplyShop hydrated={hydrated} products={products} shelf={shopShelf} system={system} />
          </details>
        )}
      </fieldset>
    </aside>
  );
}

/*
 * The go-bag card's band: one link back to the list above, which already holds
 * the go-bag rows. One list, kept in one place.
 */
export function GoBagBand({ card }: { card: CategoryCard }) {
  const t = useTranslations('OstomyCare.ui.chapter.supplyList');
  const label = card.figureText?.goBagLink;

  if (label === undefined) return null;

  return (
    <aside className="oc-ch-shop">
      <span className="oc-ch-shop-label">{t('toolLabel')}</span>
      <FrDraftMarker gate="supplyList" />
      <p className="oc-fig-supply-golink">
        <a href="#oc-supply-list">{label}</a>
      </p>
    </aside>
  );
}
