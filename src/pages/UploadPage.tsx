import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import type { MovieUploadData } from '../types/index.ts'
import { uploadMovie } from '../services/movieService.ts'
import { errorMessage } from '../services/api.ts'

function UploadPage() {
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
      if (!title) setTitle(selectedFile.name) // use the file name as default
    }
  }

  async function handleSubmit() {
    if (!file) return

    if (title.trim() === '') {
      setError('Please give your video a title.')
      return
    }

    setUploading(true)
    setProgress(0)
    setSuccess(false)
    setError('')

    const movieData: MovieUploadData = {
      // TODO: the backend still requires id_author. Remove it once it takes the uploader from the token.
      id_author: 2,
      title: title.trim(),
      category: category.trim() || 'General',
      views: 0,
      description: description.trim() || 'No description',
      report: false,
      state: true
    }

    try {
      await uploadMovie(movieData, file, setProgress)
      setSuccess(true)
    } catch (err) {
      setError(errorMessage(err))
    }

    setUploading(false)
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
            type="button"
            className="btn bg-primary text-primary-content w-full mt-2"
            onClick={handleSubmit}
            disabled={!file || uploading /* disable the submit button if there's no file or it's already uploading */}
          >
            {uploading ? 'Saving...' : 'Save Movie'}
          </button>

          {uploading && <progress className="progress progress-primary w-full" value={progress} max={100} />} {/*the progress bar*/}

          {error && <div role="alert" className="alert alert-error text-sm">{error}</div>}

          {success && (
            <div role="status" className="alert alert-success text-sm">
              Your video was uploaded.
              <Link to="/my-videos" className="link">See my videos</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadPage
