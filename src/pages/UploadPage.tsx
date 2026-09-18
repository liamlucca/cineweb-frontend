import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL;

function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) { //e: the event fired when the input changes
    const selectedFile = e.target.files?.[0]  //e.target is the HTML input. If nothing is found it returns undefined (hence the ?)
    if (selectedFile) {
      setFile(selectedFile)
      if (!title) setTitle(selectedFile.name) // use the file name as default
    }
  }

  async function handleSubmit() {
    if (!file) return

    setUploading(true)
  
    const movieData = {
      id_author: 2,
      title: title,
      category: category || 'General',
      views: 0,
      description: description || 'No description',
      report: false,
      state: true
    }
   
    const formData = new FormData()
    formData.append('data', JSON.stringify(movieData))
    // NOTE: keep this key as 'file', the backend's multer config expects that exact field name
    formData.append('file', file) 

    try {
      /*const response = await fetch(`${API_URL}/api/movie`, {
        method: 'POST',
        body: formData
      })*/

      const response = await uploadWithProgress(formData, setProgress)


      if (response.ok) {
        setMessage('Uploaded!!!!')
      } else {
        const errorData = await response.json().catch(() => ({}))
        setMessage(`ERROR (${response.status}): ${errorData.message || 'ERROR :('}`)
      }
    } catch (error) {
      setMessage('COULD NOT CONNECT TO THE SERVER.')
    }

    setUploading(false)
  }

function uploadWithProgress(formData: FormData, onProgress: (pct: number) => void): Promise<Response> {
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
          <h2 className="card-title justify-center">Upload movie</h2>
          <p className="text-sm text-center opacity-70">Fill in the details and choose the file</p>
 
          <label className="label">Video file</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="file-input file-input-bordered w-full"
          />
 
          <label className="label">Title</label>
          <input
            className="input input-bordered w-full"
            placeholder="Movie name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
 
          <label className="label">Category</label>
          <input
            className="input input-bordered w-full"
            placeholder="E.g: Action, Drama"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
 
          <label className="label">Description</label>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Video details"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
 
          <button
            className="btn bg-primary text-primary-content w-full mt-2"
            onClick={handleSubmit}
            disabled={!file || uploading /* disable the submit button if there's no file or it's already uploading */}   
          >
            {uploading ? 'Saving...' : 'Save Movie'}
          </button>
 
          {uploading && <progress className="progress progress-primary w-full" value={progress} max={100} />} {/*the progress bar*/}
 
          {message && <p className="text-sm text-center">{message}</p>}
        </div>
      </div>
    </div>
  )
}

export default UploadPage
