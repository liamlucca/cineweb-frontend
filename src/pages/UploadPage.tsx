import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { MovieUploadData } from '../types/index.ts'
import { uploadMovie } from '../services/movieService.ts'
import { errorMessage } from '../services/api.ts'
import useAuth from '../hooks/useAuth.ts'

function UploadPage() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) { //e: the event fired when the input changes
    const selectedFile = e.target.files?.[0]  //e.target is the HTML input. If nothing is found it returns undefined (hence the ?)
    if (selectedFile) {
      setFile(selectedFile)
      setSuccess(false)
      // use the file name, without its extension, as the default title
      if (!title) setTitle(selectedFile.name.replace(/\.[^.]+$/, ''))
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // ProtectedRoute only lets logged-in viewers in, so user is always set here
    if (!file || !user) return
    // keep the form: event.currentTarget is null after the await
    const form = event.currentTarget

    setUploading(true)
    setProgress(0)
    setSuccess(false)
    setError('')

    const movieData: MovieUploadData = {
      // TODO: the backend still requires id_author. Remove it once it takes the uploader from the token.
      id_author: user.id,
      title: title.trim(),
      category: category.trim(),
      views: 0,
      description: description.trim(),
      state: 'active',
    }

    try {
      await uploadMovie(movieData, file, setProgress)
      setSuccess(true)
      setFile(null)
      setTitle('')
      setCategory('')
      setDescription('')
      form.reset() // clears the file input, which has no state
    } catch (err) {
      setError(errorMessage(err))
    }

    setUploading(false)
  }

  return (
    <div className="min-h-[78vh] flex items-center justify-center bg-base-100 p-4 sm:p-6">
      <form className="card bg-neutral w-full max-w-md shadow-xl" onSubmit={handleSubmit}>
        <div className="card-body gap-3">
          <h2 className="card-title justify-center">Upload movie</h2>
          <p className="text-sm text-center opacity-70">Fill in the details and choose the file</p>

          <label className="label" htmlFor="movie-file">Video file</label>
          <input
            id="movie-file"
            type="file"
            accept="video/*"
            required
            onChange={handleFileSelect}
            className="file-input file-input-bordered w-full"
          />

          <label className="label" htmlFor="movie-title">Title</label>
          <input
            id="movie-title"
            className="input input-bordered w-full"
            placeholder="Movie name"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="label" htmlFor="movie-category">Category</label>
          <input
            id="movie-category"
            className="input input-bordered w-full"
            placeholder="E.g: Action, Drama"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <label className="label" htmlFor="movie-description">Description</label>
          <textarea
            id="movie-description"
            className="textarea textarea-bordered w-full"
            placeholder="Video details"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            type="submit"
            className="btn btn-primary w-full mt-2"
            disabled={uploading}
          >
            {uploading ? 'Saving...' : 'Save Movie'}
          </button>

          {uploading && <progress className="progress progress-primary w-full" value={progress} max={100} />}

          {error && <div role="alert" className="alert alert-error text-sm">{error}</div>}

          {success && (
            <div role="status" className="alert alert-success text-sm">
              Your video was uploaded.
              <Link to="/my-videos" className="link">See my videos</Link>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default UploadPage
