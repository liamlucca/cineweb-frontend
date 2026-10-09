import { Link } from "react-router-dom"
import Section from "../components/Section.tsx"
import SearchBar from "../components/SearchBar.tsx"
import RequestStatus from "../components/RequestStatus.tsx"
import useCatalog from "../hooks/useCatalog.ts"
import { categoriesOf, categoryKey } from "../utils/catalog.ts"

function LandingPage() {
  // movies and series together (see hooks/useCatalog.ts)
  const { items, loading, error } = useCatalog()
  const categories = categoriesOf(items)

  return (
    <div>
      <SearchBar />

      {/* if only one of the two lists failed, show what did load plus a warning */}
      {error && items.length > 0 && (
        <div role="alert" className="alert alert-warning mx-4 mt-4 text-sm">
          Some videos could not be loaded. {error}
        </div>
      )}

      <RequestStatus
        loading={loading}
        error={items.length === 0 ? error : ''}
        isEmpty={items.length === 0}
        emptyMessage="There are no videos yet."
      >
        {/* quick links to search one category */}
        <div className="flex flex-wrap gap-2 px-4 mt-4">
          {categories.map((category) => (
            <Link key={category.key} to={`/search?category=${encodeURIComponent(category.key)}`} className="badge badge-outline badge-lg">
              {category.label}
            </Link>
          ))}
        </div>

        <Section title="All" items={items} />
        {/* one carousel per category */}
        {categories.map((category) => (
          <Section
            key={category.key}
            title={category.label}
            items={items.filter((item) => categoryKey(item.category) === category.key)}
          />
        ))}
      </RequestStatus>
    </div>
  )
}

export default LandingPage


/*

EXPLANATIONS

-----------------------------------

Custom hook:
useCatalog() hides how the data is fetched. The page only gets { items, loading, error } and re-renders when they change.

-----------------------------------

Attempt at explaining React hooks:
useState => when these variables are updated (using setSomething(newValue)) the whole "function ()" runs again, i.e. the page re-renders.
useEffect(() => { ... }): Runs on every render.
useEffect(() => { ... }, []): Runs only when the page mounts (once).
useEffect(() => { ... }, [data]): Runs on mount and whenever data changes.

*/
