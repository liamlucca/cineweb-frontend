import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

type Video = {
  id: number;
  id_author: number;
  title: string;
  category: string;
  description: string;
  path: string;
  state: boolean;
  views: number;
};

function MisVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    // Busca los videos en el backend
    fetch("http://localhost:3000/api/movie")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setVideos(data);
      })
      .catch((error) => {
        console.error("Error al obtener los videos:", error);
      });
  }, []);

  return (
    <div className="min-h-screen p-8">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-4xl font-bold">
          Mis Videos
        </h1>

        <Link
          to="/subir"
          className="btn btn-primary"
        >
          Subir videos
        </Link>
      </div>

      {/* Línea horizontal */}
      <hr className="mb-8" />

      {/* Lista de videos */}
      <div className="space-y-6">

        {videos.length === 0 ? (
          <p className="text-lg">
            No tenés videos subidos.
          </p>
        ) : (
          videos.map((video) => (
            <div
              key={video.id}
              className="flex flex-col md:flex-row items-center gap-6 border-b pb-6"
            >

              {/* Video */}
              <video
                src={`http://localhost:3000${video.path}`}
                controls
                className="w-full max-w-64 h-36 object-cover rounded"
              />

              {/* Detalles */}
              <div className="flex-1 w-full">
                <p className="text-lg">
                  <strong>Nombre del archivo:</strong>{" "}
                  {video.title}
                </p>

                <p className="text-lg">
                  <strong>Categoría:</strong>{" "}
                  {video.category}
                </p>

                <p className="text-lg">
                  <strong>Descripción:</strong>{" "}
                  {video.description}
                </p>
              </div>

              {/* Botones */}
              <div className="flex flex-col items-center justify-center gap-3">
                <button
                  className="btn btn-error w-32"
                  onClick={() => console.log("Eliminar", video.id)}
                >
                  Eliminar
                </button>

                <button
                  className="btn btn-outline w-32"
                  onClick={() => console.log("Editar", video.id)}
                >
                  ✏️ Editar
                </button>
              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default MisVideosPage;