import { useParams, Link } from "react-router-dom"
//import LanguagePanel from "../components/LanguagePanel.tsx"
import { MOCK_SERIES } from "../mockup/mockSeries.ts" // [CHANGE]
import "../styles/WatchPage.css"

const API_URL = import.meta.env.VITE_API_URL;
//const LANGUAGES = ["Spanish (Latin America)", "Spanish (Spain)", "English", "French"]


function WatchSeriesPage() {
const { id, seasonIndex, episodeIndex } = useParams();

//converting them from string to int
const sIndex = seasonIndex ? parseInt(seasonIndex, 10) : 0;
const eIndex = episodeIndex ? parseInt(episodeIndex, 10) : 0;

  // TODO: replace with a real fetch once SeasonRepository/EpisodeRepository exists // [CHANGE]
  const series = MOCK_SERIES

  if (!series || String(series.id) !== id) {
    // for now we only have 1 mock series, so if it doesn't match we still show it anyway // [CHANGE] REMOVE COMMENT
  }

  return (
    <div className="watch-container">
      <div className="watch-left">
        <div className="watch-panels">
        </div>

        <div className="watch-video-box">
          <video src={`${API_URL}${series.seasons[sIndex].episodes[eIndex].path}`} controls />
        </div>

        <div className="watch-progress-bar">
          <div className="watch-progress-fill" />
        </div>

        <button className="watch-report-btn">Report</button>
      </div>

      <div className="watch-right">
        <h1 className="watch-title">{series.title}</h1>
        <p className="watch-category">{series.category}</p>
        <p className="watch-category">{series.seasons[sIndex].episodes[eIndex].title}</p>

        <p className="watch-description">
          {series.seasons[sIndex]?.description}
        </p>

        <div className="watch-series-actions">
          <Link to={`/series/${series.id}/seasons`}>
            <button className="watch-series-btn">Seasons</button>
          </Link>
          <Link to={`/series/${series.id}/season/${series.seasons[sIndex]?.id}/episodes`}>
            <button className="watch-series-btn">Episodes</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default WatchSeriesPage
