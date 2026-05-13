import Section from "../components/Section.tsx"
import SearchBar from "../components/SearchBar.tsx"
import { Pelicula } from "../types/index.ts"
import { useEffect, useState } from "react"

function LandingPage() {

  const [peliculas, setPeliculas] = useState<Pelicula[]>([])

  useEffect(() => {
    fetch('http://localhost:3000/contenido/peliculas')
      .then(res => res.json())
      .then((nombres: string[]) => { // nombres: ["bombaNiñoDeLaSelva.mp4", "elHombreLagaña.mp4", "etc.mp4"]
        const peliculasFixeadas = nombres.map((nombre, index) => ({
          id: index,
          titulo: nombre.substring(0, nombre.lastIndexOf('.')), // esto es para sacar la extensión
          archivo: `http://localhost:3000/contenido/peliculas/${nombre}`, //direccion de donde se va a abrir la pelicula
          plataforma: ''
        }))
        setPeliculas(peliculasFixeadas) //lo que metamos aca tiene que coinicidir con el Tipo de arriba (Pelicula)
      })
  }, [])


  return (
    <div>
      <SearchBar />
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