const h = process.env.BIGCOMMERCE_STORE_HASH;
// Prefer write-scoped token; keep app BIGCOMMERCE_ACCESS_TOKEN unchanged.
const t = process.env.CATALYST_PRODUCT_EDIT_TOKEN || process.env.BIGCOMMERCE_ACCESS_TOKEN;
const c = Number(process.env.BIGCOMMERCE_CHANNEL_ID);

async function bc(path, init = {}) {
  const r = await fetch(`https://api.bigcommerce.com/stores/${h}${path}`, {
    ...init,
    headers: {
      'X-Auth-Token': t,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await r.text();
  let j;
  try {
    j = text ? JSON.parse(text) : null;
  } catch {
    j = text;
  }
  if (!r.ok) throw new Error(`${r.status} ${text}`);
  return j;
}

async function main() {
  let page = 1;
  let found = null;

  for (;;) {
    const res = await bc(`/v3/catalog/trees/categories?tree_id:in=10&limit=250&page=${page}`);
    for (const cat of res.data || []) {
      const path = (cat.url?.path || '').toLowerCase();
      const name = (cat.name || '').toLowerCase();
      if (
        path.includes('shop-womens-health') ||
        name.includes("women's health") ||
        name.includes('womens health')
      ) {
        found = cat;
        break;
      }
    }
    if (found || !res.meta?.pagination || page >= res.meta.pagination.total_pages) break;
    page += 1;
  }

  console.log('WOMENS CAT', JSON.stringify(found, null, 2));

  try {
    await bc('/v3/catalog/products/channel-assignments', {
      method: 'PUT',
      body: JSON.stringify([{ product_id: 8017, channel_id: c }]),
    });
    console.log('CHANNEL ASSIGN OK', c);
  } catch (e) {
    console.error('CHANNEL ASSIGN FAIL', e.message);
  }

  if (found?.category_id) {
    try {
      await bc('/v3/catalog/products/category-assignments', {
        method: 'PUT',
        body: JSON.stringify([{ product_id: 8017, category_id: found.category_id }]),
      });
      console.log('CATEGORY ASSIGN OK', found.category_id);
    } catch (e) {
      console.error('CATEGORY ASSIGN FAIL', e.message);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
