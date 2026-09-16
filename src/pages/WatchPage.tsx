import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { MovieDTO } from "../types/index.ts"
//import LanguagePanel from "../components/LanguagePanel.tsx"
import "../styles/WatchPage.css"

const API_URL = import.meta.env.VITE_API_URL;
//const LANGUAGES = ["Spanish (Latin America)", "Spanish (Spain)", "English", "French"]

function WatchPage() {
  const { id } = useParams()
  const [movie, setMovie] = useState<MovieDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [showMoreBtn, setShowMoreBtn] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)

    fetch(`${API_URL}/api/movie/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("movie not found")
        return res.json()
      })
      .then((data: { movie: MovieDTO }) => setMovie(data.movie))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  // CHECKING DATA
  if (loading) return <p>Loading...</p>
  if (error || !movie) return <p>Video not found.</p>

  // Checking if the description is long enough to show the "See more" button
  if(movie.description.length > 100 && !showMoreBtn)
  setShowMoreBtn(true)

  return (
    <div className="watch-container">
      <div className="watch-left">
        <div className="watch-panels">
        </div>

        <div className="watch-video-box">
          <video src={`${API_URL}/api/movie/${id}/stream`} controls />
          {/* custom option: <video src={`${API_URL}/api/movie/${id}/stream`} controls />*/}
          {/* option with express.static: <video src={`${API_URL}${movie.path}`} controls /> */}
        </div>

        <button className="watch-report-btn">Report</button>
      </div>

      <div className="watch-right">
        <h1 className="watch-title">{movie.title}</h1>
        <p className="watch-category">{movie.category}</p>
        <p className={`watch-description ${descriptionExpanded ? "expanded" : ""}`}>
          {movie.description}
        </p>
        <button
          className={`watch-see-more ${showMoreBtn ? "" : "hide"} `}
          onClick={() => setDescriptionExpanded(!descriptionExpanded)}
        >
          {descriptionExpanded ? "See less" : "See more"}
        </button>

        <p className="watch-views">Views: {movie.views}</p>
      </div>
    </div>
  )
}

export default WatchPage
