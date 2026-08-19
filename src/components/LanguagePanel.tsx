import { useState } from "react"

interface LanguagePanelProps {
  titulo: string
  idiomas: string[]
}

function LanguagePanel({ titulo, idiomas }: LanguagePanelProps) {
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="watch-panel">
      <button className="watch-panel-header" onClick={() => setAbierto(!abierto)}>
        <span>{titulo}</span>
        <span className={`watch-panel-arrow ${abierto ? "open" : ""}`}>▾</span>
      </button>

      {abierto && (
        <div className="watch-panel-body">
          {idiomas.map((idioma) => (
            <div className="watch-panel-row" key={idioma}>
              <span>{idioma}</span>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguagePanel