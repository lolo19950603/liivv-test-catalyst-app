type CartSelectedOption = {
  __typename?: string;
  name?: string;
  value?: string;
  number?: number;
  text?: string;
  date?: { utc: string };
};

/** BigCommerce packs this option as "Quantity", but it is unit of measure (e.g. Box of 24). */
export function formatProductOptionDisplayName(name: string): string {
  return name.trim().toLowerCase() === 'quantity' ? 'UOM' : name;
}

export function normalizeVariantSubtitleLabels(subtitle: string): string {
  return subtitle.replace(/(^| · )Quantity:/gi, '$1UOM:');
}

export function formatCartSelectedOptionsSubtitle(
  selectedOptions: CartSelectedOption[],
  sku?: string | null,
): string | undefined {
  const optionParts = selectedOptions
    .map((option) => {
      const name = option.name ? formatProductOptionDisplayName(option.name) : undefined;

      switch (option.__typename) {
        case 'CartSelectedMultipleChoiceOption':
        case 'CartSelectedCheckboxOption':
          return name && option.value ? `${name}: ${option.value}` : option.value;

        case 'CartSelectedNumberFieldOption':
          return name && option.number != null ? `${name}: ${option.number}` : undefined;

        case 'CartSelectedMultiLineTextFieldOption':
        case 'CartSelectedTextFieldOption':
          return name && option.text ? `${name}: ${option.text}` : option.text;

        case 'CartSelectedDateFieldOption':
          return name && option.date?.utc ? `${name}: ${option.date.utc}` : undefined;

        default:
          return undefined;
      }
    })
    .filter((part): part is string => Boolean(part?.trim()));

  const parts = [...optionParts];

  if (sku?.trim()) {
    parts.push(`SKU: ${sku.trim()}`);
  }

  return parts.length > 0 ? parts.join(' · ') : undefined;
}
