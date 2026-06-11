import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Section from "../components/Section.tsx"
import SearchBar from "../components/SearchBar.tsx"
import { Pelicula } from "../types/index.ts"

function SearchPage() {
  //la explicación de useSearchParams está abajo de todo
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? '' // si no hay nada, que sea un string vacío

  const [resultados, setResultados] = useState<Pelicula[]>([])

  useEffect(() => {
    fetch('http://localhost:3000/contenido/peliculas')
      .then(res => res.json())
      .then((nombres: string[]) => {
        const peliculasFixeadas = nombres.map((nombre, index) => ({
          id: index,
          titulo: nombre.substring(0, nombre.lastIndexOf('.')),
          archivo: `http://localhost:3000/contenido/peliculas/${nombre}`,
          plataforma: ''
        }))

        // filtramos por el texto buscado
        const filtradas = peliculasFixeadas.filter(p =>
          p.titulo.toLowerCase().includes(query.toLowerCase())
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