export interface ReorderProductOption {
  productAttributeEntityId?: number | null;
  productAttributeValueEntityId?: number | null;
}

export type ReorderSourceItem =
  | {
      kind: 'product';
      name: string;
      productEntityId: number;
      quantity: number;
      variantEntityId?: number | null;
      parentLineItemEntityId?: number | null;
      productOptions?: ReorderProductOption[];
    }
  | {
      kind: 'giftCertificate';
      name: string;
    };

export interface ReorderCartLineInput {
  quantity: number;
  productEntityId: number;
  variantEntityId?: number;
  selectedOptions?: {
    multipleChoices: Array<{
      optionEntityId: number;
      optionValueEntityId: number;
    }>;
  };
}

export interface ReorderCartLine {
  name: string;
  input: ReorderCartLineInput;
}

function positiveId(value: number | null | undefined): number | undefined {
  if (value == null || !Number.isInteger(value) || value <= 0) {
    return undefined;
  }

  return value;
}

export function toReorderCartLines(items: ReorderSourceItem[]): ReorderCartLine[] {
  return items.flatMap((item) => {
    if (item.kind === 'giftCertificate' || positiveId(item.parentLineItemEntityId) != null) {
      return [];
    }

    const productEntityId = positiveId(item.productEntityId);

    if (productEntityId == null || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      return [];
    }

    const variantEntityId = positiveId(item.variantEntityId);
    const multipleChoices =
      variantEntityId == null
        ? (item.productOptions ?? []).flatMap((option) => {
            const optionEntityId = positiveId(option.productAttributeEntityId);
            const optionValueEntityId = positiveId(option.productAttributeValueEntityId);

            if (optionEntityId == null || optionValueEntityId == null) {
              return [];
            }

            return [{ optionEntityId, optionValueEntityId }];
          })
        : [];

    return [
      {
        name: item.name,
        input: {
          productEntityId,
          quantity: item.quantity,
          ...(variantEntityId != null ? { variantEntityId } : {}),
          ...(multipleChoices.length > 0 ? { selectedOptions: { multipleChoices } } : {}),
        },
      },
    ];
  });
}
