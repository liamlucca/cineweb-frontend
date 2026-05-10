import Section from "../components/Section.tsx"
import SearchBar from "../components/SearchBar.tsx"

const PELICULAS = [
  { id: 0, titulo: 'El relampago MCKing', plataforma: 'Sidney Plus' },
  { id: 1, titulo: 'El hombre lagaña', plataforma: 'Sidney Plus' },
  { id: 2, titulo: 'Beaking Bread', plataforma: 'InternetFlix' },
  { id: 4, titulo: 'Cosas raras', plataforma: 'InternetFlix' },
  { id: 5, titulo: 'Bomba, el niño de la selva', plataforma: 'Amazing Prime' },
  { id: 0, titulo: 'El relampago MCKing', plataforma: 'Sidney Plus' },
  { id: 1, titulo: 'El hombre lagaña', plataforma: 'Sidney Plus' },
  { id: 2, titulo: 'Beaking Bread', plataforma: 'InternetFlix' },
  { id: 4, titulo: 'Cosas raras', plataforma: 'InternetFlix' },
  { id: 5, titulo: 'Bomba, el niño de la selva', plataforma: 'Amazing Prime' },
  { id: 0, titulo: 'El relampago MCKing', plataforma: 'Sidney Plus' },
  { id: 1, titulo: 'El hombre lagaña', plataforma: 'Sidney Plus' },
  { id: 2, titulo: 'Beaking Bread', plataforma: 'InternetFlix' },
  { id: 4, titulo: 'Cosas raras', plataforma: 'InternetFlix' },
  { id: 5, titulo: 'Bomba, el niño de la selva', plataforma: 'Amazing Prime' },
  { id: 0, titulo: 'El relampago MCKing', plataforma: 'Sidney Plus' },
  { id: 1, titulo: 'El hombre lagaña', plataforma: 'Sidney Plus' },
  { id: 2, titulo: 'Beaking Bread', plataforma: 'InternetFlix' },
  { id: 4, titulo: 'Cosas raras', plataforma: 'InternetFlix' },
  { id: 5, titulo: 'Bomba, el niño de la selva', plataforma: 'Amazing Prime' },
]

function LandingPage() {
  return (
    <div>
      <SearchBar />
      <Section titulo="Ver Más Tarde" peliculas={PELICULAS} />
      <Section titulo="Pueden gustarte..." peliculas={PELICULAS} />
    </div>
  )
}

export default LandingPage