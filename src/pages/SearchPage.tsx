import { Link, useSearchParams } from "react-router-dom"
import SearchBar from "../components/SearchBar.tsx"
import ContentCard from "../components/ContentCard.tsx"
import CardSkeleton from "../components/CardSkeleton.tsx"
import useCatalog from "../hooks/useCatalog.ts"
import type { CatalogFilters } from "../types/index.ts"
import { categoriesOf, filterCatalog, parseCatalogType } from "../utils/catalog.ts"
import useDocumentTitle from "../hooks/useDocumentTitle.ts"

function SearchPage() {
  //explanation of useSearchParams is at the bottom
  const [searchParams, setSearchParams] = useSearchParams()
  // the filters live in the URL, so a search can be shared and "Back" works
  const filters: CatalogFilters = {
    query: searchParams.get('q') ?? '',
    type: parseCatalogType(searchParams.get('type')),
    category: searchParams.get('category') ?? '',
  }

  const { items, loading, error } = useCatalog()
  const categories = categoriesOf(items)
  // newest first: the highest ids were uploaded last
  const results = filterCatalog(items, filters).sort((a, b) => b.id - a.id)
  const filtering = filters.query !== '' || filters.type !== 'all' || filters.category !== ''

  // changes one filter and keeps the others
  function setFilter(name: 'type' | 'category', value: string) {
    const next = new URLSearchParams(searchParams)
    if (value === '' || value === 'all') next.delete(name)
    else next.set(name, value)
    setSearchParams(next)
  }

  const title = filters.query ? `Results for "${filters.query}"` : 'Browse movies and series'

  // browser tab title
  useDocumentTitle(filters.query ? `Search: ${filters.query}` : 'Search')

  return (
    <div className="max-w-7xl mx-auto pb-4">
      {/* key: when the text in the URL changes, the bar starts again with it */}
      <SearchBar key={filters.query} initialText={filters.query} />

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-2 px-4 mt-4">
        <select
          className="select select-sm w-auto"
          aria-label="Type"
          value={filters.type}
          onChange={(e) => setFilter('type', e.target.value)}
        >
          <option value="all">Movies and series</option>
          <option value="movie">Movies</option>
          <option value="series">Series</option>
        </select>

        <select
          className="select select-sm w-auto"
          aria-label="Category"
          value={filters.category}
          onChange={(e) => setFilter('category', e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.key} value={category.key}>{category.label}</option>
          ))}
        </select>

        {filtering && <Link to="/search" className="btn btn-sm btn-ghost">Clear filters</Link>}
      </div>

      {error && items.length > 0 && (
        <div role="alert" className="alert alert-warning mx-4 mt-4 text-sm">
          Some videos could not be loaded. {error}
        </div>
      )}

      <h1 className="text-2xl font-bold px-4 mt-6 mb-4">
        {title}
        {!loading && <span className="text-base font-normal opacity-60"> · {results.length} {results.length === 1 ? 'result' : 'results'}</span>}
      </h1>

      {loading && <CardSkeleton count={10} layout="grid" />}

      {!loading && error && items.length === 0 && (
        <div role="alert" className="alert alert-error mx-4">{error}</div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="card bg-base-200 mx-4">
          <div className="card-body items-center text-center gap-3">
            <p className="text-lg">No videos match this search.</p>
            <p className="opacity-70 text-sm">Try another title, or look at everything we have.</p>
            <Link to="/search" className="btn btn-primary btn-sm">See all videos</Link>
          </div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6 px-4">
          {results.map((item) => (
            // a movie and a series can share the same id, so the key needs the kind too
            <li key={`${item.kind}-${item.id}`}><ContentCard item={item} /></li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchPage

/*
EXPLANATION: useSearchParams.
It's a React Router hook that reads and changes the URL parameters. When someone searches "Shrek" among the series, the URL becomes /search?q=Shrek&type=series and searchParams.get('q') returns "Shrek".
*/
