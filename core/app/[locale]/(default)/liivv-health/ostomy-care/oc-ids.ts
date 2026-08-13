/** Shared Ostomy Care product IDs (safe for client + server). */

/** Featured curated kit — The Fresh Start (New Ostomate Starter Kit). */
export const FRESH_START_KIT_ID = 8041;

/** @deprecated Use FRESH_START_KIT_ID */
export const NEW_JOURNEY_STARTER_KIT_ID = FRESH_START_KIT_ID;

/** Featured pouch for hero float (SenSura 1-Piece Drainable Opaque). */
export const HERO_FLOAT_POUCH_ID = 4441;

/** Featured skin accessory for hero float (Adapt Barrier Rings). */
export const HERO_FLOAT_BARRIER_ID = 4560;

/** Shop Ostomy Care category. */
export const SHOP_OSTOMY_CARE_CATEGORY_ID = 1150;

/** Official CSV ostomy curated kits (category 1150). */
export const OSTOMY_CURATED_KIT_IDS = [
  8041, // The Fresh Start
  8042, // Skin Shield
  8043, // Inner Balance
  8044, // Stay Hydrated
  8045, // Leak-Free Confidence
  8046, // Everyday Living
  8047, // Little Ostomate
  8048, // Newly Diagnosed
] as const;
