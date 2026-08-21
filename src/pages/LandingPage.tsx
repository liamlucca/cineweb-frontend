import { Link } from "react-router-dom"

import Section from "../components/Section.tsx"
import SearchBar from "../components/SearchBar.tsx"
import { MovieDTO, Pelicula } from "../types/index.ts"
import { useEffect, useState } from "react"

const API_URL = import.meta.env.VITE_API_URL;

function LandingPage() {

  const [peliculas, setPeliculas] = useState<Pelicula[]>([])

    useEffect(() => {
    fetch(`${API_URL}/api/movie`)
      .then(res => res.json())
      .then((response: MovieDTO[] ) => {
        const peliculasFixeadas: Pelicula[] = response.map((movie) => ({
          id: movie.id,
          title: movie.title,
          platform: movie.category,
          archivo: `${API_URL}${movie.path}`, // asumiendo que path es relativo, ej /uploads/videos/nombredelvideo.mp4
        }))
        setPeliculas(peliculasFixeadas)
      })
  }, [])


  return (
    <div>
      <SearchBar />

      { /* boton de Reportar*/} 
      <Link to="/reportar">
        <button>Reportar contenido</button>
      </Link>

      <Link to="/denuncia">
        <button>Denuncias</button>
      </Link>

      <Section titulo="Ver Más Tarde" peliculas={peliculas} />
      <Section titulo="Pueden gustarte..." peliculas={peliculas} />
    </div>
  )
}

export default LandingPage


/*

EXPLICACIONES

-----------------------------------

Codigo asincrono:
.then()                            Cuando haces un fetch, la respuesta no llega en el momento, tarda un rato. O sea .then() significa "cuando termine, hacé esto".
.then(res => res.json())           res es la respuesta cruda del servidor (es como el sobre sin abrir), para "abrirlo" hay que convertirlo en un .json, es decir res.json()
.then((nombres: string[]) => {...  El segundo .then recibe el resultado anterior (el json). nombres es el objeto recibido del backend. Con string[] estamos diciendo que ese objeto es un array de strings (esto es Typescript)

-----------------------------------

Intento de explicacion de los hooks de react:
useState => cuando estas variables se actualizan (usando setAlgo(valorNuevo) ) se vuelve a ejecutar toda la "function ()", es decir se vuelve a renderizar la pagina.
useEffect(() => { ... }): Se ejecuta en cada renderizado.
useEffect(() => { ... }, []): Se ejecuta solo al levantar la pagina (una vez).
useEffect(() => { ... }, [data]): Se ejecuta al levantarlo y cuando data cambia.

*/

