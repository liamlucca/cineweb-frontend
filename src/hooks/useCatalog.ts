import { useEffect, useState } from 'react';
import type { CatalogItem } from '../types/index.ts';
import { getMovies } from '../services/movieService.ts';
import { getAllSeries } from '../services/seriesService.ts';
import { errorMessage } from '../services/api.ts';
import { movieToCatalogItem, seriesToCatalogItem } from '../utils/catalog.ts';

interface CatalogState {
  items: CatalogItem[]
  loading: boolean
  // friendly message, empty when there is no error
  error: string
}

// Movies and series together, loaded once when the component mounts
function useCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>({ items: [], loading: true, error: '' });

  useEffect(() => {
    let cancelled = false;

    // allSettled: if one list fails, the other one is still shown
    Promise.allSettled([getMovies(), getAllSeries()]).then(([movies, series]) => {
      if (cancelled) return;
      const items = [
        ...(movies.status === 'fulfilled' ? movies.value.map(movieToCatalogItem) : []),
        ...(series.status === 'fulfilled' ? series.value.map(seriesToCatalogItem) : []),
      ];
      const failed = [movies, series].find((result) => result.status === 'rejected');
      setState({
        items,
        loading: false,
        error: failed?.status === 'rejected' ? errorMessage(failed.reason) : '',
      });
    });

    return () => { cancelled = true; };
  }, []);

  return state;
}

export default useCatalog;
