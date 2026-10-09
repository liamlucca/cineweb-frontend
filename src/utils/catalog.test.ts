import { describe, expect, it } from 'vitest';
import type { CatalogItem } from '../types/index.ts';
import {
  NO_FILTERS, categoriesOf, filterCatalog, parseCatalogType,
} from './catalog.ts';

const ITEMS: CatalogItem[] = [
  {
    kind: 'movie', id: 1, title: 'Shrek 2', category: 'Comedy',
  },
  {
    kind: 'series', id: 1, title: 'Strange Things', category: 'drama',
  },
  {
    kind: 'movie', id: 2, title: 'The Notebook', category: 'Drama ',
  },
];

describe('catalog utilities', () => {
  it('lists each category once, ignoring case and spaces', () => {
    expect(categoriesOf(ITEMS)).toEqual([
      { key: 'comedy', label: 'Comedy' },
      { key: 'drama', label: 'drama' },
    ]);
  });

  it('filters by category key', () => {
    const result = filterCatalog(ITEMS, { ...NO_FILTERS, category: 'drama' });
    expect(result.map((item) => item.title)).toEqual(['Strange Things', 'The Notebook']);
  });

  it('filters by type and title text together', () => {
    const result = filterCatalog(ITEMS, { query: 'the', type: 'movie', category: '' });
    expect(result.map((item) => item.title)).toEqual(['The Notebook']);
  });

  it('returns everything with no filters', () => {
    expect(filterCatalog(ITEMS, NO_FILTERS)).toHaveLength(3);
  });

  it('ignores an unknown type in the URL', () => {
    expect(parseCatalogType('series')).toBe('series');
    expect(parseCatalogType('cartoons')).toBe('all');
    expect(parseCatalogType(null)).toBe('all');
  });
});
