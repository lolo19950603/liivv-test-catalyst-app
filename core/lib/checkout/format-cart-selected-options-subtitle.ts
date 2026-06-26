type CartSelectedOption = {
  __typename?: string;
  name?: string;
  value?: string;
  number?: number;
  text?: string;
  date?: { utc: string };
};

export function formatCartSelectedOptionsSubtitle(
  selectedOptions: CartSelectedOption[],
  sku?: string | null,
): string | undefined {
  const optionParts = selectedOptions
    .map((option) => {
      switch (option.__typename) {
        case 'CartSelectedMultipleChoiceOption':
        case 'CartSelectedCheckboxOption':
          return option.name && option.value ? `${option.name}: ${option.value}` : option.value;

        case 'CartSelectedNumberFieldOption':
          return option.name && option.number != null
            ? `${option.name}: ${option.number}`
            : undefined;

        case 'CartSelectedMultiLineTextFieldOption':
        case 'CartSelectedTextFieldOption':
          return option.name && option.text ? `${option.name}: ${option.text}` : option.text;

        case 'CartSelectedDateFieldOption':
          return option.name && option.date?.utc
            ? `${option.name}: ${option.date.utc}`
            : undefined;

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
