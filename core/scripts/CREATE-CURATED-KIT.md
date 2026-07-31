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
   - Name: `kit_type`  
   - Value: `curated`

4. Assign the product to your storefront **channel** if using multi-storefront.

5. Open the product on the storefront — you should see the kit customizer (not the normal buy box).

## Script (optional, needs Products modify scope)

```bash
cd core
node --env-file=../.env.local scripts/create-first-cycle-kit.mjs
```

Update the API account in BigCommerce to include **Products → modify**, then re-run.
