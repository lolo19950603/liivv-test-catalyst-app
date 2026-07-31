# Create curated kits in BigCommerce

Storefront kits are **real catalog products** with:

1. Custom field: `kit_type` = `curated`
2. **Related products** = the component SKUs in the kit
3. Assigned to the target category (e.g. Shop Women's Health) and your storefront channel

When those are set, the product PDP shows the editable kit customizer and “Add kit to cart” adds the selected related products (with packing staff notes).

## First Cycle Starter Kit — Admin steps

Your API token does not currently allow creating products (`403` missing products write scope). Create the kit in **BigCommerce Admin**:

1. **Products → Add**  
   - Name: `First Cycle Starter Kit`  
   - SKU: `KIT-FIRST-CYCLE-STARTER`  
   - Type: Physical  
   - Price: sum of default component prices (or any display price)  
   - Visible: Yes  
   - Categories: **Shop Women's Health**

2. **Related products** — add these product IDs:  
   `7828, 7847, 7810, 7876, 7849, 7970, 7971, 7972`

3. **Custom fields** — add:  
   - Name: `kit_type` / Value: `curated`  
   - Name: `kit_variants` / Value: `{"7828":"WC-211157"}`  
     (component product id → locked variant SKU; omit simple products)

4. Assign the product to your storefront **channel** if using multi-storefront.

5. Open the product on the storefront — you should see the kit customizer (not the normal buy box).

## Variants / required options

Customers only change **qty** or **remove** items — no option pickers.

Per-kit locked variants are set on the **kit product** with custom field:

- Name: `kit_variants`
- Value (JSON): map of component **product ID → variant SKU** (or variant entity id)

```json
{"7828":"WC-211157","7971":"WC-265740"}
```

Another kit can map the same product to a different SKU. If a component is omitted,
the app falls back to that product’s default option value.

Example for First Cycle Starter Kit (pads → 12 Count SKU):

```json
{"7828":"WC-211157"}
```

## Script (optional, needs Products modify scope)

Keep the app’s `BIGCOMMERCE_ACCESS_TOKEN` as-is. Create a separate store API token with
**Products → modify**, and put it in `.env.local` as:

```
CATALYST_PRODUCT_EDIT_TOKEN=...
```

Catalog scripts prefer that token, then fall back to `BIGCOMMERCE_ACCESS_TOKEN`.

```bash
# Assign kit to Catalyst channel + Shop Women's Health (tree 10)
node --env-file=.env.local core/scripts/fix-kit-channel.mjs

# Or create/update the kit product
node --env-file=.env.local core/scripts/create-first-cycle-kit.mjs
```
