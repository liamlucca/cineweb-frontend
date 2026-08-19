import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { API_URL } from "../services/api"
import { MovieDTO } from "../types/index.ts"
//import LanguagePanel from "../components/LanguagePanel.tsx"
import "../styles/WatchPage.css"

//const IDIOMAS = ["Español (Latino)", "Español (España)", "English", "Français"]

function WatchPage() {
  const { id } = useParams()
  const [movie, setMovie] = useState<MovieDTO | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const [descripcionExpandida, setDescripcionExpandida] = useState(false)
  const [verMasBtn, setVerMasBtn] = useState(false)

  useEffect(() => {
    setCargando(true)
    setError(false)

    fetch(`${API_URL}/api/movie/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("movie not found")
        return res.json()
      })
      .then((data: { movie: MovieDTO }) => setMovie(data.movie))
      .catch(() => setError(true))
      .finally(() => setCargando(false))
  }, [id])

  // CHEQUEANDO DATOS
  if (cargando) return <p>Cargando...</p>
  if (error || !movie) return <p>No se encontró el video.</p>

  // Chequeando si la descripción es larga para mostrar el botón "Ver más"
  if(movie.description.length > 100 && !verMasBtn)
  setVerMasBtn(true)

  return (
    <div className="watch-container">
      <div className="watch-left">
        <div className="watch-panels">
        </div>

        <div className="watch-video-box">
          <video src={`${API_URL}${movie.path}`} controls />
        </div>

        <button className="watch-report-btn">Reportar</button>
      </div>

      <div className="watch-right">
        <h1 className="watch-title">{movie.title}</h1>
        <p className="watch-category">{movie.category}</p>
        <p className="watch-category">dir: {`${API_URL}${movie.path}`}</p>
        <p className={`watch-description ${descripcionExpandida ? "expanded" : ""}`}>
          {movie.description}
        </p>
        <button
          className={`watch-vermas ${verMasBtn ? "" : "hide"} `}
          onClick={() => setDescripcionExpandida(!descripcionExpandida)}
        >
          {descripcionExpandida ? "Ver menos" : "Ver más"}
        </button>

        <p className="watch-views">Vistas: {movie.views}</p>
      </div>
    </div>
  )
}

export default WatchPage