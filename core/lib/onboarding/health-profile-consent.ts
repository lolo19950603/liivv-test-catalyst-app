/**
 * Express consent for keeping and using health-profile answers.
 *
 * What people tell us on the health profile and on the landing quiz is health
 * information about them, so it is only kept and used after they tick a box
 * that says so in plain words. This module is the one place that describes
 * that tick: the field it arrives in, the record written for it, and how that
 * record is read back.
 *
 * Where the record lives. `health_profiles.notes` already holds a JSON object
 * (`{ category_responses: … }`), so the consent record sits beside the answers
 * as a second key in that same object. That needs no new column, no migration,
 * and it rewrites nothing that is already on file: a row saved before this
 * existed simply carries no `consent` key, which reads as "not given".
 *
 * What a tick covers. The wording people read scopes the tick to the answers
 * on the page in front of them, so each record carries `covers` — the answer
 * keys it was given for. A landing quiz can add answers to a profile that
 * already holds others; the fresh tick covers only the new ones, earlier ticks
 * are kept in `consent_history` and still cover what they covered, and answers
 * no tick covers stay on file untouched and are not used, apart from the one
 * carve-out described below.
 *
 * Taking it back. Saving the health profile with the box unticked records a
 * withdrawal in `consent_withdrawn`. The answers are left exactly where they
 * are — nothing here deletes anything — but while a withdrawal is in force no
 * answer counts as covered, so nothing personalizes from them. Ticking the box
 * again on a later save writes a newer consent record, which outranks the
 * withdrawal by date and covers only the answers on that page; the earlier
 * ticks are not revived, because they were withdrawn.
 *
 * The one carve-out. `healthAnswersSafetyReferralApplies` below reads one
 * stored answer whatever the tick says, because the only thing it does is take
 * a shopping step away (D16). Every sentence this repo shows a customer or a
 * staff member about "nothing uses your answers" has to leave room for it, so
 * the carve-out lives here beside the consent it is an exception to rather
 * than in the code that happens to consume it.
 *
 * Pure module — no server-only imports — so the form, the quiz and the server
 * actions can all agree on the field name and the wording version.
 */

import { getRawCategoryResponses, parseHealthProfileNotes } from './health-profile-display';

/** Checkbox name and value. The value is checked, so an empty box never counts. */
export const HEALTH_ANSWERS_CONSENT_FIELD = 'health_answers_consent';
export const HEALTH_ANSWERS_CONSENT_VALUE = 'granted';

/** Hidden field carrying the locale whose consent wording the person read. */
export const HEALTH_ANSWERS_CONSENT_LOCALE_FIELD = 'health_answers_consent_locale';

/**
 * Bump this whenever the consent wording changes in a way that changes what
 * someone is agreeing to. Old records keep their own version, so it stays
 * possible to say which words each person saw.
 */
export const HEALTH_ANSWERS_CONSENT_VERSION = '2026-09-express-v1';

/**
 * Returned by the server actions instead of a sentence, so the client can show
 * the refusal in the reader's own language. The English message is the fallback
 * for anything that shows `error` without looking at `code`.
 */
export const HEALTH_ANSWERS_CONSENT_REQUIRED_CODE = 'health_answers_consent_required';
export const HEALTH_ANSWERS_CONSENT_REQUIRED_MESSAGE =
  'Please tick the box that lets Liivv keep and use your health answers.';

/*
 * Returned when an unticked save withdrew a consent that was already on file.
 * It is an outcome, not a refusal: the withdrawal was written down.
 *
 * The English sentence is the untranslated fallback for the localized
 * `Account.HealthProfile.consent.withdraw.done`, which is what the form
 * actually renders off the code above. It carries the same safety carve-out as
 * that string and has to keep carrying it: `healthAnswersSafetyReferralApplies`
 * below reads a reported recent body or fit change whatever the tick says, so
 * "we have stopped using them" is only true with the exception named.
 */
export const HEALTH_ANSWERS_CONSENT_WITHDRAWN_CODE = 'health_answers_consent_withdrawn';
export const HEALTH_ANSWERS_CONSENT_WITHDRAWN_MESSAGE =
  'Consent withdrawn. Your answers stay on your health profile, and we have stopped using them to personalize what you see. One safety rule still applies: if you told us your body or the fit of your pouching system has changed recently, we keep pointing you to your NSWOC instead of to products. Nothing else on this page was saved.';

export type HealthAnswersConsentSource = 'health_profile_form' | 'landing_quiz';

/** The answers as they sit in `notes.category_responses`. */
export type StoredHealthAnswers = Record<string, string | string[] | boolean | null>;

export interface HealthAnswersConsent {
  granted: boolean;
  /** The wording version the person agreed to. */
  version: string;
  /** ISO timestamp of the tick. */
  grantedAt: string;
  source: HealthAnswersConsentSource;
  /** Locale of the wording they read, when it is known. */
  locale: string | null;
  /**
   * The answer keys this tick was given for — the ones on the page the person
   * read before ticking. A tick never reaches back over answers already on
   * file from an earlier visit: those keep whatever consent they were given.
   */
  covers: string[];
}

/*
 * A tick taken back. It carries no `covers`, because a withdrawal is not
 * partial: while it is in force it silences every earlier tick on the row.
 */
export interface HealthAnswersWithdrawal {
  withdrawn: true;
  /** The wording version the person read when they took it back. */
  version: string;
  /** ISO timestamp of the withdrawal. */
  withdrawnAt: string;
  source: HealthAnswersConsentSource;
  locale: string | null;
}

function trimmedOrNull(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed;
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/* De-duplicated, trimmed answer keys. Anything that is not a list reads as none. */
function normalizeCoverKeys(value: unknown): string[] {
  if (!isUnknownArray(value)) {
    return [];
  }

  const keys = value
    .map((entry) => trimmedOrNull(entry))
    .filter((key): key is string => key !== null);

  return [...new Set(keys)];
}

/*
 * Builds the record written beside the answers when the box arrives ticked.
 * `covers` is the keys of the answers the person saw on the page they ticked,
 * and it is the only thing the record ever speaks for.
 */
export function buildHealthAnswersConsent(input: {
  source: HealthAnswersConsentSource;
  covers: readonly string[];
  locale?: string | null;
  now?: Date;
}): HealthAnswersConsent {
  return {
    granted: true,
    version: HEALTH_ANSWERS_CONSENT_VERSION,
    grantedAt: (input.now ?? new Date()).toISOString(),
    source: input.source,
    locale: trimmedOrNull(input.locale),
    covers: normalizeCoverKeys([...input.covers]),
  };
}

/*
 * Builds the record written when someone saves with the box unticked after a
 * tick is already on file. Nothing is removed by it; it only stops use.
 */
export function buildHealthAnswersWithdrawal(input: {
  source: HealthAnswersConsentSource;
  locale?: string | null;
  now?: Date;
}): HealthAnswersWithdrawal {
  return {
    withdrawn: true,
    version: HEALTH_ANSWERS_CONSENT_VERSION,
    withdrawnAt: (input.now ?? new Date()).toISOString(),
    source: input.source,
    locale: trimmedOrNull(input.locale),
  };
}

/* True only when the box arrived ticked, with the value this module set. */
export function isHealthAnswersConsentTicked(formData: FormData): boolean {
  return formData
    .getAll(HEALTH_ANSWERS_CONSENT_FIELD)
    .some((value) => value === HEALTH_ANSWERS_CONSENT_VALUE);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readSource(value: unknown): HealthAnswersConsentSource {
  if (value === 'landing_quiz') {
    return 'landing_quiz';
  }

  return 'health_profile_form';
}

/*
 * Reads a granted consent record out of a stored or decoded value. Anything
 * that is not an explicit `granted: true` reads as no consent at all.
 */
export function readHealthAnswersConsentRecord(value: unknown): HealthAnswersConsent | null {
  if (!isRecord(value) || value.granted !== true) {
    return null;
  }

  return {
    granted: true,
    version: trimmedOrNull(value.version) ?? 'unknown',
    grantedAt: trimmedOrNull(value.grantedAt) ?? '',
    source: readSource(value.source),
    locale: trimmedOrNull(value.locale),
    covers: normalizeCoverKeys(value.covers),
  };
}

/*
 * Every granted tick stored with a profile, oldest first: the earlier records
 * kept in `consent_history`, then the most recent one in `consent`. A record
 * that is missing, withdrawn or malformed is simply not in the list.
 */
export function readHealthAnswersConsentRecords(notes: unknown): HealthAnswersConsent[] {
  const payload = parseHealthProfileNotes(notes);

  if (!payload) {
    return [];
  }

  const history = isUnknownArray(payload.consent_history) ? payload.consent_history : [];

  return [...history, payload.consent]
    .map((entry) => readHealthAnswersConsentRecord(entry))
    .filter((record): record is HealthAnswersConsent => record !== null);
}

/* The most recent consent stored beside a customer's answers, or null. */
export function readHealthAnswersConsent(notes: unknown): HealthAnswersConsent | null {
  return readHealthAnswersConsentRecords(notes).at(-1) ?? null;
}

/* Whether any tick at all is on file for this row. */
export function hasHealthAnswersConsent(notes: unknown): boolean {
  return readHealthAnswersConsent(notes) !== null;
}

/*
 * The withdrawal stored with a profile, whether or not it is still in force.
 * Staff see this one, so a later re-consent does not erase the fact that
 * someone once took their consent back.
 */
export function readHealthAnswersWithdrawalRecord(notes: unknown): HealthAnswersWithdrawal | null {
  const payload = parseHealthProfileNotes(notes);
  const value = payload?.consent_withdrawn;

  if (!isRecord(value) || value.withdrawn !== true) {
    return null;
  }

  return {
    withdrawn: true,
    version: trimmedOrNull(value.version) ?? 'unknown',
    withdrawnAt: trimmedOrNull(value.withdrawnAt) ?? '',
    source: readSource(value.source),
    locale: trimmedOrNull(value.locale),
  };
}

/*
 * Whether a withdrawal outranks every tick on the row. Timestamps are ISO
 * strings written by the same server clock, so they compare as text. A tick
 * with no readable date loses to a withdrawal, which is the safe way round.
 */
export function isHealthAnswersWithdrawn(notes: unknown): boolean {
  const withdrawal = readHealthAnswersWithdrawalRecord(notes);

  if (!withdrawal) {
    return false;
  }

  const latest = readHealthAnswersConsent(notes);

  if (!latest) {
    return true;
  }

  return withdrawal.withdrawnAt >= latest.grantedAt;
}

/*
 * The answer keys this profile's ticks actually speak for, oldest tick first.
 * A withdrawal in force silences all of them: the answers stay on file, but
 * none of them is available to anything that personalizes.
 */
export function consentedAnswerKeys(notes: unknown): string[] {
  if (isHealthAnswersWithdrawn(notes)) {
    return [];
  }

  const keys = readHealthAnswersConsentRecords(notes).flatMap((record) => record.covers);

  return [...new Set(keys)];
}

/*
 * The stored answers the person agreed Liivv could keep and use. Answers on
 * file that no tick covers are left out — they stay in the row, and they still
 * show on the person's own profile, but nothing is allowed to act on them.
 */
export function consentedCategoryResponses(notes: unknown): StoredHealthAnswers {
  const covered = new Set(consentedAnswerKeys(notes));

  if (covered.size === 0) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(getRawCategoryResponses(notes)).filter(([key]) => covered.has(key)),
  );
}

/*
 * The single answer that is read whether or not a tick covers it, and whether
 * or not a withdrawal is in force: a reported recent body or fit change.
 *
 * D16 takes "Shop this path", "Shop ostomy essentials" and "Ask a pharmacist"
 * away from someone in that situation and points them at an NSWOC instead.
 * Gating that on consent would fail the wrong way — every profile stored
 * before the box existed carries no tick, and those are exactly the people who
 * would get the shop steering back — so it fails safe and is read raw.
 *
 * It is exported so the dashboard that applies the rule and the staff page
 * that has to describe it agree on one definition, and so the wording on both
 * can say "except this" rather than claiming a blanket that is not true.
 */
export function healthAnswersSafetyReferralApplies(notes: unknown): boolean {
  return getRawCategoryResponses(notes).ostomy_journey_stage === 'body_change';
}

/* Whether a consent record in hand is usable. Null and withdrawn both fail. */
export function isHealthAnswersConsentGranted(
  consent: HealthAnswersConsent | null | undefined,
): consent is HealthAnswersConsent {
  return consent?.granted === true;
}

/*
 * The history to store beside a fresh tick: every earlier tick, trimmed to the
 * keys no newer tick covers and that are still stored. Nothing loses coverage,
 * each covered key keeps the date and wording version of the tick that actually
 * covered it, and the list cannot grow past the number of answer keys however
 * often someone re-ticks.
 *
 * Ticks given before a withdrawal are not carried over at all. The person took
 * them back, so a later tick speaks only for the answers it was given for.
 */
function buildConsentHistory(
  existingNotes: unknown,
  next: HealthAnswersConsent,
  storedKeys: Set<string>,
): HealthAnswersConsent[] {
  if (isHealthAnswersWithdrawn(existingNotes)) {
    return [];
  }

  const covered = new Set(next.covers);
  // Walked newest first, so each key is attributed to the most recent tick that
  // covered it and `covered` grows as older records are trimmed against it.
  const newestFirst = readHealthAnswersConsentRecords(existingNotes)
    .reverse()
    .reduce<HealthAnswersConsent[]>((kept, record) => {
      const covers = record.covers.filter((key) => !covered.has(key) && storedKeys.has(key));

      if (covers.length === 0) {
        return kept;
      }

      covers.forEach((key) => covered.add(key));

      return [...kept, { ...record, covers }];
    }, []);

  return newestFirst.reverse();
}

/*
 * The JSON to store in `health_profiles.notes` when a page writes answers with
 * a fresh tick.
 *
 * `answers: 'merge'` (the default) is the landing quiz, which adds answers to a
 * profile that may already hold others: those are kept exactly as they are —
 * D21 forbids altering stored data — and keep the consent they came with, or
 * none. `answers: 'replace'` is the health-profile form, which rebuilds the
 * whole answer set from one submission, so a category the person removed is
 * gone from the row rather than quietly merged back in.
 *
 * Either way the fresh tick is recorded as covering only the answers it arrived
 * with, the ones on the page the person read, and any earlier withdrawal is
 * left in place for the record — the newer tick simply outranks it by date.
 */
export function buildHealthAnswersNotes(input: {
  existingNotes: unknown;
  newResponses: StoredHealthAnswers;
  consent: HealthAnswersConsent;
  answers?: 'merge' | 'replace';
}): string {
  const consent: HealthAnswersConsent = {
    ...input.consent,
    covers: normalizeCoverKeys(Object.keys(input.newResponses)),
  };
  const categoryResponses: StoredHealthAnswers =
    input.answers === 'replace'
      ? { ...input.newResponses }
      : { ...getRawCategoryResponses(input.existingNotes), ...input.newResponses };
  const consentHistory = buildConsentHistory(
    input.existingNotes,
    consent,
    new Set(Object.keys(categoryResponses)),
  );
  const withdrawal = readHealthAnswersWithdrawalRecord(input.existingNotes);

  return JSON.stringify({
    category_responses: categoryResponses,
    consent,
    ...(consentHistory.length > 0 ? { consent_history: consentHistory } : {}),
    ...(withdrawal ? { consent_withdrawn: withdrawal } : {}),
  });
}

/*
 * The JSON to store when someone saves the health profile with the box
 * unticked and a tick is already on file. Everything already stored is written
 * back unchanged — the answers, the latest tick and its history, all of which
 * staff and the person themselves can still read — and the withdrawal is
 * recorded beside them. From here `consentedAnswerKeys` reports nothing, so
 * the answers stop shaping anything until a newer tick is given.
 */
export function buildHealthAnswersWithdrawalNotes(input: {
  existingNotes: unknown;
  withdrawal: HealthAnswersWithdrawal;
}): string {
  const records = readHealthAnswersConsentRecords(input.existingNotes);
  const consent = records.at(-1) ?? null;
  const consentHistory = records.slice(0, -1);

  return JSON.stringify({
    category_responses: getRawCategoryResponses(input.existingNotes),
    ...(consent ? { consent } : {}),
    ...(consentHistory.length > 0 ? { consent_history: consentHistory } : {}),
    consent_withdrawn: input.withdrawal,
  });
}
