import { useParams, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import type { Episode, Season, Series } from "../types/index.ts"
//import LanguagePanel from "../components/LanguagePanel.tsx"
import { getEpisode, getSeason, getSeries } from "../services/seriesService.ts"
import { videoUrl } from "../services/movieService.ts"
import { errorMessage } from "../services/api.ts"
import RequestStatus from "../components/RequestStatus.tsx"
import "../styles/WatchPage.css"

//const LANGUAGES = ["Spanish (Latin America)", "Spanish (Spain)", "English", "French"]


function WatchSeriesPage() {
  // names must match the route in App.tsx: /watch-series/:id/:seasonId/:episodeId
  const { id = '', seasonId = '', episodeId = '' } = useParams()

  const [series, setSeries] = useState<Series | null>(null)
  const [season, setSeason] = useState<Season | null>(null)
  const [episode, setEpisode] = useState<Episode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all([getSeries(id), getSeason(seasonId), getEpisode(episodeId)])
      .then(([seriesData, seasonData, episodeData]) => {
        if (cancelled) return
        setSeries(seriesData)
        setSeason(seasonData)
        setEpisode(episodeData)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id, seasonId, episodeId])

  return (
    <RequestStatus loading={loading} error={error} isEmpty={!episode} emptyMessage="We couldn't find that episode.">
      <div className="watch-container">
        <div className="watch-left">
          <div className="watch-panels">
          </div>

          <div className="watch-video-box">
            {episode && <video src={videoUrl(episode.path)} controls />}
          </div>

          <div className="watch-progress-bar">
            <div className="watch-progress-fill" />
          </div>

          <Link to="/report" className="watch-report-btn">Report</Link>
        </div>

        <div className="watch-right">
          <h1 className="watch-title">{series?.title}</h1>
          <p className="watch-category">{series?.category}</p>
          <p className="watch-category">
            Season {season?.seasonNumber} · Episode {episode?.number}: {episode?.title}
          </p>

          <p className="watch-description">
            {episode?.description}
          </p>

          <div className="watch-series-actions">
            <Link to={`/series/${id}/seasons`} className="watch-series-btn">
              Seasons
            </Link>
            <Link to={`/series/${id}/season/${seasonId}/episodes`} className="watch-series-btn">
              Episodes
            </Link>
          </div>
        </div>
      </div>
    </RequestStatus>
  )
}

export default WatchSeriesPage
