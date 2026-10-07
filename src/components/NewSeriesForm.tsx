import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Series } from '../types/index.ts';
import { createSeries } from '../services/seriesService.ts';
import { errorMessage } from '../services/api.ts';

interface NewSeriesFormProps {
  // id of the logged-in user (the backend still requires id_author)
  authorId: number
  onCreated: (series: Series) => void
}

function NewSeriesForm({ authorId, onCreated }: NewSeriesFormProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const series = await createSeries({
        id_author: authorId,
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
      });
      setSuccess(`"${series.title}" was created. Now add its first season.`);
      setTitle('');
      setCategory('');
      setDescription('');
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
