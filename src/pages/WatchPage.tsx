import { Link, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import type { Movie } from "../types/index.ts"
import { getMovie, videoUrl } from "../services/movieService.ts"
import { errorMessage, mediaUrl } from "../services/api.ts"
import { formatDuration } from "../utils/catalog.ts"
import useAuth from "../hooks/useAuth.ts"
import ReviewButtons from "../components/ReviewButtons.tsx"
import WatchLaterButton from "../components/WatchLaterButton.tsx"
import useDocumentTitle from "../hooks/useDocumentTitle.ts"

// descriptions longer than this get a "See more" button
const SHORT_DESCRIPTION = 180

function WatchPage() {
  const { id = '' } = useParams()
  const { user } = useAuth()
  const [movie, setMovie] = useState<Movie | null>(null)
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

  // browser tab title
  useDocumentTitle(movie?.title ?? 'Watch')

  // CHECKING DATA: a placeholder with the shape of the page while it loads
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6 grid gap-6 lg:grid-cols-3" aria-label="Loading" role="status">
        <div className="skeleton aspect-video w-full lg:col-span-2" />
        <div className="space-y-3">
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-20 w-full" />
        </div>
      </div>
    )
  }
  if (error || !movie) {
    return (
      <div className="max-w-xl mx-auto p-4 md:p-6 space-y-4">
        <div role="alert" className="alert alert-error">{error || "We couldn't find that video."}</div>
        <Link to="/search" className="btn btn-primary">Find something else to watch</Link>
      </div>
    )
  }

  // the "See more" button only makes sense for long descriptions
  const showMoreBtn = movie.description.length > SHORT_DESCRIPTION
  const duration = formatDuration(movie.duration)

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 grid gap-6 lg:grid-cols-3">
      {/* plays the file from the backend's static folder; the thumbnail shows until it starts */}
      <div className="lg:col-span-2">
        <video
          src={videoUrl(movie.path)}
          poster={mediaUrl(movie.thumbnailPath) ?? undefined}
          controls
          className="w-full aspect-video bg-black rounded-box shadow-lg"
        />
      </div>

      <section className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">{movie.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
            <span className="badge badge-primary">Movie</span>
            {movie.category && <span className="badge badge-outline">{movie.category}</span>}
            {duration && <span className="badge badge-ghost">{duration}</span>}
            <span className="opacity-70">{movie.views} views</span>
          </div>
          {movie.uploaderUsername && <p className="text-sm opacity-70 mt-2">Uploaded by @{movie.uploaderUsername}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <ReviewButtons type="movie" id={movie.id} />
          <WatchLaterButton type="movie" id={movie.id} />
        </div>

        {movie.description && (
          <div className="bg-base-200 rounded-box p-4">
            <p className={`whitespace-pre-line ${descriptionExpanded ? "" : "line-clamp-4"}`}>{movie.description}</p>
            {showMoreBtn && (
              <button type="button" className="btn btn-link btn-sm px-0" onClick={() => setDescriptionExpanded(!descriptionExpanded)}>
                {descriptionExpanded ? "See less" : "See more"}
              </button>
            )}
          </div>
        )}

        {/* nobody can report their own movie (the backend rejects it too) */}
        {movie.uploaderId !== user?.id && (
          <Link to={`/report/movie/${movie.id}`} className="btn btn-ghost btn-sm text-error">⚑ Report</Link>
        )}
      </section>
    </div>
  )
}

export default WatchPage
