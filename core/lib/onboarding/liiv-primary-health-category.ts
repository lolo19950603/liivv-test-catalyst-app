export type InterestFlags = {
  diabetes: boolean;
  ostomy: boolean;
  catheter: boolean;
  wound: boolean;
  respiratory: boolean;
};

/** Stable slugs stored in `profiles.care_interests` (one or more selections per customer). */
export const LIIV_PRIMARY_HEALTH_CATEGORIES = [
  {
    id: 'diabetes_care_everyday',
    label: 'Diabetes Care and Everyday Living',
    shortLabel: 'Diabetes Care',
    imageEmoji: '🩸',
    pageLink: '',
    image: '',
  },
  {
    id: 'ostomy_care_everyday',
    label: 'Ostomy Care & Everyday Living',
    shortLabel: 'Ostomy Care',
    imageEmoji: '🩹',
    pageLink: '',
    image: '',
  },
  {
    id: 'womens_health_wellness',
    label: "Women's Health and Wellness",
    shortLabel: "Women's Health",
    imageEmoji: '🌸',
    pageLink: '',
    image: '',
  },
  {
    id: 'sleep_rest',
    label: 'Sleep and Rest',
    shortLabel: 'Sleep + Rest',
    imageEmoji: '🌙',
    pageLink: '',
    image: '',
  },
  {
    id: 'healing_advanced_wound',
    label: 'Healing & Advanced Wound Care',
    shortLabel: 'Wound Care',
    imageEmoji: '🧴',
    pageLink: '',
    image: '',
  },
  {
    id: 'minor_ailment_on',
    label: 'Minor Ailment (Ontario only)',
    shortLabel: 'Minor Ailment',
    ontarioOnly: true,
    imageEmoji: '💊',
    pageLink: '',
    image: '',
  },
  {
    id: 'personal_care_confidence',
    label: 'Personal Care & Confidence',
    shortLabel: 'Personal Care',
    imageEmoji: '✨',
    pageLink: '',
    image: '',
  },
  {
    id: 'breathing_lung_health',
    label: 'Breathing & Lung Health',
    shortLabel: 'Lung Health',
    imageEmoji: '🫁',
    pageLink: '',
    image: '',
  },
  {
    id: 'heart_blood_pressure',
    label: 'Heart & Blood Pressure',
    shortLabel: 'Heart Health',
    imageEmoji: '❤️',
    pageLink: '',
    image: '',
  },
  {
    id: 'skin_health_relief',
    label: 'Skin Health & Relief',
    shortLabel: 'Skin Health',
    imageEmoji: '🧼',
    pageLink: '',
    image: '',
  },
  {
    id: 'daily_nutrition_fuel',
    label: 'Daily Nutrition & Fuel',
    shortLabel: 'Nutrition',
    imageEmoji: '🥗',
    pageLink: '',
    image: '',
  },
] as const;

export type LiivPrimaryCategoryId = (typeof LIIV_PRIMARY_HEALTH_CATEGORIES)[number]['id'];
export type LiivPrimaryCategoryWithRank = {
  id: LiivPrimaryCategoryId;
  rank: number;
};

const PRIMARY_IDS = new Set(
  LIIV_PRIMARY_HEALTH_CATEGORIES.map((c) => c.id),
);

/** Previous Catalyst-style interest keys → new primary slug (best-effort for existing rows). */
const LEGACY_INTEREST_TO_PRIMARY: Record<string, LiivPrimaryCategoryId> = {
  ostomy: 'ostomy_care_everyday',
  wound: 'healing_advanced_wound',
  respiratory: 'breathing_lung_health',
};
const RANK_DELIMITER = '::';

function clampRank(rank: number | null | undefined): number {
  if (typeof rank !== 'number' || !Number.isFinite(rank)) return 1;
  return Math.max(1, Math.min(99, Math.round(rank)));
}

export function encodeRankedCareInterest(id: LiivPrimaryCategoryId, rank: number): string {
  return `${id}${RANK_DELIMITER}${clampRank(rank)}`;
}

export function parseRankedCareInterest(raw: string): LiivPrimaryCategoryWithRank | null {
  const value = raw.trim().toLowerCase();
  if (!value) return null;
  const [base, rankRaw] = value.split(RANK_DELIMITER);
  if (!base) return null;
  const mappedBase = isLiivPrimaryCategoryId(base) ? base : LEGACY_INTEREST_TO_PRIMARY[base];
  if (!mappedBase) return null;
  if (rankRaw == null || rankRaw.trim() === '') {
    return {id: mappedBase, rank: 1};
  }
  const parsedRank = parseInt(rankRaw, 10);
  return {id: mappedBase, rank: clampRank(parsedRank)};
}

export function isLiivPrimaryCategoryId(value: string): value is LiivPrimaryCategoryId {
  return PRIMARY_IDS.has(value as LiivPrimaryCategoryId);
}

/**
 * Maps stored `care_interests` to current category ids (deduped). Legacy Catalyst keys become new slugs where possible.
 */
export function resolveInitialHealthCategories(
  careInterests: string[] | null | undefined,
): LiivPrimaryCategoryId[] {
  return resolveInitialHealthCategoriesWithRank(careInterests).map((row) => row.id);
}

export function resolveInitialHealthCategoriesWithRank(
  careInterests: string[] | null | undefined,
): LiivPrimaryCategoryWithRank[] {
  if (!careInterests?.length) return [];
  const out = new Map<LiivPrimaryCategoryId, number>();
  for (const raw of careInterests) {
    const parsed = parseRankedCareInterest(raw);
    if (!parsed) continue;
    const prev = out.get(parsed.id);
    if (typeof prev === 'number') {
      out.set(parsed.id, Math.min(prev, parsed.rank));
    } else {
      out.set(parsed.id, parsed.rank);
    }
  }
  return [...out.entries()]
    .map(([id, rank]) => ({id, rank}))
    .sort((a, b) => a.rank - b.rank);
}

export function resolveInitialHealthCategoryRanking(
  careInterests: string[] | null | undefined,
): Record<LiivPrimaryCategoryId, number> {
  const out = {} as Record<LiivPrimaryCategoryId, number>;
  for (const row of resolveInitialHealthCategoriesWithRank(careInterests)) {
    out[row.id] = row.rank;
  }
  return out;
}

/**
 * Maps the new primary category to legacy vertical flags so existing PHI sections still show where relevant.
 */
export function primaryCategoryToInterestFlags(primary: string): InterestFlags {
  const p = primary.trim().toLowerCase();
  return {
    diabetes: p === 'diabetes_care_everyday',
    ostomy: p === 'ostomy_care_everyday',
    catheter: false,
    wound: p === 'healing_advanced_wound',
    respiratory: p === 'breathing_lung_health',
  };
}

/** Merges legacy vertical flags for all selected Liiv categories (OR). */
export function primaryCategoriesToInterestFlags(categories: string[]): InterestFlags {
  const merged: InterestFlags = {
    diabetes: false,
    ostomy: false,
    catheter: false,
    wound: false,
    respiratory: false,
  };
  for (const c of categories) {
    const f = primaryCategoryToInterestFlags(c);
    merged.diabetes ||= f.diabetes;
    merged.ostomy ||= f.ostomy;
    merged.catheter ||= f.catheter;
    merged.wound ||= f.wound;
    merged.respiratory ||= f.respiratory;
  }
  return merged;
}

export function filterCategoriesForRegion(
  categories: typeof LIIV_PRIMARY_HEALTH_CATEGORIES,
  options: {isOntario: boolean},
) {
  return categories.filter((c) => !('ontarioOnly' in c && c.ontarioOnly) || options.isOntario);
}

/** Ontario storefront address: Shopify `zoneCode` is typically `ON`. */
export function isOntarioZoneCode(zoneCode: string | null | undefined): boolean {
  if (!zoneCode?.trim()) return false;
  const z = zoneCode.trim().toUpperCase();
  return z === 'ON' || z === 'ONTARIO';
}

export function isPrimaryCategoryAllowedForCustomer(
  primary: string,
  options: {isOntario: boolean},
): boolean {
  const p = primary.trim().toLowerCase();
  if (!isLiivPrimaryCategoryId(p)) return false;
  const row = LIIV_PRIMARY_HEALTH_CATEGORIES.find((c) => c.id === p);
  if (!row) return false;
  if ('ontarioOnly' in row && row.ontarioOnly) return options.isOntario;
  return true;
}

export function getPrimaryCategoryDisplay(id: LiivPrimaryCategoryId) {
  const row = LIIV_PRIMARY_HEALTH_CATEGORIES.find((category) => category.id === id);

  if (!row) {
    return {
      id,
      label: 'Wellness',
      shortLabel: 'Wellness',
      subtitle: 'Products, treatment, or everyday wellness support.',
      pageLink: '',
      image: '',
    };
  }

  return {
    id: row.id,
    label: row.label,
    shortLabel: row.shortLabel,
    subtitle: 'Products, treatment, or everyday wellness support.',
    emoji: row.imageEmoji,
    pageLink: row.pageLink,
    image: row.image,
  };
}

export function getCategoryPageLink(
  id: LiivPrimaryCategoryId,
  fallback = '',
): string {
  const row = LIIV_PRIMARY_HEALTH_CATEGORIES.find((category) => category.id === id);
  const link = row?.pageLink?.trim();
  return link || fallback;
}

