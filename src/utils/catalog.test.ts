import { describe, expect, it } from 'vitest';
import type { CatalogItem } from '../types/index.ts';
import {
  NO_FILTERS, catalogItemPath, categoriesOf, featuredItem, filterCatalog, formatDuration, gradientFor,
  parseCatalogType,
} from './catalog.ts';

function item(kind: CatalogItem['kind'], id: number, title: string, category: string): CatalogItem {
  return {
    kind, id, title, category, description: '', thumbnailPath: null, duration: null,
  };
}

const ITEMS: CatalogItem[] = [
  item('movie', 1, 'Shrek 2', 'Comedy'),
  item('series', 1, 'Strange Things', 'drama'),
  item('movie', 2, 'The Notebook', 'Drama '),
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

describe('formatDuration', () => {
  it('shows minutes and seconds, and hours only for long videos', () => {
    expect(formatDuration(125)).toBe('2:05');
    expect(formatDuration(59)).toBe('0:59');
    expect(formatDuration(3725)).toBe('1:02:05');
  });

  it('shows nothing when the duration is unknown', () => {
    expect(formatDuration(null)).toBe('');
    expect(formatDuration(0)).toBe('');
  });
});

describe('landing page helpers', () => {
  it('features the newest item that has a thumbnail', () => {
    const withImage = { ...item('movie', 1, 'Old', ''), thumbnailPath: '/thumbnails/a.jpg' };
    expect(featuredItem([withImage, item('movie', 5, 'New', '')])).toBe(withImage);
    expect(featuredItem([item('movie', 1, 'A', ''), item('series', 3, 'B', '')])?.title).toBe('B');
    expect(featuredItem([])).toBeNull();
  });

  it('links movies to the player and series to their seasons', () => {
    expect(catalogItemPath(item('movie', 2, 'M', ''))).toBe('/watch/2');
    expect(catalogItemPath(item('series', 2, 'S', ''))).toBe('/series/2/seasons');
  });

  it('gives the same title the same gradient', () => {
    expect(gradientFor('Shrek 2')).toBe(gradientFor('Shrek 2'));
    expect(gradientFor('Shrek 2')).toMatch(/^from-/);
  });
});
