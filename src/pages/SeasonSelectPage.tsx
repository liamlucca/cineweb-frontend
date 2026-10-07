import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import type { Season, Series } from "../types/index.ts"
import { getSeasons, getSeries } from "../services/seriesService.ts"
import { errorMessage } from "../services/api.ts"
import RequestStatus from "../components/RequestStatus.tsx"
import "../styles/SeasonSelectPage.css"

function SeasonSelectPage() {
  // the route is /series/:id/seasons, so there is no season in the URL: start with the first one
  const { id = '' } = useParams()

  const navigate = useNavigate()

  const [series, setSeries] = useState<Series | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSeasonId, setActiveSeasonId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setActiveSeasonId(null)

    // both requests run at the same time
    Promise.all([getSeries(id), getSeasons(id)])
      .then(([seriesData, seasonsData]) => {
        if (cancelled) return
        setSeries(seriesData)
        setSeasons(seasonsData)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  // until the user picks one, the first season is the active one
  const activeSeason = seasons.find(s => s.id === activeSeasonId) ?? seasons[0]

  return (
    <RequestStatus
      loading={loading}
      error={error}
      isEmpty={seasons.length === 0}
      emptyMessage="This series has no seasons yet."
    >
      <div className="season-container">

        <div className="season-side">
          <div className="season-poster">Cover</div>

          <div className="season-selector">
            <label className="season-selector-title" htmlFor="season-select-side">
              Select a season:
            </label>
            <select
              id="season-select-side"
              className="season-select"
              value={activeSeason?.id}
              onChange={(e) => setActiveSeasonId(Number(e.target.value))}
            >
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  Season {season.seasonNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="season-main">
          <h1 className="season-title">{series?.title}</h1>
          <p className="mb-4 opacity-70">{series?.description}</p>

          <div className="season-dropdown-wrapper">
            <span className="season-dropdown-icon"></span>
            <select
              className="season-dropdown"
              value={activeSeason?.id}
              onChange={(e) => setActiveSeasonId(Number(e.target.value))}
            >
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  Season {season.seasonNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="season-detail">
            <div className="season-thumb">S{activeSeason?.seasonNumber}</div>
            <p className="season-description">{activeSeason?.description}</p>
          </div>

          <button
            type="button"
            className="season-episodes-btn"
            disabled={!activeSeason}
            onClick={() => activeSeason && navigate(`/series/${id}/season/${activeSeason.id}/episodes`)}
          >
            View Episodes
          </button>
        </div>
      </div>
    </RequestStatus>
  )
}

export default SeasonSelectPage
