import type { ProductOptionSelection } from '~/lib/bigcommerce/product-options';

interface CartSelectedOption {
  entityId: number;
  valueEntityId?: number | null;
}

export function mapCartSelectedOptionsToProductOptions(
  selectedOptions: CartSelectedOption[],
): ProductOptionSelection[] {
  return selectedOptions
    .filter((option): option is CartSelectedOption & { valueEntityId: number } => {
      return option.valueEntityId != null && !Number.isNaN(Number(option.valueEntityId));
    })
    .map((option) => ({
      optionEntityId: Number(option.entityId),
      valueEntityId: Number(option.valueEntityId),
    }))
    .filter(
      (option) => !Number.isNaN(option.optionEntityId) && !Number.isNaN(option.valueEntityId),
    );
}
