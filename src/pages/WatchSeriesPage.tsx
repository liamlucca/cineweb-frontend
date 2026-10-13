import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import type { Episode, Season, Series } from "../types/index.ts"
import { getEpisode, getEpisodes, getSeason, getSeries } from "../services/seriesService.ts"
import { videoUrl } from "../services/movieService.ts"
import { errorMessage, mediaUrl } from "../services/api.ts"
import { formatDuration } from "../utils/catalog.ts"
import RequestStatus from "../components/RequestStatus.tsx"
import EpisodeList from "../components/EpisodeList.tsx"
import useAuth from "../hooks/useAuth.ts"
import ReviewButtons from "../components/ReviewButtons.tsx"
import useDocumentTitle from "../hooks/useDocumentTitle.ts"

// Plays one episode, with its details and the other episodes of the season
function WatchSeriesPage() {
  // names must match the route in App.tsx: /watch-series/:id/:seasonId/:episodeId
  const { id = '', seasonId = '', episodeId = '' } = useParams()
  const { user } = useAuth()

  const [series, setSeries] = useState<Series | null>(null)
  const [season, setSeason] = useState<Season | null>(null)
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([getSeries(id), getSeason(seasonId), getEpisode(episodeId), getEpisodes(seasonId)])
      .then(([seriesData, seasonData, episodeData, episodesData]) => {
        if (cancelled) return
        setSeries(seriesData)
        setSeason(seasonData)
        setEpisode(episodeData)
        setEpisodes(episodesData)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id, seasonId, episodeId])

  // browser tab title
  useDocumentTitle(episode && series ? `${series.title} · ${episode.title}` : 'Watch')

  const duration = formatDuration(episode?.duration)

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <RequestStatus loading={loading} error={error} isEmpty={!episode} emptyMessage="We couldn't find that episode.">
        {episode && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {/* the key restarts the player when moving to another episode */}
              <video
                key={episode.id}
                src={videoUrl(episode.path)}
                poster={mediaUrl(episode.thumbnailPath) ?? undefined}
                controls
                className="w-full aspect-video bg-black rounded-box shadow-lg"
              />
              <div>
                <Link to={`/series/${id}/seasons`} className="link link-hover text-sm opacity-80">{series?.title}</Link>
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">{episode.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
                  <span className="badge badge-secondary">Season {season?.seasonNumber} · Episode {episode.number}</span>
                  {series?.category && <span className="badge badge-outline">{series.category}</span>}
                  {duration && <span className="badge badge-ghost">{duration}</span>}
                </div>
              </div>
              {/* episodes are rated one by one (the backend has no reviews for whole series) */}
              <ReviewButtons type="episode" id={episode.id} />
              {episode.description && <p className="bg-base-200 rounded-box p-4 whitespace-pre-line">{episode.description}</p>}
              {/* episodes are reported through their series; nobody can report their own series */}
              {series && series.uploaderId !== user?.id && (
                <Link to={`/report/series/${series.id}`} className="btn btn-ghost btn-sm text-error">⚑ Report series</Link>
              )}
            </div>

            <aside>
              <h2 className="text-lg font-bold mb-3">Season {season?.seasonNumber}</h2>
              <EpisodeList seriesId={id} seasonId={seasonId} episodes={episodes} currentEpisodeId={episode.id} />
              <Link to={`/series/${id}/seasons`} className="btn btn-sm btn-outline mt-4">All seasons</Link>
            </aside>
          </div>
        )}
      </RequestStatus>
    </div>
  )
}

export default WatchSeriesPage
