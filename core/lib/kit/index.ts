export { generateKitId } from './generate-kit-id';
export { assignKitIdsToCartLines, formatKitPackingStaffNotes } from './match-lines';
export { appendKitToSession, getKitSession } from './session';
export {
  isCuratedKitFromProductConnection,
  isCuratedKitProduct,
  KIT_TYPE_CURATED,
  KIT_TYPE_FIELD,
} from './is-curated-kit';
export {
  getKitVariantOverride,
  KIT_VARIANTS_FIELD,
  parseKitVariantOverrides,
  parseKitVariantOverridesFromConnection,
} from './kit-variants';
export type { KitVariantOverrideMap } from './kit-variants';
export { resolveKitComponentVariantSelection } from './resolve-kit-variant';
export type {
  KitComponentVariantSelection,
  KitSelectedMultipleChoice,
} from './resolve-kit-variant';
export type { KitItem, KitRecord, KitSession } from './types';
