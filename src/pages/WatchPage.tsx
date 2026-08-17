import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { API_URL } from "../services/api"

interface Movie {
  title: string
  videoUrl: string
}

function WatchPage() {
  const { id } = useParams()
  const [movie, setMovie] = useState<Movie | null>(null)

  useEffect(() => {
    fetch(`${API_URL}/api/movie/${id}`)
      .then(res => res.json())
      .then(data => setMovie(data.movie))
  }, [id])

  if (!movie) return <p>Cargando...</p>

  return (
    <div>
      <h1>{movie.title}</h1>
      <video src={`${API_URL}/uploads/${movie.videoUrl}`} controls width="100%" />
    </div>
  )
}

export default WatchPage