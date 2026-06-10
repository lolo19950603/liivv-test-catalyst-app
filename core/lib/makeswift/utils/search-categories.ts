export type CategoryComboboxOption = {
  id: string;
  label: string;
  value: string;
};

export async function searchCategories(query?: string): Promise<CategoryComboboxOption[]> {
  try {
    const params = new URLSearchParams();

    if (query != null && query.trim().length > 0) {
      params.set('q', query.trim());
    }

    const response = await fetch(`/api/categories/search?${params.toString()}`);

    if (!response.ok) {
      return [];
    }

    const data: unknown = await response.json();

    if (
      data != null &&
      typeof data === 'object' &&
      'status' in data &&
      data.status === 'success' &&
      'options' in data &&
      Array.isArray(data.options)
    ) {
      return data.options as CategoryComboboxOption[];
    }

    return [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching category options:', error);

    return [];
  }
}
