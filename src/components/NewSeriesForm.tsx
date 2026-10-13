import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Series } from '../types/index.ts';
import { createSeries } from '../services/seriesService.ts';
import { errorMessage } from '../services/api.ts';

interface NewSeriesFormProps {
  onCreated: (series: Series) => void
}

// The backend takes the uploader from the token
function NewSeriesForm({ onCreated }: NewSeriesFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  // optional cover image; without it the series shows its first episode's thumbnail
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // free the preview image's memory when it changes or the form goes away
  useEffect(() => () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
  }, [coverPreview]);

  function handleCoverSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setCover(file);
    setCoverPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // keep the form: event.currentTarget is null after the await
    const form = event.currentTarget;
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const series = await createSeries({
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
      }, cover);
      setSuccess(`"${series.title}" was created. Now add its first season.`);
      setTitle('');
      setCategory('');
      setDescription('');
      setCover(null);
      setCoverPreview(null);
      form.reset();
      onCreated(series);
    } catch (err) {
      setError(errorMessage(err));
    }

    setSubmitting(false);
  }

  return (
    <form className="card bg-neutral shadow-xl" onSubmit={handleSubmit}>
      <div className="card-body gap-3">
        <h2 className="card-title">1. New series</h2>

        <label className="label" htmlFor="series-title">Title</label>
        <input
          id="series-title"
          className="input input-bordered w-full"
          placeholder="Series name"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="label" htmlFor="series-category">Category</label>
        <input
          id="series-category"
          className="input input-bordered w-full"
          placeholder="E.g: Drama, Comedy"
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <label className="label" htmlFor="series-description">Description</label>
        <textarea
          id="series-description"
          className="textarea textarea-bordered w-full"
          placeholder="What is the series about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="label" htmlFor="series-cover">Cover image (optional)</label>
        <input
          id="series-cover"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="file-input file-input-bordered w-full"
          onChange={handleCoverSelect}
        />
        <p className="text-xs opacity-70">Without a cover, the series shows a frame of its first episode.</p>
        {coverPreview && (
          <figure className="rounded-box overflow-hidden aspect-video bg-base-300">
            <img src={coverPreview} alt="Chosen cover" className="w-full h-full object-cover" />
          </figure>
        )}

        <button type="submit" className="btn btn-primary w-full mt-2" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create series'}
        </button>

        {error && <div role="alert" className="alert alert-error text-sm">{error}</div>}
        {success && <div role="status" className="alert alert-success text-sm">{success}</div>}
      </div>
    </form>
  );
}

export default NewSeriesForm;
