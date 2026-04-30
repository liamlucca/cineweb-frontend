import { useState } from 'react'
import Button from '../components/Button.tsx'
import FileInput from '../components/FileInput.tsx'

function UploadPage() {
// Esto es magia de react
// cuando estas variables se actualizan (usando setAlgo(valorNuevo) ) se vuelve a ejecutar toda la "function UploadPage()", es decir se vuelve a renderizar la pagina.
  const [archivo, setArchivo] = useState<File | null>(null) 
  const [subiendo, setSubiendo] = useState(false)
  const [mensaje, setMensaje] = useState('')

  function alElegirArchivo(e: React.ChangeEvent<HTMLInputElement>) { //e: es el evento que se dispara cuando el input cambia
    const file = e.target.files?.[0]  //e.target es el input de HTML. Si no encuentra nada devuelve undefined (por eso el ?)
    if (file) setArchivo(file)
  }

  async function alEnviar() {
    if (!archivo) return

    setSubiendo(true)

    // Este form es lo que se le va a mandar a la API y 'video' tiene que ser igual en lo de Multer 
    const formData = new FormData()
    formData.append('contenido', archivo) // le agregamos el archivo de video al form que creamos. 'video' es el nombre (como si fuera el id) del campo que le corresponde al archivo. Es decir seria: formData.append('nombre', cosaQueVamosAEnviar)

    try {
      const respuesta = await fetch('http://localhost:3000/api/videos', {
        method: 'POST', // usamos el POST para crear nuevos recursos (videos en este caso)
        body: formData, // es lo que creamos arriba
      })

      if (respuesta.ok) {
        setMensaje('Subido!!!!')
      } else {
        setMensaje('ERROR :(')
      }
    } catch (error) {
      setMensaje('NO SE PUDO CONECTAR CON EL SERVIDOR.')
    }

    setSubiendo(false)
  }

  return (
    <div>
      <h1>Subir video</h1>

  <FileInput onChange={alElegirArchivo} accept="video/*" />

      {archivo && (
        <p>Archivo elegido: {archivo.name}</p>
      )}

    <Button onClick={alEnviar} disabled={!archivo || subiendo}>
      {subiendo ? 'Subiendo...' : 'Subir'}
    </Button>

      {mensaje && <p>{mensaje}</p>}
    </div>
  )
}

export default UploadPage