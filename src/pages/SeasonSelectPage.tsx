import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { MOCK_SERIES } from "../mockup/mockSeries.ts"
import "../styles/SeasonSelectPage.css"

function SeasonSelectPage() {
  // the route is /series/:id/seasons, so there is no season in the URL: start with the first one
  const { id } = useParams()

  const navigate = useNavigate()

  // TODO: replace with a real fetch once SeasonRepository exists
  const series = MOCK_SERIES

  const [activeSeasonId, setActiveSeasonId] = useState(series.seasons[0]?.id)
  const activeSeason = series.seasons.find(s => s.id === activeSeasonId)

  return (
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
            value={activeSeasonId}
            onChange={(e) => setActiveSeasonId(Number(e.target.value))}
          >
            {series.seasons.map((season) => (
              <option key={season.id} value={season.id}>
                Season {season.number}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="season-main">
        <h1 className="season-title">{series.title}</h1>

        <div className="season-dropdown-wrapper">
          <span className="season-dropdown-icon"></span>
          <select
            className="season-dropdown"
            value={activeSeasonId}
            onChange={(e) => setActiveSeasonId(Number(e.target.value))}
          >
            {series.seasons.map((season) => (
              <option key={season.id} value={season.id}>
                Season {season.number}
              </option>
            ))}
          </select>
        </div>

        <div className="season-detail">
          <div className="season-thumb">S{activeSeason?.number}</div>
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
  )
}

export default SeasonSelectPage
