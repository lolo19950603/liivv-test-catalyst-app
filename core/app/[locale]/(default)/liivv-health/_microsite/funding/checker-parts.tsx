/* Twin of ostomy-care/funding/funding-checker.tsx @3b343c6e — port fixes both ways until Phase 2 */

'use client';

/*
 * The parts of a care site's funding checker that do not depend on what is
 * being asked: a row of radio choices, the line that says how much of the
 * picture is filled in, and the result cards, each with the official page it
 * rests on and the date that page was last checked.
 *
 * Ostomy's, with the words handed in rather than read from one site's tree.
 * A site's own checker (its questions, and what it shows for the answers) is
 * built from these, so every site's checker looks and behaves the same: the
 * same `oc-fund-*` classes, from Ostomy's funding.css, which ./funding-page
 * imports rather than copies.
 *
 * Nothing here stores or sends what a reader answers. The answers live in the
 * checker's own state and are gone when the page is left.
 */

/*
 * A program's phone numbers, already worded for the page locale: each office
 * with its numbers, each number dialled from `tel` and printed as `text`,
 * with its note ("toll-free") after it. Diabetes Care's cards carry them;
 * Ostomy's twin has none (a Diabetes-first addition, not yet ported back).
 */
export interface FundingPhoneGroup {
  office?: string;
  numbers: Array<{ text: string; tel: string; note?: string }>;
}

/* One result card. `body` is one paragraph per entry. */
export interface FundingCard {
  id: string;
  title: string;
  body: string[];
  /*
   * The official page the card rests on (outward, new tab), or a Liivv page
   * (same tab). A card with nothing to link to has none.
   */
  link?: { label: string; href: string; external: boolean };
  /** The program's phone numbers, where its official page prints them. */
  phones?: FundingPhoneGroup[];
  /** ISO date the card's source was last checked. */
  verifiedOn?: string;
  /** The check was partial: say so under the date. */
  confirm?: boolean;
  tone: 'primary' | 'supporting' | 'caution';
}

/* A run of cards under one heading, or none. */
export interface FundingCardGroup {
  key: string;
  heading?: string;
  /** A line under the heading, said once for the whole group. */
  intro?: string;
  cards: FundingCard[];
}

/*
 * Generic so each call site keeps its own value type — this is what lets the
 * checker avoid casting `string` back to the union on every change handler.
 */
export function RadioRow<T extends string>({
  legend,
  hint,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  hint?: string;
  name: string;
  options: Array<{ value: T; label: string }>;
  value: T | '';
  onChange: (next: T) => void;
}) {
  return (
    <fieldset className="oc-fund-field">
      <legend>{legend}</legend>
      {hint ? <p className="oc-fund-hint">{hint}</p> : null}
      <div className="oc-fund-choices">
        {options.map((option) => (
          <label
            className={value === option.value ? 'oc-fund-choice is-on' : 'oc-fund-choice'}
            key={option.value}
          >
            <input
              checked={value === option.value}
              name={name}
              onChange={() => onChange(option.value)}
              type="radio"
              value={option.value}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/*
 * How much of the picture the reader has filled in. The checker answers as
 * soon as it has the one required answer, so without this the first result
 * would look final over a column of untouched questions.
 */
export function CheckerProgress({
  answered,
  total,
  label,
  state,
}: {
  answered: number;
  total: number;
  /** "2 of 6 answered", in the page language. */
  label: string;
  /** "Answer the rest to narrow this" or "All answered". */
  state: string;
}) {
  return (
    <div className="oc-fund-progress">
      <span className="oc-fund-progress-bar">
        <span style={{ width: `${(answered / total) * 100}%` }} />
      </span>
      <span className="oc-fund-progress-text">
        {label} · {state}
      </span>
    </div>
  );
}

/* A card's phone numbers, one office per line, each number a tel: link. */
export function PhoneList({ phones, label }: { phones: FundingPhoneGroup[]; label: string }) {
  return (
    <ul aria-label={label} className="oc-fund-phones">
      {phones.map((group) => (
        <li key={`${group.office ?? ''}${group.numbers[0]?.tel ?? ''}`}>
          {group.office ? `${group.office}: ` : null}
          {group.numbers.map((number, index) => (
            <span key={`${number.tel}${number.text}`}>
              {index ? ' · ' : null}
              <a href={`tel:${number.tel}`}>{number.text}</a>
              {number.note ? ` (${number.note})` : null}
            </span>
          ))}
        </li>
      ))}
    </ul>
  );
}

function CardLink({ link }: { link: NonNullable<FundingCard['link']> }) {
  if (!link.external) return <a href={link.href}>{link.label}</a>;

  return (
    <a href={link.href} rel="noopener noreferrer" target="_blank">
      {link.label} ↗
    </a>
  );
}

/*
 * The cards, under their group headings. A card carries the date its source
 * was last checked, and says so plainly where that check was only partial.
 */
export function FundingCardGroups({
  groups,
  verifiedOn,
  confirm,
  phonesLabel = '',
}: {
  groups: FundingCardGroup[];
  /** "Checked against the official page on {date}", in the page language. */
  verifiedOn: (date: string) => string;
  /** "Partly confirmed. Check with the program…", in the page language. */
  confirm: string;
  /** "Phone numbers", the accessible name of a card's phone list, in the page language. */
  phonesLabel?: string;
}) {
  return (
    <div className="oc-fund-groups">
      {groups.map((group) => (
        <div className="oc-fund-group" key={group.key}>
          {group.heading ? <h3 className="oc-fund-group-heading">{group.heading}</h3> : null}
          {group.intro ? <p className="oc-fund-group-intro">{group.intro}</p> : null}
          <ul className="oc-fund-cards">
            {group.cards.map((card) => (
              <li className={`oc-fund-card is-${card.tone}`} key={card.id}>
                <h4>{card.title}</h4>
                {card.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {card.phones?.length ? (
                  <PhoneList label={phonesLabel} phones={card.phones} />
                ) : null}
                {card.link ? <CardLink link={card.link} /> : null}
                {card.verifiedOn ? (
                  <p className="oc-fund-verified">{verifiedOn(card.verifiedOn)}</p>
                ) : null}
                {card.verifiedOn && card.confirm ? (
                  <p className="oc-fund-confirm">{confirm}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* Consecutive cards of the same group, under that group's heading (and intro, if it has one). */
export function groupCards(
  cards: Array<FundingCard & { group: string }>,
  heading: (group: string) => string | undefined,
  intro: (group: string) => string | undefined = () => undefined,
): FundingCardGroup[] {
  const runs: Array<{ group: string; cards: FundingCard[] }> = [];

  cards.forEach((card) => {
    const last = runs[runs.length - 1];

    if (last && last.group === card.group) last.cards.push(card);
    else runs.push({ group: card.group, cards: [card] });
  });

  /* A group can come round twice (Liivv's own cards open and close the list), so the key counts. */
  return runs.map((run, index) => ({
    key: `${run.group}-${index}`,
    heading: heading(run.group),
    intro: intro(run.group),
    cards: run.cards,
  }));
}
