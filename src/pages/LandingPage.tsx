import Section from "../components/Section.tsx"
import SearchBar from "../components/SearchBar.tsx"
import { MovieDTO, Movie } from "../types/index.ts"
import { useEffect, useState } from "react"

const API_URL = import.meta.env.VITE_API_URL;

function LandingPage() {

  const [movies, setMovies] = useState<Movie[]>([])

    useEffect(() => {
    fetch(`${API_URL}/api/movie`)
      .then(res => res.json())
      .then((response: MovieDTO[] ) => {
        const fixedMovies: Movie[] = response.map((movie) => ({
          id: movie.id,
          title: movie.title,
          platform: movie.category,
          file: `${API_URL}${movie.path}`, // assuming path is relative, e.g. /uploads/videos/videoname.mp4
        }))
        setMovies(fixedMovies)
      })
  }, [])


  return (
    <div>
      <SearchBar />
      <Section title="Uploaded" movies={movies} />
      <Section title="More Videos" movies={movies} />
    </div>
  )
}

export default LandingPage


/*

EXPLANATIONS

-----------------------------------

Async code:
.then()                            When you do a fetch, the response doesn't arrive right away, it takes a while. So .then() means "when it's done, do this".
.then(res => res.json())           res is the raw response from the server (like an unopened envelope), to "open it" you have to convert it into json, i.e. res.json()
.then((names: string[]) => {...    The second .then receives the previous result (the json). names is the object received from the backend. With string[] we are saying that object is an array of strings (this is TypeScript)

-----------------------------------

Attempt at explaining React hooks:
useState => when these variables are updated (using setSomething(newValue)) the whole "function ()" runs again, i.e. the page re-renders.
useEffect(() => { ... }): Runs on every render.
useEffect(() => { ... }, []): Runs only when the page mounts (once).
useEffect(() => { ... }, [data]): Runs on mount and whenever data changes.

*/
