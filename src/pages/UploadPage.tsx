import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL;

function UploadPage() {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [progreso, setProgreso] = useState(0)

  function alElegirArchivo(e: React.ChangeEvent<HTMLInputElement>) { //e: es el evento que se dispara cuando el input cambia
    const file = e.target.files?.[0]  //e.target es el input de HTML. Si no encuentra nada devuelve undefined (por eso el ?)
    if (file) {
      setArchivo(file)
      if (!titulo) setTitulo(file.name) // usa el nombre del archivo por defecto
    }
  }

  async function alEnviar() {
    if (!archivo) return

    setSubiendo(true)
  
    const peliculaData = {
      id_author: 2,
      title: titulo,
      category: categoria || 'General',
      views: 0,
      description: descripcion || 'Sin descripción',
      report: false,
      state: true
    }
   
    const formData = new FormData()
    formData.append('data', JSON.stringify(peliculaData))
    formData.append('archivo', archivo) 

    try {
      /*const respuesta = await fetch(`${API_URL}/api/movie`, {
        method: 'POST',
        body: formData
      })*/

      const respuesta = await subirConProgreso(formData, setProgreso)


      if (respuesta.ok) {
        setMensaje('Subido!!!!')
      } else {
        const errorData = await respuesta.json().catch(() => ({}))
        setMensaje(`ERROR (${respuesta.status}): ${errorData.message || 'ERROR :('}`)
      }
    } catch (error) {
      setMensaje('NO SE PUDO CONECTAR CON EL SERVIDOR.')
    }

    setSubiendo(false)
  }

function subirConProgreso(formData: FormData, onProgress: (pct: number) => void): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        onProgress(pct);
      }
    });

    xhr.addEventListener("load", () => {
      resolve(new Response(xhr.responseText, { status: xhr.status }));
    });
    xhr.addEventListener("error", () => reject(new Error("upload failed")));

    xhr.open("POST", `${API_URL}/api/movie`);
    xhr.send(formData);
  });
}

  return (
    <div className="min-h-[78vh] flex items-center justify-center bg-base-100 p-6">
      <div className="card bg-neutral w-full max-w-md shadow-xl">
        <div className="card-body gap-3">
          <h2 className="card-title justify-center">Subir película</h2>
          <p className="text-sm text-center opacity-70">Completá los datos y elegí el archivo</p>
 
          <label className="label">Archivo de video</label>
          <input
            type="file"
            accept="video/*"
            onChange={alElegirArchivo}
            className="file-input file-input-bordered w-full"
          />
 
          <label className="label">Título</label>
          <input
            className="input input-bordered w-full"
            placeholder="Nombre de la película"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
 
          <label className="label">Categoría</label>
          <input
            className="input input-bordered w-full"
            placeholder="Ej: Acción, Drama"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
 
          <label className="label">Descripción</label>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Detalles del video"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
 
          <button
            className="btn bg-primary text-primary-content w-full mt-2"
            onClick={alEnviar}
            disabled={!archivo || subiendo /* se deshabilita el boton de enviar si no hay archivo o se está subiendo */}   
          >
            {subiendo ? 'Guardando...' : 'Guardar Película'}
          </button>
 
          {subiendo && <progress className="progress progress-primary w-full" value={progreso} max={100} />} {/*la barrita de progreso*/}
 
          {mensaje && <p className="text-sm text-center">{mensaje}</p>}
        </div>
      </div>
    </div>
  )
}

export default UploadPage