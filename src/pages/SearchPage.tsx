import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Section from "../components/Section.tsx"
import SearchBar from "../components/SearchBar.tsx"
import RequestStatus from "../components/RequestStatus.tsx"
import type { Movie } from "../types/index.ts"
import { getMovies, toMovie } from "../services/movieService.ts"
import { errorMessage } from "../services/api.ts"

function SearchPage() {
  //explanation of useSearchParams is at the bottom
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? '' // if there's nothing, default to an empty string

  const [results, setResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // ignores the answer of an older search that arrives after a newer one
    let cancelled = false
    setLoading(true)
    setError('')

    getMovies()
      .then((response) => {
        if (cancelled) return
        const filtered = response
          .map(toMovie)
          .filter(m => m.title.toLowerCase().includes(query.toLowerCase()))
        setResults(filtered)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [query]) // runs again every time the searched text changes

  return (
    <div>
      <SearchBar initialText={query} />
      <RequestStatus
        loading={loading}
        error={error}
        isEmpty={results.length === 0}
        emptyMessage={`No videos match "${query}".`}
      >
        <Section title={`Results for: "${query}"`} movies={results} />
      </RequestStatus>
    </div>
  )
}

export default SearchPage

/*
EXPLANATION: useSearchParams.
It's a React Router hook that reads the URL parameters. When someone searches "Shrek", the URL becomes /search?q=Shrek and searchParams.get('q') returns "Shrek".
*/
