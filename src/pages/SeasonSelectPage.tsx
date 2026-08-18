import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import { MOCK_SERIE } from "../mockup/mockSeries.ts"
import "../styles/SeasonSelectPage.css"

function SeasonSelectPage() {
const { id, seasonIndex } = useParams();

//pasandolos a de string a int
const sIndex = seasonIndex ? parseInt(seasonIndex, 10) : 0;

  const navigate = useNavigate()

  // TODO: reemplazar por fetch real cuando exista SeasonRepository
  const serie = MOCK_SERIE

  const [temporadaActivaId, setTemporadaActivaId] = useState(serie.seasons[sIndex]?.id)
  const temporadaActiva = serie.seasons.find(t => t.id === temporadaActivaId)

  return (
    <div className="season-container">

      <div className="season-side">
        <div className="season-poster">Portada</div>

        <div className="season-selector">
          <label className="season-selector-title" htmlFor="temporada-select-side">
            Seleccione una temporada:
          </label>
          <select
            id="temporada-select-side"
            className="season-select"
            value={temporadaActivaId}
            onChange={(e) => setTemporadaActivaId(Number(e.target.value))}
          >
            {serie.seasons.map((temporada) => (
              <option key={temporada.id} value={temporada.id}>
                Temporada {temporada.numero}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="season-main">
        <h1 className="season-title">{serie.tittle}</h1>

        <div className="season-dropdown-wrapper">
          <span className="season-dropdown-icon"></span>
          <select
            className="season-dropdown"
            value={temporadaActivaId}
            onChange={(e) => setTemporadaActivaId(Number(e.target.value))}
          >
            {serie.seasons.map((season) => (
              <option key={season.id} value={season.id}>
                Temporada {season.numero}
              </option>
            ))}
          </select>
        </div>

        <div className="season-detail">
          <div className="season-thumb">T{temporadaActiva?.numero}</div>
          <p className="season-description">{temporadaActiva?.descripcion}</p>
        </div>

        <button
          className="season-episodes-btn"
          onClick={() => navigate(`/serie/${id}/season/${temporadaActiva?.id}/episodes`)}
        >
          Ver Episodios
        </button>
      </div>
    </div>
  )
}

export default SeasonSelectPage