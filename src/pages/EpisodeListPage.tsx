import { useParams, Link } from "react-router-dom"
import { MOCK_SERIE } from "../mockup/mockSeries.ts"
import "../styles/SeasonSelectPage.css"

function EpisodeListPage() {
  const { seasonId } = useParams()

  // TODO: reemplazar por fetch real cuando exista EpisodeRepository
  const serie = MOCK_SERIE
  const season = serie.seasons.find(t => String(t.id) === seasonId) ?? serie.seasons[0]

  return (
    <div className="season-main" style={{ padding: 24 }}>
      <h1 className="season-title">{serie.tittle} — Temporada {season?.numero}</h1>

      {season?.episodes.map((episode) => (
        <div className="episode-row" key={episode.id}>
          <div className="episode-thumb">E{episode.number}</div>
          <div>
            <p className="episode-title">{episode.title}</p>
            <p className="episode-description">{episode.description}</p>
          </div>
          <Link to={`/ver-serie/${serie.id}/${season.id}/${episode.id}`}>
            <button className="watch-series-btn">Ver</button>
          </Link>
        </div>
      ))}
    </div>
  )
}

export default EpisodeListPage