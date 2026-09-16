import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Section from "../components/Section.tsx"
import SearchBar from "../components/SearchBar.tsx"
import { Movie, MovieDTO } from "../types/index.ts"

const API_URL = import.meta.env.VITE_API_URL;

function SearchPage() {
  //explanation of useSearchParams is at the bottom
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? '' // if there's nothing, default to an empty string

  const [results, setResults] = useState<Movie[]>([])

useEffect(() => {
    fetch(`${API_URL}/api/movie`)
    .then(res => res.json())
    .then((response: MovieDTO[]) => {
      const fixedMovies: Movie[] = response.map((movie) => ({
        id: movie.id,
        title: movie.title,
        platform: movie.category,
        file: `${API_URL}${movie.path}`,
      }))

      const filtered = fixedMovies.filter(m =>
        m.title.toLowerCase().includes(query.toLowerCase())
      )

      setResults(filtered)
    })
}, [query]) // runs again every time the searched text changes

  return (
    <div>
      <SearchBar />
      <Section title={`Results for: "${query}"`} movies={results} />
    </div>
  )
}

export default SearchPage

/*
EXPLANATION: useSearchParams.
It's a React Router hook that reads the URL parameters. When someone searches "Shrek", the URL becomes /search?q=Shrek and searchParams.get('q') returns "Shrek".
*/
