import { Link } from "react-router-dom"
import Section from "../components/Section.tsx"
import Hero from "../components/Hero.tsx"
import CardSkeleton from "../components/CardSkeleton.tsx"
import useCatalog from "../hooks/useCatalog.ts"
import useAuth from "../hooks/useAuth.ts"
import { categoriesOf, categoryKey, featuredItem } from "../utils/catalog.ts"
import useDocumentTitle from "../hooks/useDocumentTitle.ts"

function LandingPage() {
  // movies and series together (see hooks/useCatalog.ts)
  const { items, loading, error } = useCatalog()
  const { user } = useAuth()
  const categories = categoriesOf(items)
  const featured = featuredItem(items)
  // newest first: the highest ids were uploaded last
  const movies = items.filter((item) => item.kind === "movie").sort((a, b) => b.id - a.id)
  const series = items.filter((item) => item.kind === "series").sort((a, b) => b.id - a.id)

  // browser tab title
  useDocumentTitle()

  // grey placeholders with the shape of the page while the catalog loads
  if (loading) {
    return (
      <div>
        <div className="skeleton h-72 sm:h-96 w-full rounded-none" />
        <div className="skeleton h-7 w-48 mx-4 mt-8 mb-3" />
        <CardSkeleton count={6} />
        <div className="skeleton h-7 w-48 mx-4 mt-8 mb-3" />
        <CardSkeleton count={6} />
      </div>
    )
  }

  if (error && items.length === 0) {
    return <div role="alert" className="alert alert-error m-4">{error}</div>
  }

  // nothing uploaded yet: invite the visitor to be the first
  if (!featured) {
    return (
      <div className="hero min-h-[60vh]">
        <div className="hero-content text-center flex-col">
          <h1 className="text-3xl font-bold">There are no videos yet</h1>
          <p className="opacity-70">Be the first one to share a movie or a series.</p>
          {user?.role === "viewer" && <Link to="/upload" className="btn btn-primary">Upload a video</Link>}
          {!user && <Link to="/login" className="btn btn-primary">Log in to upload</Link>}
        </div>
      </div>
    )
  }

  return (
    <div>
      <Hero item={featured} />

      {/* if only one of the two lists failed, show what did load plus a warning */}
      {error && (
        <div role="alert" className="alert alert-warning mx-4 mt-4 text-sm">
          Some videos could not be loaded. {error}
        </div>
      )}

      {/* quick links to search one category */}
      {categories.length > 0 && (
        <nav aria-label="Categories" className="flex gap-2 px-4 mt-6 overflow-x-auto pb-1">
          {categories.map((category) => (
            <Link
              key={category.key}
              to={`/search?category=${encodeURIComponent(category.key)}`}
              className="btn btn-sm btn-outline rounded-full shrink-0"
            >
              {category.label}
            </Link>
          ))}
        </nav>
      )}

      <Section title="New movies" items={movies} seeAllTo="/search?type=movie" />
      <Section title="Series" items={series} seeAllTo="/search?type=series" />
      {/* one carousel per category */}
      {categories.map((category) => (
        <Section
          key={category.key}
          title={category.label}
          items={items.filter((item) => categoryKey(item.category) === category.key)}
          seeAllTo={`/search?category=${encodeURIComponent(category.key)}`}
        />
      ))}
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
