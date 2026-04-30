import { Link } from "react-router-dom"
import Button from "../components/Button.tsx"

function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-red-500">CineWeb</h1>
      <p className="font-semibold">Mira lo que es el cine</p>
      <Link to="/subir">
        <Button>Subir película</Button>
      </Link>
    </div>
  )
}

export default HomePage