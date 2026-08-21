import { useParams, Link } from "react-router-dom"
//import LanguagePanel from "../components/LanguagePanel.tsx"
import { MOCK_SERIE } from "../mockup/mockSeries.ts" // [CAMBIAR]
import "../styles/WatchPage.css"

const API_URL = import.meta.env.VITE_API_URL;
//const IDIOMAS = ["Español (Latino)", "Español (España)", "English", "Français"]


function WatchSeriesPage() {
const { id, seasonIndex, episodeIndex } = useParams();

//pasandolos a de string a int
const sIndex = seasonIndex ? parseInt(seasonIndex, 10) : 0;
const eIndex = episodeIndex ? parseInt(episodeIndex, 10) : 0;

  // TODO: reemplazar por fetch real cuando exista SeasonRepository/EpisodeRepository // [CAMBIAR]
  const serie = MOCK_SERIE

  if (!serie || String(serie.id) !== id) {
    // por ahora solo tenemos 1 serie mock, así que si no matchea igual la mostramos // [CAMBIAR] BORRAR COMENTARIO
  }

  return (
    <div className="watch-container">
      <div className="watch-left">
        <div className="watch-panels">
        </div>

        <div className="watch-video-box">
          <video src={`${API_URL}${serie.seasons[sIndex].episodes[eIndex].path}`} controls />
        </div>

        <div className="watch-progress-bar">
          <div className="watch-progress-fill" />
        </div>

        <button className="watch-report-btn">Reportar</button>
      </div>

      <div className="watch-right">
        <h1 className="watch-title">{serie.tittle}</h1>
        <p className="watch-category">{serie.category}</p>
        <p className="watch-category">{serie.seasons[sIndex].episodes[eIndex].title}</p>

        <p className="watch-description">
          {serie.seasons[sIndex]?.descripcion}
        </p>

        <div className="watch-series-actions">
          <Link to={`/serie/${serie.id}/seasons`}>
            <button className="watch-series-btn">Temporadas</button>
          </Link>
          <Link to={`/serie/${serie.id}/season/${serie.seasons[sIndex]?.id}/episodes`}>
            <button className="watch-series-btn">Episodios</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default WatchSeriesPage