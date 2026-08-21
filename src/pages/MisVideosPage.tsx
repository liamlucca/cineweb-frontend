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

  // Guarda qué video se está editando
  const [videoEditando, setVideoEditando] = useState<number | null>(null);

  // Datos que se están editando
  const [tituloEditado, setTituloEditado] = useState("");
  const [categoriaEditada, setCategoriaEditada] = useState("");
  const [descripcionEditada, setDescripcionEditada] = useState("");

  useEffect(() => {
    // Busca los videos en el backend
    fetch("http://localhost:3000/api/movie")
      .then((response) => response.json())
      .then((data) => {
        setVideos(data);
      })
      .catch((error) => {
        console.error("Error al obtener los videos:", error);
      });
  }, []);

  // Elimina un video del backend
  const eliminarVideo = async (id: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/movie/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo eliminar el video");
      }

      // Elimina el video de la lista que se muestra en pantalla
      setVideos((videosActuales) =>
        videosActuales.filter((video) => video.id !== id)
      );
    } catch (error) {
      console.error("Error al eliminar el video:", error);
    }
  };

  // Comienza la edición de un video
  const comenzarEdicion = (video: Video) => {
    setVideoEditando(video.id);
    setTituloEditado(video.title);
    setCategoriaEditada(video.category);
    setDescripcionEditada(video.description);
  };

  // Cancela la edición
  const cancelarEdicion = () => {
    setVideoEditando(null);
    setTituloEditado("");
    setCategoriaEditada("");
    setDescripcionEditada("");
  };

  // Guarda los cambios del video
  const guardarEdicion = async (id: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/movie/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: tituloEditado,
            category: categoriaEditada,
            description: descripcionEditada,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("No se pudo actualizar el video");
      }

      // Actualiza el video en pantalla
      setVideos((videosActuales) =>
        videosActuales.map((video) =>
          video.id === id
            ? {
                ...video,
                title: tituloEditado,
                category: categoriaEditada,
                description: descripcionEditada,
              }
            : video
        )
      );

      // Sale del modo edición
      cancelarEdicion();
    } catch (error) {
      console.error("Error al editar el video:", error);
    }
  };

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

                {videoEditando === video.id ? (
                  /* Modo edición */
                  <div className="flex flex-col gap-3">

                    <div>
                      <label className="font-bold block mb-1">
                        Nombre del archivo:
                      </label>

                      <input
                        type="text"
                        value={tituloEditado}
                        onChange={(e) =>
                          setTituloEditado(e.target.value)
                        }
                        className="input input-bordered w-full"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">
                        Categoría:
                      </label>

                      <input
                        type="text"
                        value={categoriaEditada}
                        onChange={(e) =>
                          setCategoriaEditada(e.target.value)
                        }
                        className="input input-bordered w-full"
                      />
                    </div>

                    <div>
                      <label className="font-bold block mb-1">
                        Descripción:
                      </label>

                      <textarea
                        value={descripcionEditada}
                        onChange={(e) =>
                          setDescripcionEditada(e.target.value)
                        }
                        className="textarea textarea-bordered w-full"
                      />
                    </div>

                  </div>
                ) : (
                  /* Modo normal */
                  <>
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
                  </>
                )}

              </div>

              {/* Botones */}
              <div className="flex flex-col items-center justify-center gap-3">

                {videoEditando === video.id ? (
                  <>
                    {/* Guardar */}
                    <button
                      className="btn btn-success w-32"
                      onClick={() => guardarEdicion(video.id)}
                    >
                      Guardar
                    </button>

                    {/* Cancelar */}
                    <button
                      className="btn btn-outline w-32"
                      onClick={cancelarEdicion}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    {/* Eliminar */}
                    <button
                      className="btn btn-error w-32"
                      onClick={() => eliminarVideo(video.id)}
                    >
                      Eliminar
                    </button>

                    {/* Editar */}
                    <button
                      className="btn btn-outline w-32"
                      onClick={() => comenzarEdicion(video)}
                    >
                      ✏️ Editar
                    </button>
                  </>
                )}

              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default MisVideosPage;