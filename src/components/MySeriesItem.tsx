import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Series } from '../types/index.ts';
import { deleteSeries, updateSeries } from '../services/seriesService.ts';
import { errorMessage } from '../services/api.ts';

interface MySeriesItemProps {
  series: Series
  onUpdated: (series: Series) => void
  onDeleted: (id: number) => void
}

// One of the user's series in "My Videos": view, edit or delete it
function MySeriesItem({ series, onUpdated, onDeleted }: MySeriesItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(series.title);
  const [category, setCategory] = useState(series.category);
  const [description, setDescription] = useState(series.description);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function startEditing() {
    setTitle(series.title);
    setCategory(series.category);
    setDescription(series.description);
    setError('');
    setEditing(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      onUpdated(await updateSeries(series.id, {
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
      }));
      setEditing(false);
    } catch (err) {
      setError(errorMessage(err));
    }
    setBusy(false);
  }

  async function remove() {
    if (!window.confirm(`Delete "${series.title}" with all its seasons and episodes? This cannot be undone.`)) return;
    setBusy(true);
    setError('');
    try {
      await deleteSeries(series.id);
      onDeleted(series.id);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 border-b pb-6">
      {/* Cover placeholder, same size as the movie videos */}
      <div className="w-full max-w-64 h-36 rounded bg-base-300 flex items-center justify-center">
        <span className="badge badge-secondary">Series</span>
      </div>

      {editing ? (
        <form className="flex-1 w-full flex flex-col gap-3" onSubmit={save}>
          <label className="flex flex-col gap-1">
            <span className="font-bold">Title:</span>
            <input className="input input-bordered w-full" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-bold">Category:</span>
            <input className="input input-bordered w-full" required value={category} onChange={(e) => setCategory(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-bold">Description:</span>
            <textarea className="textarea textarea-bordered w-full" value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          {error && <div role="alert" className="alert alert-error text-sm">{error}</div>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn btn-success w-32" disabled={busy}>
              {busy && <span className="loading loading-spinner loading-sm" />}
              Save
            </button>
            <button type="button" className="btn btn-outline w-32" onClick={() => setEditing(false)} disabled={busy}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex-1 w-full">
            <p className="text-lg"><strong>Title:</strong> {series.title}</p>
            <p className="text-lg"><strong>Category:</strong> {series.category}</p>
            <p className="text-lg"><strong>Description:</strong> {series.description}</p>
            {error && <div role="alert" className="alert alert-error text-sm mt-2">{error}</div>}
          </div>

          <div className="flex flex-col items-center justify-center gap-3">
            <Link to={`/series/${series.id}/seasons`} className="btn btn-outline w-32">See seasons</Link>
            <button type="button" className="btn btn-outline w-32" onClick={startEditing} disabled={busy}>Edit</button>
            <button type="button" className="btn btn-error w-32" onClick={remove} disabled={busy}>
              {busy && <span className="loading loading-spinner loading-sm" />}
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default MySeriesItem;
