/** Parse DPD JSON: a single object, an array, or multiple concatenated objects. */
export function parseDpdJsonBody(text: string): unknown {
  const t = text.trim();

  if (!t) {
    return [];
  }

  try {
    return JSON.parse(t);
  } catch {
    /* multiple top-level objects without array wrapper */
  }

  if (!t.startsWith('{')) {
    return [];
  }

  const objects: unknown[] = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < t.length; i++) {
    const c = t[i];

    if (c === '{') {
      if (depth === 0) {
        start = i;
      }

      depth++;
    } else if (c === '}') {
      depth--;

      if (depth === 0) {
        const slice = t.slice(start, i + 1);

        try {
          objects.push(JSON.parse(slice));
        } catch {
          return [];
        }
      }
    }
  }

  if (objects.length === 0) {
    return [];
  }

  return objects.length === 1 ? objects[0] : objects;
}

export function normalizeDrugProductPayload(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data as Record<string, unknown>[];
  }

  if (data && typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const o = data as Record<string, unknown>;

    if (Array.isArray(o.drug_product)) {
      return o.drug_product as Record<string, unknown>[];
    }

    if (o.drug_code != null || o.brand_name != null) {
      return [o];
    }
  }

  return [];
}
