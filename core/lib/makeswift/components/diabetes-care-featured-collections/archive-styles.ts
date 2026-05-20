/** Stable id aligned with `featured_collections_gQLnyz` in `diabetes-care.html`. */
export const FEATURED_COLLECTIONS_SECTION_ID =
  'shopify-section-template--26520397447459__featured_collections_gQLnyz';

/** Inline section vars from the SingleFile export `<style>` for this slice. */
export const FEATURED_COLLECTIONS_ARCHIVE_STYLE =
  `#${FEATURED_COLLECTIONS_SECTION_ID}{--section-padding-top:72px;--section-padding-bottom:72px;--color-background:142 165 141}` +
  /* Archive `.tab-list .scroll-area { overflow-y: auto }` causes a vertical scrollbar on the tab strip. */
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .fc-tab-strip{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .fc-tab-strip::-webkit-scrollbar{display:none}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item{max-height:none}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item .btn-loader{display:none}`;
