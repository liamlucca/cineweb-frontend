import type {
  CatalogFilters, CatalogItem, CatalogType, MovieDTO, Series,
} from '../types/index.ts';

export const NO_FILTERS: CatalogFilters = { query: '', type: 'all', category: '' };

export function movieToCatalogItem(movie: MovieDTO): CatalogItem {
  return {
    kind: 'movie', id: movie.id, title: movie.title, category: movie.category,
  };
}

export function seriesToCatalogItem(series: Series): CatalogItem {
  return {
    kind: 'series', id: series.id, title: series.title, category: series.category,
  };
}

// "Drama", "drama " and "DRAMA" are the same category
export function categoryKey(category: string): string {
  return category.trim().toLowerCase();
}

export interface CategoryOption {
  key: string
  // spelling of the first item found with this category
  label: string
}

// Categories found in the items, without repeats, sorted by name
export function categoriesOf(items: CatalogItem[]): CategoryOption[] {
  const byKey = new Map<string, string>();
  items.forEach((item) => {
    const key = categoryKey(item.category);
    if (key && !byKey.has(key)) byKey.set(key, item.category.trim());
  });
  return [...byKey.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function filterCatalog(items: CatalogItem[], filters: CatalogFilters): CatalogItem[] {
  const query = filters.query.trim().toLowerCase();
  return items.filter((item) => (
    (filters.type === 'all' || item.kind === filters.type)
    && (filters.category === '' || categoryKey(item.category) === filters.category)
    && (query === '' || item.title.toLowerCase().includes(query))
  ));
}

// Reads a type from the URL, ignoring anything that is not a valid one
export function parseCatalogType(value: string | null): CatalogType {
  return value === 'movie' || value === 'series' ? value : 'all';
}
