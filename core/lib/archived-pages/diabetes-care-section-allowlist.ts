export const DIABETES_CARE_SECTION_OPTIONS = [
  { value: 'video_with_text_overlay_RnWXxE', label: 'Video with text overlay' },
  { value: 'custom_section_WpXaJg', label: 'Custom band (logo + heading)' },
  { value: 'number_counter_dTAx7w', label: 'Number counters' },
  { value: 'timeline_nyTDKQ', label: 'Timeline' },
  { value: 'multicolumn_JtTdUn', label: 'Multicolumn' },
  { value: 'reveal_image_with_text_iXk7GQ', label: 'Reveal image with text' },
  { value: 'rich_text_FWVbN6', label: 'Rich text (upper)' },
  { value: 'blog_posts_collage_bTyfPm', label: 'Blog posts collage' },
  { value: 'logo_list_BznDid', label: 'Logo list' },
  { value: 'featured_collections_gQLnyz', label: 'Featured collections' },
  { value: 'faq_VGRW8K', label: 'FAQ (first)' },
  { value: 'floating_product_bundle_mYaf43', label: 'Floating product bundle' },
  { value: 'rich_text_Ym7UeC', label: 'Rich text (lower)' },
  { value: 'collection_list_n3fDJ6', label: 'Collection list' },
  { value: 'faq_7B4B8U', label: 'FAQ (second)' },
  { value: 'image_with_text_overlay_7JgREg', label: 'Image with text overlay' },
] as const;

export type DiabetesCareSectionSuffix = (typeof DIABETES_CARE_SECTION_OPTIONS)[number]['value'];

export function isDiabetesCareSectionSuffix(value: string): value is DiabetesCareSectionSuffix {
  return DIABETES_CARE_SECTION_OPTIONS.some((option) => option.value === value);
}
