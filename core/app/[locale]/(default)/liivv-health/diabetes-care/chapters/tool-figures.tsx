'use client';

/*
 * =============================================================================
 * YOUR TOOLS — THE CHAPTER'S OWN FIGURES
 * =============================================================================
 * Five of this site's figure kinds, registered with the rest in
 * ./site-figures.tsx: the meter picker (card 2, held), the sensor picker
 * (card 4), the restock calculator (card 6), the rotation map (card 10) and
 * the "My pump" picker (card 13). Structure comes from chapters-meta.ts and the
 * device facts from ./device-pairings.ts; every word comes from the
 * DiabetesCare messages: the card's `figure` messages, and `ui.sensorPicker`,
 * `ui.pumpPicker` and `ui.meterMatch` for the source line under each fact.
 * Device names are structural and never translated.
 *
 * Each picker is a set of radio buttons, one per device, with nothing picked
 * at first; picking one shows what fits it, and a status line says which is
 * shown. Every pairing and fact line says who confirms it and which register
 * entries it rests on. A sensor's recall notice (`notice.everywhere` in
 * ./device-pairings.ts) is shown wherever the sensor is named: in the sensor
 * picker, under it in the pump picker's sensor lists, and under its preset in
 * the calculator. With JavaScript off, and before the page hydrates,
 * every device's entry is in the page, each in its own closed disclosure, so
 * find-in-page reaches all of them. The pickers remember the device picked for
 * the rest of the tab (sessionStorage), and nothing else.
 *
 * The calculator does arithmetic and nothing more: it stores nothing, sends
 * nothing and knows nothing about coverage. With JavaScript off it is the
 * rule and a worked example.
 *
 * On /fr each waits on its own French review gate (review-gates.ts), and the
 * card falls back to its own sentences. No product, price, shop link or cart
 * action appears in any of them, and none reads a number back as advice.
 * =============================================================================
 */

import { createTranslator, useLocale, useTranslations } from 'next-intl';
import { type ReactNode, useEffect, useId, useState } from 'react';

import type { CategoryCard } from '../../_microsite/chapters/compose';
import { FrDraftMarker, OutboundLabel } from '../../_microsite/chapters/figure-parts';
import { localeHref } from '../../_microsite/chapters/hrefs';
import { useSite } from '../../_microsite/site-context';

import type { FigureMeta } from './chapters-meta';
import {
  METER_FAMILIES,
  NOT_CONFIRMED,
  type Pairing,
  PAIRINGS,
  type PumpEntry,
  PUMPS,
  type SensorEntry,
  SENSORS,
} from './device-pairings';
import { entry, text } from './figure-words';
import { SOURCE_META, type SourceId } from './sources-meta';

import './tool-figures.css';

type MeterMatch = Extract<FigureMeta, { kind: 'meterMatch' }>;
type PumpPicker = Extract<FigureMeta, { kind: 'pumpPicker' }>;
type RestockCalc = Extract<FigureMeta, { kind: 'restockCalc' }>;
type RotationMap = Extract<FigureMeta, { kind: 'rotationMap' }>;

/*
 * A `figure` message with ICU arguments ("Up to {days} days"), filled in for
 * the page locale. The card's figure messages reach a site figure as they are
 * (`card.figureWords`), so they are formatted here rather than by a
 * namespace's `t`. A missing message stays empty.
 */
function useFill() {
  const locale = useLocale();

  return (message: string, values: Record<string, string | number>) =>
    message ? createTranslator({ locale, messages: { message } })('message', values) : '';
}

/*
 * The register titles of some sources, in the page locale, as one line. French
 * puts a space before the semicolon, as it does before the colon of "Sources :".
 */
function useSourceTitles() {
  const locale = useLocale();

  return (ids: readonly SourceId[]) =>
    ids
      .map((id) => {
        const source = SOURCE_META[id];

        return locale === 'fr' && source.labelFr ? source.labelFr : source.label;
      })
      .join(locale === 'fr' ? ' ; ' : '; ');
}

/* "Source: …" under a fact, from the picker's own `sources` line. */
function SourceLine({ line }: { line: string }) {
  return line ? <span className="dc-fig-device-src">{line}</span> : null;
}

const sensorOf = (id: string) => SENSORS.find((sensor) => sensor.id === id);
const pumpOf = (id: string) => PUMPS.find((pump) => pump.id === id);

/* How the sensor picker names a pump, in the page locale (`pairedName`). */
const pairedNameOf = (pump: PumpEntry, locale: string) =>
  (locale === 'fr' ? pump.pairedNameFr : undefined) ?? pump.pairedName ?? pump.name;

/*
 * A sensor's recall notice where the sensor is named outside the sensor
 * picker, worded from that card's own `figure.notices`, with its sources.
 * Nothing for a sensor with no notice, or with one only the sensor picker shows.
 */
function EverywhereNotice({
  sensor,
  sources,
  words,
}: {
  sensor: SensorEntry | undefined;
  sources: (ids: readonly SourceId[]) => string;
  words: unknown;
}) {
  const notice = sensor?.notice?.everywhere ? sensor.notice : undefined;
  const line = notice ? text(entry(words, 'notices'), notice.key) : '';

  return notice && line ? (
    <span className="dc-fig-device-notice">
      <span>{line}</span>
      <SourceLine line={sources(notice.sources)} />
    </span>
  ) : null;
}

/* ------------------------------------------------------------------------- */
/* The picker                                                                 */
/* ------------------------------------------------------------------------- */

interface PickerOption {
  id: string;
  name: string;
  /* A second line under the name, such as "For MiniMed 780G". */
  sub?: string;
}

/*
 * Radio buttons in a fieldset, then a status line, then the entry of the
 * device picked, which ends with where the facts come from. Native radios, so
 * the arrow keys move between devices and each name is its own label. Before
 * hydration and with JavaScript off, every entry instead, each in a closed
 * <details> under its device's name.
 */
function DevicePicker({
  className,
  entryFor,
  from,
  gate,
  legend,
  options,
  status,
  statusNone,
  storageKey,
}: {
  className: string;
  entryFor: (id: string) => ReactNode;
  from: string;
  gate: string;
  legend: string;
  options: PickerOption[];
  status: (option: PickerOption) => string;
  statusNone: string;
  storageKey?: string;
}) {
  const name = useId();
  const [ready, setReady] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const option = options.find((candidate) => candidate.id === picked);
  /* The ids as one string, so the effect below re-runs only if the devices change. */
  const ids = options.map((candidate) => candidate.id).join('\n');

  useEffect(() => {
    setReady(true);

    if (!storageKey) return;

    try {
      const saved = window.sessionStorage.getItem(storageKey);

      if (saved && ids.split('\n').includes(saved)) setPicked(saved);
    } catch {
      // Storage can be blocked; the picker simply starts empty.
    }
  }, [ids, storageKey]);

  const pick = (id: string) => {
    setPicked(id);

    if (!storageKey) return;

    try {
      window.sessionStorage.setItem(storageKey, id);
    } catch {
      // Not remembered, which changes nothing on the page.
    }
  };

  const label = (candidate: PickerOption) => (
    <span className="dc-fig-picker-name">
      {candidate.name}
      {candidate.sub ? <span className="dc-fig-picker-sub">{candidate.sub}</span> : null}
    </span>
  );

  return (
    <div className={`dc-fig-picker ${className}`}>
      <FrDraftMarker gate={gate} />

      {ready ? (
        <>
          <fieldset className="dc-fig-picker-set">
            <legend className="dc-fig-picker-legend">{legend}</legend>
            <div className="dc-fig-picker-options">
              {options.map((candidate) => (
                <label className="dc-fig-picker-option" key={candidate.id}>
                  <input
                    checked={picked === candidate.id}
                    name={name}
                    onChange={() => pick(candidate.id)}
                    type="radio"
                    value={candidate.id}
                  />
                  {label(candidate)}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="oc-fig-steps-status dc-fig-picker-status" role="status">
            {option ? status(option) : statusNone}
          </p>
          {option ? (
            <div className="dc-fig-picker-panel">
              <h4 className="dc-fig-picker-heading">{label(option)}</h4>
              {entryFor(option.id)}
              {from ? <p className="oc-fig-detail dc-fig-picker-from">{from}</p> : null}
            </div>
          ) : null}
        </>
      ) : (
        <>
          <p className="dc-fig-picker-legend">{legend}</p>
          <div className="dc-fig-picker-all">
            {options.map((candidate) => (
              <details className="dc-fig-picker-entry" key={candidate.id}>
                <summary>{label(candidate)}</summary>
                {entryFor(candidate.id)}
              </details>
            ))}
          </div>
          {from ? <p className="oc-fig-detail dc-fig-picker-from">{from}</p> : null}
        </>
      )}
    </div>
  );
}

/*
 * One pairing as a picker lists it: the other device's name, then who
 * confirms the pairing, the maker's own caveat where there is one, and its
 * sources.
 */
function PairingLine({
  children,
  name,
  pairing,
  sources,
  words,
}: {
  children?: ReactNode;
  name: string;
  pairing: Pairing;
  sources: string;
  words: unknown;
}) {
  const caveat = pairing.caveat ? text(entry(words, 'caveats'), pairing.caveat) : '';

  return (
    <li>
      <b className="dc-fig-device-what">{name}</b>
      <span className={`dc-fig-device-basis is-${pairing.basis}`}>
        {text(entry(words, 'basis'), pairing.basis)}
      </span>
      {caveat ? <span className="dc-fig-device-caveat">{caveat}</span> : null}
      <SourceLine line={sources} />
      {children}
    </li>
  );
}

/* ------------------------------------------------------------------------- */
/* The sensor picker                                                          */
/* ------------------------------------------------------------------------- */

/*
 * One sensor: how long it is worn, the pumps it is confirmed with (each with
 * its basis), the pumps no Canadian source we checked confirms, and its notice
 * in a neutral callout. A wear time no registered page gives says so.
 */
function SensorEntryView({ sensor, words }: { sensor: SensorEntry; words: unknown }) {
  const t = useTranslations('DiabetesCare.ui.sensorPicker');
  const locale = useLocale();
  const fill = useFill();
  const titles = useSourceTitles();
  const sources = (ids: readonly SourceId[]) =>
    ids.length ? t('sources', { count: ids.length, titles: titles(ids) }) : '';
  const pairings = PAIRINGS.filter((pairing) => pairing.sensor === sensor.id);
  const unconfirmed = NOT_CONFIRMED.filter((pair) => pair.sensor === sensor.id).flatMap((pair) => {
    const pump = pumpOf(pair.pump);

    return pump ? [pairedNameOf(pump, locale)] : [];
  });
  const { wear } = sensor;
  let wearLine = text(words, 'wearNotConfirmed');

  if (wear) {
    wearLine =
      wear.graceHours === undefined
        ? fill(text(words, 'wearUpTo'), { days: wear.upToDays })
        : fill(text(words, 'wearDays'), { days: wear.upToDays, hours: wear.graceHours });
  }

  const notice = sensor.notice ? text(entry(words, 'notices'), sensor.notice.key) : '';

  return (
    <>
      <dl className="dc-fig-device">
        <dt>{text(words, 'wear')}</dt>
        <dd>
          <span>{wearLine}</span>
          {wear?.fromAge === undefined ? null : (
            <span className="dc-fig-device-age">
              {fill(text(words, 'fromAge'), { age: wear.fromAge })}
            </span>
          )}
          <SourceLine line={wear ? sources(wear.sources) : ''} />
        </dd>
        <dt>{text(words, 'pumps')}</dt>
        <dd>
          {pairings.length ? (
            <ul className="dc-fig-device-list">
              {pairings.map((pairing) => {
                const pump = pumpOf(pairing.pump);

                return (
                  <PairingLine
                    key={pairing.pump}
                    name={pump ? pairedNameOf(pump, locale) : pairing.pump}
                    pairing={pairing}
                    sources={sources(pairing.sources)}
                    words={words}
                  />
                );
              })}
            </ul>
          ) : (
            <span>{text(words, 'noPumps')}</span>
          )}
          {unconfirmed.length ? (
            <p className="dc-fig-device-unconfirmed">
              {fill(text(words, 'notConfirmed'), { pumps: unconfirmed.join(', ') })}
            </p>
          ) : null}
        </dd>
      </dl>
      {notice && sensor.notice ? (
        <p className="dc-fig-device-notice">
          <span>{notice}</span>
          <SourceLine line={sources(sensor.notice.sources)} />
        </p>
      ) : null}
    </>
  );
}

/* Your Tools card 4: pick a sensor, see how long it is worn and what it pairs with. */
export function SensorPickerFigure({ card }: { card: CategoryCard }) {
  const { storage } = useSite();
  const fill = useFill();
  const words = card.figureWords;
  const forPump = text(words, 'forPump');

  return (
    <DevicePicker
      className="dc-fig-sensors"
      entryFor={(id) => {
        const sensor = sensorOf(id);

        return sensor ? <SensorEntryView sensor={sensor} words={words} /> : null;
      }}
      from={text(words, 'fromMaker')}
      gate="sensorPicker"
      legend={text(words, 'legend')}
      options={SENSORS.map((sensor) => {
        const pump = sensor.forPump ? pumpOf(sensor.forPump) : undefined;

        return {
          id: sensor.id,
          name: sensor.name,
          ...(pump ? { sub: fill(forPump, { pump: pump.name }) } : {}),
        };
      })}
      status={(option) => fill(text(words, 'status'), { sensor: option.name })}
      statusNone={text(words, 'statusNone')}
      storageKey={storage.modules.sensorPicker}
    />
  );
}

/* ------------------------------------------------------------------------- */
/* The "My pump" picker                                                       */
/* ------------------------------------------------------------------------- */

/*
 * One pump: the sensors it is confirmed with, read from the same pairings as
 * the sensor picker; what its maker says about its supplies; and what no
 * registered page confirms, as questions to take to the maker or to Liivv's
 * pharmacist CDE, with the link to ask one.
 */
function PumpEntryView({
  figure,
  pump,
  words,
}: {
  figure: PumpPicker;
  pump: PumpEntry;
  words: unknown;
}) {
  const t = useTranslations('DiabetesCare.ui.pumpPicker');
  const locale = useLocale();
  const fill = useFill();
  const titles = useSourceTitles();
  const sources = (ids: readonly SourceId[]) =>
    ids.length ? t('sources', { count: ids.length, titles: titles(ids) }) : '';
  const pairings = PAIRINGS.filter((pairing) => pairing.pump === pump.id);
  const unconfirmed = NOT_CONFIRMED.filter((pair) => pair.pump === pump.id).flatMap((pair) => {
    const sensor = sensorOf(pair.sensor);

    return sensor ? [sensor] : [];
  });
  const factLines = entry(words, 'factLines');
  const questions = entry(words, 'openQuestions');

  return (
    <>
      <dl className="dc-fig-device">
        <dt>{text(words, 'sensors')}</dt>
        <dd>
          {pairings.length || unconfirmed.length ? (
            <ul className="dc-fig-device-list">
              {pairings.map((pairing) => {
                const sensor = sensorOf(pairing.sensor);

                return (
                  <PairingLine
                    key={pairing.sensor}
                    name={sensor?.name ?? pairing.sensor}
                    pairing={pairing}
                    sources={sources(pairing.sources)}
                    words={words}
                  >
                    <EverywhereNotice sensor={sensor} sources={sources} words={words} />
                  </PairingLine>
                );
              })}
              {unconfirmed.map((sensor) => (
                <li className="dc-fig-device-unconfirmed" key={sensor.id}>
                  <span>{fill(text(words, 'notConfirmedSensor'), { sensor: sensor.name })}</span>
                  <EverywhereNotice sensor={sensor} sources={sources} words={words} />
                </li>
              ))}
            </ul>
          ) : (
            <span>{text(words, 'noSensors')}</span>
          )}
        </dd>
        {pump.facts.length ? (
          <>
            <dt>{text(words, 'facts')}</dt>
            <dd>
              <ul className="dc-fig-device-list">
                {pump.facts.map((fact) => (
                  <li key={fact.key}>
                    <span>{fill(text(factLines, fact.key), { ...fact.values })}</span>
                    <SourceLine line={sources(fact.sources)} />
                  </li>
                ))}
              </ul>
            </dd>
          </>
        ) : null}
        {pump.openQuestions.length ? (
          <>
            <dt>{text(words, 'notConfirmedHeading')}</dt>
            <dd>
              <span>{text(words, 'openQuestionsLead')}</span>
              <ul className="dc-fig-device-list is-questions">
                {pump.openQuestions.map((key) => (
                  <li key={key}>{text(questions, key)}</li>
                ))}
              </ul>
            </dd>
          </>
        ) : null}
      </dl>
      <p className="oc-fig-lane-link dc-fig-device-ask">
        <a href={localeHref(figure.askHref, locale)} hrefLang={figure.askHrefLang}>
          <OutboundLabel hrefLang={figure.askHrefLang} label={t('askCde')} />
        </a>
      </p>
    </>
  );
}

/* Your Tools card 13: pick a pump, see the sensors it works with and what fits it. */
export function PumpPickerFigure({ card, figure }: { card: CategoryCard; figure: PumpPicker }) {
  const { storage } = useSite();
  const fill = useFill();
  const words = card.figureWords;

  return (
    <DevicePicker
      className="dc-fig-pumps"
      entryFor={(id) => {
        const pump = pumpOf(id);

        return pump ? <PumpEntryView figure={figure} pump={pump} words={words} /> : null;
      }}
      from={text(words, 'fromMaker')}
      gate="pumpPicker"
      legend={text(words, 'legend')}
      options={PUMPS.map((pump) => ({ id: pump.id, name: pump.name }))}
      status={(option) => fill(text(words, 'status'), { pump: option.name })}
      statusNone={text(words, 'statusNone')}
      storageKey={storage.modules.pumpPicker}
    />
  );
}

/* ------------------------------------------------------------------------- */
/* The meter picker (held)                                                    */
/* ------------------------------------------------------------------------- */

/*
 * Your Tools card 2, held as `meterData` (chapters-meta.ts): the composer
 * drops it from every page until the hold is lifted, and its words are not
 * sent to the browser. Pick a meter, and see its test strips, its lancing
 * device and lancets, and its control solution, each with what a registered
 * page says, or that nothing here confirms it yet.
 */
export function MeterMatchFigure({ card }: { card: CategoryCard; figure: MeterMatch }) {
  const t = useTranslations('DiabetesCare.ui.meterMatch');
  const fill = useFill();
  const titles = useSourceTitles();
  const words = card.figureWords;
  const sources = (ids: readonly SourceId[]) =>
    ids.length ? t('sources', { count: ids.length, titles: titles(ids) }) : '';
  const notConfirmed = text(words, 'notConfirmed');
  const options = METER_FAMILIES.flatMap((family) =>
    family.meters.map((meter) => ({ id: `${family.id}:${meter}`, name: meter })),
  );

  const row = (label: string, value: string, ids: readonly SourceId[]) => (
    <>
      <dt>{label}</dt>
      <dd>
        <span>{value || notConfirmed}</span>
        <SourceLine line={value ? sources(ids) : ''} />
      </dd>
    </>
  );

  return (
    <DevicePicker
      className="dc-fig-meters"
      entryFor={(id) => {
        const family = METER_FAMILIES.find((candidate) => id.startsWith(`${candidate.id}:`));

        if (!family) return null;

        return (
          <dl className="dc-fig-device">
            {row(
              text(words, 'strips'),
              family.strips ? family.strips.products.join(', ') : '',
              family.strips?.sources ?? [],
            )}
            {row(
              text(words, 'lancing'),
              family.lancing
                ? fill(text(words, 'inBox'), { products: family.lancing.inBox.join(', ') })
                : '',
              family.lancing?.sources ?? [],
            )}
            {row(
              text(words, 'control'),
              family.control
                ? fill(text(words, family.control.fact), { product: family.control.product })
                : '',
              family.control?.sources ?? [],
            )}
          </dl>
        );
      }}
      from={text(words, 'fromMaker')}
      gate="meterMatch"
      legend={text(words, 'legend')}
      options={options}
      status={(option) => fill(text(words, 'status'), { meter: option.name })}
      statusNone={text(words, 'statusNone')}
    />
  );
}

/* ------------------------------------------------------------------------- */
/* The restock calculator                                                     */
/* ------------------------------------------------------------------------- */

const OTHER = 'other';

/* A whole number from `min` (1 unless given) to `max`, or null for anything else. */
function wholeUpTo(value: string, max: number, min = 1) {
  const trimmed = value.trim();

  if (!/^\d+$/.test(trimmed)) return null;

  const number = Number(trimmed);

  return number >= min && number <= max ? number : null;
}

/*
 * A number box with a button either side, one less and one more (owner note
 * 3, 2026-10-07: tap rather than type). The box stays the labelled control
 * and can still be typed in; the buttons name what they change, and are off
 * at the ends of the range, or with the box when a preset fills it in. From
 * an empty or unreadable box, "one more" starts at the least the box takes
 * (1 sensor, not 0) and "one less" at the least.
 */
function Stepper({
  id,
  label,
  value,
  onChange,
  min,
  max,
  fixed = false,
  less,
  more,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  min: number;
  max: number;
  /* A preset fills the box in: read-only, and the buttons off. */
  fixed?: boolean;
  less: string;
  more: string;
}) {
  const current = /^\d+$/.test(value.trim()) ? Number(value.trim()) : null;
  const step = (by: 1 | -1) => {
    if (current === null) {
      onChange(String(by > 0 ? Math.max(min, 1) : min));

      return;
    }

    onChange(String(Math.min(max, Math.max(min, current + by))));
  };

  return (
    <div className="dc-fig-restock-field">
      <label htmlFor={id}>{label}</label>
      <div className="dc-fig-stepper">
        <button
          aria-controls={id}
          aria-label={less}
          disabled={fixed || (current !== null && current <= min)}
          onClick={() => step(-1)}
          type="button"
        >
          <span aria-hidden>−</span>
        </button>
        <input
          id={id}
          inputMode="numeric"
          max={max}
          min={min}
          onChange={(event) => onChange(event.target.value)}
          readOnly={fixed}
          step={1}
          type="number"
          value={value}
        />
        <button
          aria-controls={id}
          aria-label={more}
          disabled={fixed || (current !== null && current >= max)}
          onClick={() => step(1)}
          type="button"
        >
          <span aria-hidden>+</span>
        </button>
      </div>
    </div>
  );
}

/*
 * Your Tools card 6. Sensors you have, times the days each is worn, as days
 * and a date; with days to cover, how many sensors that takes and how many
 * more. A preset fills in its sensor's "up to" wear time (and says that a
 * grace period is not counted, and shows its sensor's recall notice where it
 * has one); "another sensor" takes the days as typed.
 * Nothing is picked at first but "another sensor", so no brand is put forward.
 *
 * One tap for each answer (owner note 3, 2026-10-07): the sensor is a row of
 * radio pills, the days and the sensors are steppers, and the days to cover
 * are chips (`figure.coverPresets`, or another number, or none). The chips
 * are periods to count, not a device fact; the only wear times are the
 * presets', from ./device-pairings.ts.
 *
 * Results are read out as they change. Anything that is not a whole number in
 * range shows the one line that says what is allowed, and no result. Nothing
 * is stored or sent, and nothing is compared with what a program covers.
 */
export function RestockCalcFigure({ card, figure }: { card: CategoryCard; figure: RestockCalc }) {
  const t = useTranslations('DiabetesCare.ui.sensorPicker');
  const locale = useLocale();
  const fill = useFill();
  const titles = useSourceTitles();
  const sources = (ids: readonly SourceId[]) =>
    ids.length ? t('sources', { count: ids.length, titles: titles(ids) }) : '';
  const base = useId();
  const words = card.figureWords;
  const [ready, setReady] = useState(false);
  const [sensor, setSensor] = useState(OTHER);
  const [typedDays, setTypedDays] = useState('');
  const [have, setHave] = useState('');
  const [coverChoice, setCoverChoice] = useState('none');
  const [cover, setCover] = useState('');
  const presets = figure.presets.flatMap((id) => {
    const known = sensorOf(id);

    return known?.wear ? [{ id, name: known.name, days: known.wear.upToDays }] : [];
  });
  const preset = presets.find((candidate) => candidate.id === sensor);
  const days = preset ? String(preset.days) : typedDays;

  useEffect(() => setReady(true), []);

  /* Starting from none is a real case: then the answer is just how many to get. */
  const sensors = wholeUpTo(have, figure.maxSensors, 0);
  const each = wholeUpTo(days, figure.maxDays);
  const coverPreset = figure.coverPresets.find((option) => String(option) === coverChoice);
  const typedCover =
    coverChoice === OTHER && cover.trim() ? wholeUpTo(cover, figure.maxCover) : undefined;
  const coverDays = coverPreset ?? typedCover;
  const invalid =
    (have.trim() !== '' && sensors === null) ||
    (days.trim() !== '' && each === null) ||
    coverDays === null;
  const lines: string[] = [];

  if (!invalid && sensors !== null && each !== null) {
    const total = sensors * each;
    const until = new Date();

    until.setDate(until.getDate() + total);

    if (sensors > 0) {
      lines.push(
        fill(text(words, 'result'), {
          count: sensors,
          days: total,
          date: new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(until),
        }),
      );
    }

    if (coverDays !== undefined) {
      const need = Math.ceil(coverDays / each);
      const more = Math.max(0, need - sensors);

      lines.push(
        more > 0
          ? fill(text(words, 'needMore'), { cover: coverDays, need, more })
          : fill(text(words, 'enough'), { cover: coverDays }),
      );
    }
  }

  if (!ready) {
    return (
      <div className="dc-fig-restock">
        <FrDraftMarker gate="restockCalc" />
        <p className="dc-fig-restock-nojs">{text(words, 'noJs')}</p>
      </div>
    );
  }

  const field = (key: string) => `${base}-${key}`;
  const daysLabel = text(words, 'daysLabel');
  const haveLabel = text(words, 'haveLabel');
  const sensorOptions = [
    ...presets.map((candidate) => ({ value: candidate.id, label: candidate.name })),
    { value: OTHER, label: text(words, 'otherSensor') },
  ];
  const coverOptions = [
    { value: 'none', label: text(words, 'coverNone') },
    ...figure.coverPresets.map((option) => ({
      value: String(option),
      label: fill(text(words, 'coverDays'), { days: option }),
    })),
    { value: OTHER, label: text(words, 'coverOther') },
  ];
  const pills = (
    name: string,
    legend: string,
    options: Array<{ value: string; label: string }>,
    value: string,
    onChange: (next: string) => void,
  ) => (
    <fieldset className="dc-fig-picker-set dc-fig-restock-set">
      <legend className="dc-fig-picker-legend">{legend}</legend>
      <div className="dc-fig-picker-options">
        {options.map((option) => (
          <label className="dc-fig-picker-option" key={option.value}>
            <input
              checked={value === option.value}
              name={field(name)}
              onChange={() => onChange(option.value)}
              type="radio"
              value={option.value}
            />
            <span className="dc-fig-picker-name">{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="dc-fig-restock">
      <FrDraftMarker gate="restockCalc" />
      <form className="dc-fig-restock-form" onSubmit={(event) => event.preventDefault()}>
        {pills('sensor', text(words, 'sensorLabel'), sensorOptions, sensor, setSensor)}
        <Stepper
          fixed={preset !== undefined}
          id={field('days')}
          label={daysLabel}
          less={fill(text(words, 'less'), { field: daysLabel })}
          max={figure.maxDays}
          min={1}
          more={fill(text(words, 'more'), { field: daysLabel })}
          onChange={setTypedDays}
          value={days}
        />
        <Stepper
          id={field('have')}
          label={haveLabel}
          less={fill(text(words, 'less'), { field: haveLabel })}
          max={figure.maxSensors}
          min={0}
          more={fill(text(words, 'more'), { field: haveLabel })}
          onChange={setHave}
          value={have}
        />
        <div className="dc-fig-restock-cover">
          {pills('cover', text(words, 'coverLabel'), coverOptions, coverChoice, setCoverChoice)}
          {coverChoice === OTHER ? (
            <div className="dc-fig-restock-field">
              <label htmlFor={field('cover')}>{text(words, 'coverOtherLabel')}</label>
              <input
                id={field('cover')}
                inputMode="numeric"
                max={figure.maxCover}
                min={1}
                onChange={(event) => setCover(event.target.value)}
                step={1}
                type="number"
                value={cover}
              />
            </div>
          ) : null}
        </div>
      </form>
      {preset ? <p className="oc-fig-detail">{text(words, 'graceNote')}</p> : null}
      {preset ? (
        <EverywhereNotice sensor={sensorOf(preset.id)} sources={sources} words={words} />
      ) : null}
      <div aria-live="polite" className="dc-fig-restock-result" role="status">
        {invalid ? <p className="is-invalid">{text(words, 'invalid')}</p> : null}
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* The rotation map                                                           */
/* ------------------------------------------------------------------------- */

/* Where each zone's label sits, clockwise from the top left. */
const ZONE_AT = [
  { x: 84, y: 40 },
  { x: 236, y: 40 },
  { x: 236, y: 172 },
  { x: 84, y: 172 },
] as const;

/*
 * Your Tools card 10: one injection area as a rounded block, with the belly
 * button at its centre and a dashed circle around it to keep clear of, split
 * into four zones labelled by week. The first zone is shaded, with three
 * injection points a finger width apart. Decoration, hidden from assistive
 * technology: the heading, the keep-clear line and the caption carry the
 * words, and the card's own list carries every fact. Server-rendered and
 * static; nothing to press.
 */
export function RotationMapFigure({ card, figure }: { card: CategoryCard; figure: RotationMap }) {
  const words = card.figureWords;
  const zones = entry(words, 'zones');
  const centre = text(words, 'centre');
  const caption = text(words, 'caption');

  return (
    <figure className="dc-fig-rotate">
      <FrDraftMarker gate="rotationMap" />
      <figcaption className="oc-fig-heading">{text(words, 'heading')}</figcaption>
      <svg aria-hidden className="dc-fig-rotate-map" focusable="false" viewBox="0 0 320 212">
        <rect className="dc-fig-rotate-area" height="196" rx="28" width="304" x="8" y="8" />
        <path className="dc-fig-rotate-current" d="M160 8H36A28 28 0 0 0 8 36V106H160Z" />
        <line className="dc-fig-rotate-split" x1="160" x2="160" y1="8" y2="204" />
        <line className="dc-fig-rotate-split" x1="8" x2="312" y1="106" y2="106" />
        <circle className="dc-fig-rotate-clear" cx="160" cy="106" r="34" />
        <circle className="dc-fig-rotate-navel" cx="160" cy="106" r="4" />
        {[52, 76, 100].map((x) => (
          <circle className="dc-fig-rotate-dot" cx={x} cy="78" key={x} r="4" />
        ))}
        {ZONE_AT.slice(0, figure.zones).map((at, index) => (
          <text className="dc-fig-rotate-label" key={`${at.x}-${at.y}`} x={at.x} y={at.y}>
            {text(zones, String(index + 1))}
          </text>
        ))}
      </svg>
      {centre ? (
        <p className="dc-fig-rotate-centre">
          <span aria-hidden className="dc-fig-rotate-key" />
          {centre}
        </p>
      ) : null}
      {caption ? <p className="oc-fig-detail">{caption}</p> : null}
    </figure>
  );
}
