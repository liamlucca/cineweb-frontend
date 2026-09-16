import { useState } from "react"

interface LanguagePanelProps {
  title: string
  languages: string[]
}

function LanguagePanel({ title, languages }: LanguagePanelProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="watch-panel">
      <button className="watch-panel-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className={`watch-panel-arrow ${open ? "open" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="watch-panel-body">
          {languages.map((language) => (
            <div className="watch-panel-row" key={language}>
              <span>{language}</span>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguagePanel
