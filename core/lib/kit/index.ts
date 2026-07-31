export { generateKitId } from './generate-kit-id';
export { assignKitIdsToCartLines, formatKitPackingStaffNotes } from './match-lines';
export { appendKitToSession, getKitSession } from './session';
export {
  isCuratedKitFromProductConnection,
  isCuratedKitProduct,
  KIT_TYPE_CURATED,
  KIT_TYPE_FIELD,
} from './is-curated-kit';
export type { KitItem, KitRecord, KitSession } from './types';
