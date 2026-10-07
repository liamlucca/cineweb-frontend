import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import type { Episode, Season, Series } from "../types/index.ts"
import { getEpisodes, getSeason, getSeries } from "../services/seriesService.ts"
import { errorMessage } from "../services/api.ts"
import RequestStatus from "../components/RequestStatus.tsx"
import "../styles/SeasonSelectPage.css"
import "../styles/WatchPage.css"

function EpisodeListPage() {
  // names must match the route in App.tsx: /series/:id/season/:seasonId/episodes
  const { id = '', seasonId = '' } = useParams()

  const [series, setSeries] = useState<Series | null>(null)
  const [season, setSeason] = useState<Season | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([getSeries(id), getSeason(seasonId), getEpisodes(seasonId)])
      .then(([seriesData, seasonData, episodesData]) => {
        if (cancelled) return
        setSeries(seriesData)
        setSeason(seasonData)
        setEpisodes(episodesData)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id, seasonId])

  return (
    <div className="season-main p-6">
      <RequestStatus loading={loading} error={error} isEmpty={false} emptyMessage="">
        <h1 className="season-title">{series?.title} — Season {season?.seasonNumber}</h1>

        {episodes.length === 0 && <p>This season has no episodes yet.</p>}

        {episodes.map((episode) => (
          <div className="episode-row" key={episode.id}>
            <div className="episode-thumb">E{episode.number}</div>
            <div>
              <p className="episode-title">{episode.title}</p>
              <p className="episode-description">{episode.description}</p>
            </div>
            <Link to={`/watch-series/${id}/${seasonId}/${episode.id}`} className="watch-series-btn">
              Watch
            </Link>
          </div>
        ))}
      </RequestStatus>

      <Link to={`/series/${id}/seasons`} className="btn btn-sm mt-4">See seasons</Link>
    </div>
  )
}

export default EpisodeListPage
