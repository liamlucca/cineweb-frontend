import { useState } from 'react'
import { API_URL } from "../services/api"

function UploadPage() {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [subiendo, setSubiendo] = useState(false)
  const [mensaje, setMensaje] = useState('')

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
      const respuesta = await fetch(`${API_URL}/api/movie`, {
        method: 'POST',
        body: formData
      })

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

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h1>Subir película</h1>

      <div style={{ marginBottom: '10px' }}>
        <label>Archivo de Video:</label><br />
        <input type="file" onChange={alElegirArchivo} accept="video/*" />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Título:</label><br />
        <input 
          type="text" 
          value={titulo} 
          onChange={(e) => setTitulo(e.target.value)} 
          placeholder="Nombre de la película"
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Categoría:</label><br />
        <input 
          type="text" 
          value={categoria} 
          onChange={(e) => setCategoria(e.target.value)} 
          placeholder="Ej: Acción, Drama"
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label>Descripción:</label><br />
        <textarea 
          value={descripcion} 
          onChange={(e) => setDescripcion(e.target.value)} 
          placeholder="Detalles del video"
        />
      </div>

      <button onClick={alEnviar} disabled={!archivo || subiendo}>
        {subiendo ? 'Guardando...' : 'Guardar Película'}
      </button>

      {mensaje && <p>{mensaje}</p>}
    </div>
  )
}

export default UploadPage