import { Link } from "react-router-dom";

function MisVideosPage() {
  //Datos de ejemplo - no conecte el back aun
  const videos = [
    {
      id: 1,
      nombre: "pelicula.mp4",
      categoria: "Acción",
      descripcion: "Una película de acción.",
      portada: "/placeholder.jpg",
    },
    {
      id: 2,
      nombre: "serie-episodio-1.mp4",
      categoria: "Drama",
      descripcion: "Primer episodio de la serie.",
      portada: "/placeholder.jpg",
    },
  ];

  return (
    <div className="min-h-screen p-8">
      {/*Encabezado */}
      <div className="flex items-center justify-between mb-6">
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
        {videos.map((video) => (
          <div
            key={video.id}
            className="flex flex-col md:flex-row items-center gap-6 border-b pb-6"
          >
            {/* Portada */}
            <img
              src={video.portada}
              alt={video.nombre}
              className="w-64 h-36 object-cover rounded"
            />

            {/* Detalles */}
            <div className="flex-1">
              <p className="text-lg">
                <strong>Nombre del archivo:</strong>{" "}
                {video.nombre}
              </p>

              <p className="text-lg">
                <strong>Categoría:</strong>{" "}
                {video.categoria}
              </p>

              <p className="text-lg">
                <strong>Descripción:</strong>{" "}
                {video.descripcion}
              </p>
            </div>

            {/* Boton Eliminar/Editar*/}
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
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MisVideosPage;