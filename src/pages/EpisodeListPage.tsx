import { useParams, Link } from "react-router-dom"
import { MOCK_SERIES } from "../mockup/mockSeries.ts"
import "../styles/SeasonSelectPage.css"

function EpisodeListPage() {
  const { seasonId } = useParams()

  // TODO: replace with a real fetch once EpisodeRepository exists
  const series = MOCK_SERIES
  const season = series.seasons.find(s => String(s.id) === seasonId) ?? series.seasons[0]

  return (
    <div className="season-main" style={{ padding: 24 }}>
      <h1 className="season-title">{series.title} — Season {season?.number}</h1>

      {season?.episodes.map((episode) => (
        <div className="episode-row" key={episode.id}>
          <div className="episode-thumb">E{episode.number}</div>
          <div>
            <p className="episode-title">{episode.title}</p>
            <p className="episode-description">{episode.description}</p>
          </div>
          <Link to={`/watch-series/${series.id}/${season.id}/${episode.id}`}>
            <button className="watch-series-btn">Watch</button>
          </Link>
        </div>
      ))}
    </div>
  )
}

export default EpisodeListPage
