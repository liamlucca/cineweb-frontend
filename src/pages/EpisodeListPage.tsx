import { useParams, Link } from "react-router-dom"
import { MOCK_SERIES } from "../mockup/mockSeries.ts"
import "../styles/SeasonSelectPage.css"
import "../styles/WatchPage.css"

function EpisodeListPage() {
  const { seasonId } = useParams()

  // TODO: replace with a real fetch once EpisodeRepository exists
  const series = MOCK_SERIES
  const season = series.seasons.find(s => String(s.id) === seasonId)

  if (!season) {
    return (
      <div role="alert" className="alert alert-error m-4">
        We couldn't find that season.
        <Link to={`/series/${series.id}/seasons`} className="btn btn-sm">See seasons</Link>
      </div>
    )
  }

  return (
    <div className="season-main p-6">
      <h1 className="season-title">{series.title} — Season {season.number}</h1>

      {season.episodes.length === 0 && <p>This season has no episodes yet.</p>}

      {season.episodes.map((episode) => (
        <div className="episode-row" key={episode.id}>
          <div className="episode-thumb">E{episode.number}</div>
          <div>
            <p className="episode-title">{episode.title}</p>
            <p className="episode-description">{episode.description}</p>
          </div>
          <Link to={`/watch-series/${series.id}/${season.id}/${episode.id}`} className="watch-series-btn">
            Watch
          </Link>
        </div>
      ))}
    </div>
  )
}

export default EpisodeListPage
