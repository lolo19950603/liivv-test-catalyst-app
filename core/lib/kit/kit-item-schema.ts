import { z } from 'zod';

export const kitSelectedOptionsSchema = z.object({
  multipleChoices: z.array(
    z.object({
      optionEntityId: z.number().int().positive(),
      optionValueEntityId: z.number().int().positive(),
    }),
  ),
});

export const kitItemSchema = z.object({
  productEntityId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  name: z.string().min(1),
  sku: z.string().optional(),
  variantEntityId: z.number().int().positive().optional(),
  selectedOptions: kitSelectedOptionsSchema.optional(),
});

export type KitItemInput = z.infer<typeof kitItemSchema>;
