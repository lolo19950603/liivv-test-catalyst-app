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
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item .btn-loader{display:none}` +
  /* Keep label above the circle fill; hover motion stays on `.btn-fill` via initShopifyButtonFillHover. */
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item .btn-text{position:relative;z-index:1}` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item .btn-fill{z-index:0}` +
  /* Active tab is not `disabled` (Makeswift must stay clickable). Hide fill at rest like archive. */
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item.button--primary[aria-selected=true]:not(:hover):not(:focus-within) .btn-fill{display:none}` +
  /* Archive hover sets primary label to `--color-button-background` (often white here); keep dark text on the active tab. */
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item.button--primary[aria-selected=true],` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item.button--primary[aria-selected=true]:hover,` +
  `#${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item.button--primary[aria-selected=true]:focus-within{color:rgb(var(--color-button-text)) !important}` +
  `.js[data-button-hover=standard] #${FEATURED_COLLECTIONS_SECTION_ID} .tab-list .tab__item.button--primary[aria-selected=true]:hover:not([disabled],.self-button){color:rgb(var(--color-button-text)) !important;background-color:rgb(var(--color-button-background)) !important}`;
