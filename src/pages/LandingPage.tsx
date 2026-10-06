import Section from "../components/Section.tsx"
import SearchBar from "../components/SearchBar.tsx"
import RequestStatus from "../components/RequestStatus.tsx"
import type { Movie } from "../types/index.ts"
import { useEffect, useState } from "react"
import { getMovies, toMovie } from "../services/movieService.ts"
import { errorMessage } from "../services/api.ts"

function LandingPage() {

  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMovies()
      .then((response) => setMovies(response.map(toMovie)))
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])


  return (
    <div>
      <SearchBar />
      <RequestStatus
        loading={loading}
        error={error}
        isEmpty={movies.length === 0}
        emptyMessage="There are no videos yet."
      >
        <Section title="Uploaded" movies={movies} />
        <Section title="More Videos" movies={movies} />
      </RequestStatus>
    </div>
  )
}

export default LandingPage


/*

EXPLANATIONS

-----------------------------------

Async code:
.then()                            When you do a fetch, the response doesn't arrive right away, it takes a while. So .then() means "when it's done, do this".
.catch()                           Runs if anything before it failed (server down, bad answer...). getMovies() throws errors whose message is already friendly.
.finally()                         Runs at the end in both cases, success or error. Here it hides the spinner.

-----------------------------------

Attempt at explaining React hooks:
useState => when these variables are updated (using setSomething(newValue)) the whole "function ()" runs again, i.e. the page re-renders.
useEffect(() => { ... }): Runs on every render.
useEffect(() => { ... }, []): Runs only when the page mounts (once).
useEffect(() => { ... }, [data]): Runs on mount and whenever data changes.

*/
