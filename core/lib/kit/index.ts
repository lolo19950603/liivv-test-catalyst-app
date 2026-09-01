export { generateKitId } from './generate-kit-id';
export { formatYourCustomKitName } from './custom-kit-name';
export { kitCompositionFingerprint } from './kit-fingerprint';
export { assignKitIdsToCartLines, formatKitPackingStaffNotes } from './match-lines';
export { resolveKitStorefront } from './resolve-kit-storefront';
export { appendKitToSession, getKitSession, removeKitItemFromSession, updateKitItemQuantity, updateKitShipQuantity } from './session';
export { saveKitsFromOrder } from './save-kits-from-order';
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
export { kitShipQuantity } from './types';
export type { KitItem, KitRecord, KitSelectedOptions, KitSession } from './types';
