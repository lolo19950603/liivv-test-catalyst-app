/** Shared Diabetes Care product IDs (safe for client + server). */

/** Featured curated kit — Just Diagnosed: Diabetes Day-One Starter. */
export const DAY_ONE_STARTER_KIT_ID = 8049;

/** Featured CGM for catalog pin (Dexcom G7 Sensor 1-Pack). */
export const FEATURED_CGM_ID = 4227;

/** Featured meter for catalog pin (OneTouch Verio Reflect Meter). */
export const FEATURED_METER_ID = 4287;

/** Shop Diabetes Care category. */
export const SHOP_DIABETES_CARE_CATEGORY_ID = 1151;

/** Official CSV diabetes curated kits (category 1151). */
export const DIABETES_CURATED_KIT_IDS = [
  8049, // Just Diagnosed: Diabetes Day-One Starter
  8050, // OneTouch Testing System Starter
  8051, // Contour Next Testing System Starter
  8052, // FreeStyle Libre 3 CGM Starter
  8053, // Insulin Injection Basics Kit
  8054, // Insulin Pump Supply Starter (Medtronic)
  8055, // Low-Glucose Rescue Kit
  8056, // Diabetic Foot Care Kit
  8057, // Injection & Finger-Poke Skin Comfort Kit
  8058, // Diabetes Travel & On-the-Go Kit
  8059, // Blood-Sugar Nutrition Support Kit
  8060, // Newly Diagnosed: Type 2 Diabetes Starter Kit
] as const;

/* Whether this id is one of the curated diabetes kits. */
export function isDiabetesKit(entityId: number): boolean {
  const kitIds: readonly number[] = DIABETES_CURATED_KIT_IDS;

  return kitIds.includes(entityId);
}

/*
 * The curated kits the Diabetes Care landing and the Diabetes Essentials shop
 * list. All twelve, since the owner verified them on 2026-10-07 ("Verified go
 * ahead and publish"; A4 and E6 in the landing's copy record). A kit left off
 * this list drops out of the landing's kits section, its "Kits" shop room and
 * the shop's Kits filter, as Ostomy's unlisted kits do. With none listed, the
 * landing's kits section and its hero and closing kits buttons stay off.
 */
export const DIABETES_LISTED_KIT_IDS: readonly number[] = DIABETES_CURATED_KIT_IDS;

/* Whether the Diabetes Care landing may show this curated kit. */
export function isListedDiabetesKit(entityId: number): boolean {
  return DIABETES_LISTED_KIT_IDS.includes(entityId);
}

/*
 * =============================================================================
 * Insulin and glucagon: the products a pharmacist reviews and dispenses
 * =============================================================================
 *
 * Owner answers of 2026-10-06: a pharmacist reviews and dispenses every
 * insulin and glucagon order, and it ships cold-chain (A8, B3); insulin can't
 * be ordered online for delivery in Quebec, though it can be shipped there
 * once a pharmacist has arranged it (A1, B3, B11). Glucagon is not part of the
 * Quebec rule.
 *
 * The rule, read from the BigCommerce catalogue on 2026-10-06:
 *
 *   insulin   every product in category 1116 Insulin, plus the two Trurapi
 *             products filed under 1132 Injection Aids (4719 vials, 5002
 *             cartridges)
 *   glucagon  4555 Baqsimi, the only glucagon in the catalogue (also in 1132)
 *
 * A new insulin is covered once it is filed in 1116. One filed anywhere else
 * must be added to INSULIN_PRODUCT_IDS_OUTSIDE_CATEGORY, and a new glucagon
 * to GLUCAGON_PRODUCT_IDS, or neither the product page notice nor the Quebec
 * checkout rule will know it.
 *
 * Used by the product page (the notice under the buy box) and by the checkout
 * (core/lib/checkout/quebec-insulin.ts). A cart line carries no categories,
 * so the checkout asks the catalogue for them by id first.
 */
export const INSULIN_CATEGORY_ID = 1116;

/* Insulin filed outside 1116 Insulin: the two Trurapi products (1132 Injection Aids). */
export const INSULIN_PRODUCT_IDS_OUTSIDE_CATEGORY: readonly number[] = [
  4719, // Trurapi Vials 100U/ML 1X10ML
  5002, // Trurapi Cartridges 100U/ML 5x3ML
];

/* Glucagon. */
export const GLUCAGON_PRODUCT_IDS: readonly number[] = [
  4555, // Baqsimi (glucagon nasal powder)
];

/* Whether this product is insulin, from its id and the categories it is in. */
export function isInsulinProduct({
  entityId,
  categoryIds,
}: {
  entityId: number;
  categoryIds: readonly number[];
}): boolean {
  return (
    categoryIds.includes(INSULIN_CATEGORY_ID) ||
    INSULIN_PRODUCT_IDS_OUTSIDE_CATEGORY.includes(entityId)
  );
}

/* Whether this product is glucagon. */
export function isGlucagonProduct(entityId: number): boolean {
  return GLUCAGON_PRODUCT_IDS.includes(entityId);
}

/*
 * =============================================================================
 * The Diabetes Essentials shop: filing a product the name rules get wrong
 * =============================================================================
 *
 * The shop files every product by rules over its name, its BigCommerce brand
 * and its categories (./shop-classify.ts). A product those rules file wrongly
 * is put right here, by id, and the override wins over every rule. Brand
 * values are the shop's brand slugs (`?brand=`); `null` means no brand.
 *
 * Read from the catalogue and the owner's review of 2026-10-07 (note 9):
 *   8090, 8091  the Omnipod 5 and DASH pods carry no BigCommerce brand, and
 *               are Omnipod (Insulet) pods
 *   4252        a blood-collection set, not an insulin-pump supply
 *   4775        i-Port Advance is an injection port used with pens and
 *               syringes, not a pump accessory, so it works with no device
 */
export const DIABETES_BRAND_BY_ID: Readonly<Record<number, string | null>> = {
  8090: 'omnipod',
  8091: 'omnipod',
};

export const DIABETES_TYPE_BY_ID: Readonly<Record<number, string>> = {
  4252: 'other',
};

export const DIABETES_WORKS_BY_ID: Readonly<Record<number, readonly string[]>> = {
  4775: [],
};

/*
 * Whether a shipping address's province is Quebec. Province strings are free
 * text when BigCommerce has no match for them, so this accepts the code (QC,
 * and the older PQ) and the name with or without its accent, in any case and
 * with stray spaces: "QC", "qc", "Quebec", "Québec", " QUÉBEC ".
 */
export function isQuebecProvince(stateOrProvince: string | null | undefined): boolean {
  if (!stateOrProvince) {
    return false;
  }

  const plain = stateOrProvince.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

  return plain === 'qc' || plain === 'pq' || plain === 'quebec';
}

/*
 * Whether an order may not be bought online: insulin, for delivery in Quebec.
 * Every line counts, a kit's component lines included, since they are real
 * cart lines. Strips, glucagon and everything else stay open to Quebec.
 */
export function blocksInsulinForQuebec({
  stateOrProvince,
  products,
}: {
  stateOrProvince: string | null | undefined;
  products: ReadonlyArray<{ entityId: number; categoryIds: readonly number[] }>;
}): boolean {
  return isQuebecProvince(stateOrProvince) && products.some(isInsulinProduct);
}

/*
 * =============================================================================
 * Categories that make a product health-revealing
 * =============================================================================
 *
 * Which shelves say something about a person's body rather than their taste.
 * Diabetes products sit in two separate branches of the catalogue, the same
 * way ostomy products do (see OSTOMY_ANALYTICS_CATEGORY_IDS in oc-ids.ts):
 *
 *   1151  Shop Diabetes Care             (under Liivv Health (Shop))
 *   1027  Metabolic + Glucose Support    (Liivv Your Life > Nourish + Balance)
 *   1050    Continuous Glucose Monitors (CGM)
 *   1070    Glucose Meters & Test Strips
 *   1089    Insulin Pens & Pen Needles
 *   1116      Insulin
 *   1124      Pen Needles & Syringes
 *   1132      Injection Aids
 *   1104    Insulin Pump Supplies
 *   1111    Lancets & Lancing
 *   1114    Diabetes Accessories
 *   1118      Glucose Tablets & Gels
 *   1126      Sharps Containers
 *   1134      Insulin Cooling & Carry
 *   1140      CGM & Pump Adhesives
 *   1144      Pump Accessories
 *   1147      Diabetes Aids
 *
 * Read from the BigCommerce category tree on 2026-10-05. Unlike the ostomy
 * list, this one names the whole 1027 subtree and not only its root. A
 * category page answers for its breadcrumb trail (`categoryLineageIds` in
 * core/lib/analytics/sensitive-products.ts), so the root alone would cover the
 * shelves. A cart line, a wishlist or a compare row does not: it is answered
 * from the categories the product is *in*, and BigCommerce does not return
 * their parents. Diabetes products are assigned to these sub-shelves, so each
 * one is named here. A shelf added under 1027 later must be added to this list
 * too, or those rows will not be covered.
 *
 * Used by core/lib/analytics/sensitive-products.ts. Kept here because it is a
 * list of identifiers, and identifiers live in TS meta.
 */
export const DIABETES_ANALYTICS_CATEGORY_IDS: readonly number[] = [
  SHOP_DIABETES_CARE_CATEGORY_ID,
  1027, // Metabolic + Glucose Support
  1050, // Continuous Glucose Monitors (CGM)
  1070, // Glucose Meters & Test Strips
  1089, // Insulin Pens & Pen Needles
  1116, // Insulin
  1124, // Pen Needles & Syringes
  1132, // Injection Aids
  1104, // Insulin Pump Supplies
  1111, // Lancets & Lancing
  1114, // Diabetes Accessories
  1118, // Glucose Tablets & Gels
  1126, // Sharps Containers
  1134, // Insulin Cooling & Carry
  1140, // CGM & Pump Adhesives
  1144, // Pump Accessories
  1147, // Diabetes Aids
];

/* Whether this category is one whose membership reveals something about a body. */
export function isDiabetesCategoryId(entityId: number): boolean {
  return DIABETES_ANALYTICS_CATEGORY_IDS.includes(entityId);
}

/* Whether any of these categories does. */
export function isDiabetesCategoryIds(entityIds: readonly number[]): boolean {
  return entityIds.some(isDiabetesCategoryId);
}
