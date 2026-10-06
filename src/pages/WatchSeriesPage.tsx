import { useParams, Link } from "react-router-dom"
//import LanguagePanel from "../components/LanguagePanel.tsx"
import { MOCK_SERIES } from "../mockup/mockSeries.ts" // [CHANGE]
import { videoUrl } from "../services/movieService.ts"
import "../styles/WatchPage.css"

//const LANGUAGES = ["Spanish (Latin America)", "Spanish (Spain)", "English", "French"]


function WatchSeriesPage() {
  // names must match the route in App.tsx: /watch-series/:id/:seasonId/:episodeId
  const { seasonId, episodeId } = useParams()

  // TODO: replace with a real fetch once SeasonRepository/EpisodeRepository exists // [CHANGE]
  // for now we only have 1 mock series, so the :id in the URL is not checked
  const series = MOCK_SERIES

  const season = series.seasons.find(s => String(s.id) === seasonId)
  const episode = season?.episodes.find(e => String(e.id) === episodeId)

  if (!season || !episode) {
    return (
      <div role="alert" className="alert alert-error m-4">
        We couldn't find that episode.
        <Link to={`/series/${series.id}/seasons`} className="btn btn-sm">See seasons</Link>
      </div>
    )
  }

  return (
    <div className="watch-container">
      <div className="watch-left">
        <div className="watch-panels">
        </div>

        <div className="watch-video-box">
          <video src={videoUrl(episode.path)} controls />
        </div>

        <div className="watch-progress-bar">
          <div className="watch-progress-fill" />
        </div>

        <Link to="/report" className="watch-report-btn">Report</Link>
      </div>

      <div className="watch-right">
        <h1 className="watch-title">{series.title}</h1>
        <p className="watch-category">{series.category}</p>
        <p className="watch-category">{episode.title}</p>

        <p className="watch-description">
          {season.description}
        </p>

        <div className="watch-series-actions">
          <Link to={`/series/${series.id}/seasons`} className="watch-series-btn">
            Seasons
          </Link>
          <Link to={`/series/${series.id}/season/${season.id}/episodes`} className="watch-series-btn">
            Episodes
          </Link>
        </div>
      </div>
    </div>
  )
}

export default WatchSeriesPage
