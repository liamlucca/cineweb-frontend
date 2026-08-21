import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Section from "../components/Section.tsx"
import SearchBar from "../components/SearchBar.tsx"
import { Pelicula, MovieDTO } from "../types/index.ts"

const API_URL = import.meta.env.VITE_API_URL;

function SearchPage() {
  //la explicación de useSearchParams está abajo de todo
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? '' // si no hay nada, que sea un string vacío

  const [resultados, setResultados] = useState<Pelicula[]>([])

useEffect(() => {
    fetch(`${API_URL}/api/movie`)
    .then(res => res.json())
    .then((response: { data: MovieDTO[] }) => {
      const peliculasFixeadas: Pelicula[] = response.data.map((movie) => ({
        id: movie.id,
        title: movie.title,
        platform: movie.category,
        archivo: `${API_URL}${movie.path}`,
      }))

      const filtradas = peliculasFixeadas.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase())
      )

      setResultados(filtradas)
    })
}, [query]) // se vuelve a ejecutar cada vez que cambia el texto buscado

  return (
    <div>
      <SearchBar />
      <Section titulo={`Resultados para: "${query}"`} peliculas={resultados} />
    </div>
  )
}

export default SearchPage

/*
EXPLICACIÓN: useSearchParams.
Es un hook de ReactRouter que lee los parámetros de la URL. Cuando alguien busca "Shrek", la URL queda /buscar?q=Shrek y searchParams.get('q') te devuelve "Shrek".
*/