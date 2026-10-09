import { useSearchParams } from "react-router-dom"
import Section from "../components/Section.tsx"
import SearchBar from "../components/SearchBar.tsx"
import RequestStatus from "../components/RequestStatus.tsx"
import useCatalog from "../hooks/useCatalog.ts"
import type { CatalogFilters } from "../types/index.ts"
import { categoriesOf, filterCatalog, parseCatalogType } from "../utils/catalog.ts"

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
  const results = filterCatalog(items, filters)

  // changes one filter and keeps the others
  function setFilter(name: 'type' | 'category', value: string) {
    const next = new URLSearchParams(searchParams)
    if (value === '' || value === 'all') next.delete(name)
    else next.set(name, value)
    setSearchParams(next)
  }

  const title = filters.query ? `Results for: "${filters.query}"` : 'Results'

  return (
    <div>
      {/* key: when the text in the URL changes, the bar starts again with it */}
      <SearchBar key={filters.query} initialText={filters.query} />

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 px-4 mt-4">
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
      </div>

      {error && items.length > 0 && (
        <div role="alert" className="alert alert-warning mx-4 mt-4 text-sm">
          Some videos could not be loaded. {error}
        </div>
      )}

      <RequestStatus
        loading={loading}
        error={items.length === 0 ? error : ''}
        isEmpty={results.length === 0}
        emptyMessage="No videos match this search."
      >
        <Section title={title} items={results} />
      </RequestStatus>
    </div>
  )
}

export default SearchPage

/*
EXPLANATION: useSearchParams.
It's a React Router hook that reads and changes the URL parameters. When someone searches "Shrek" among the series, the URL becomes /search?q=Shrek&type=series and searchParams.get('q') returns "Shrek".
*/
