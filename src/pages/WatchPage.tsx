import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import type { MovieDTO } from "../types/index.ts"
//import LanguagePanel from "../components/LanguagePanel.tsx"
import { getMovie, videoUrl } from "../services/movieService.ts"
import { errorMessage } from "../services/api.ts"
import useAuth from "../hooks/useAuth.ts"
import "../styles/WatchPage.css"

//const LANGUAGES = ["Spanish (Latin America)", "Spanish (Spain)", "English", "French"]

function WatchPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const [movie, setMovie] = useState<MovieDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setDescriptionExpanded(false)

    getMovie(id)
      .then((data) => {
        if (!cancelled) setMovie(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  // CHECKING DATA
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg" aria-label="Loading" />
      </div>
    )
  }
  if (error || !movie) {
    return <div role="alert" className="alert alert-error m-4">{error || "We couldn't find that video."}</div>
  }

  // the "See more" button only makes sense for long descriptions
  const showMoreBtn = movie.description.length > 100

  return (
    <div className="watch-container">
      <div className="watch-left">
        <div className="watch-panels">
        </div>

        <div className="watch-video-box">
          {/* plays the file from the backend's static folder (the backend also offers /api/movie/:id/stream) */}
          <video src={videoUrl(movie.path)} controls />
        </div>

        {/* nobody can report their own movie (the backend rejects it too) */}
        {movie.id_author !== user?.id && (
          <Link to={`/report/movie/${movie.id}`} className="watch-report-btn">Report</Link>
        )}
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
