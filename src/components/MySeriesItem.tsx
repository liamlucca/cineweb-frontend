import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Series } from '../types/index.ts';
import { deleteSeries, updateSeries } from '../services/seriesService.ts';
import { errorMessage } from '../services/api.ts';
import SeasonsManager from './SeasonsManager.tsx';
import Thumbnail from './Thumbnail.tsx';
import useToast from '../hooks/useToast.ts';
import useConfirm from '../hooks/useConfirm.ts';

interface MySeriesItemProps {
  series: Series
  onUpdated: (series: Series) => void
  onDeleted: (id: number) => void
}

// One of the user's series in "My Videos": view, edit or delete it, and manage its seasons and episodes
function MySeriesItem({ series, onUpdated, onDeleted }: MySeriesItemProps) {
  const { notify } = useToast();
  const { confirm } = useConfirm();
  const [editing, setEditing] = useState(false);
  const [managing, setManaging] = useState(false);
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
      notify('Your changes were saved.');
    } catch (err) {
      setError(errorMessage(err));
    }
    setBusy(false);
  }

  async function remove() {
    // logical delete: the backend hides the series with its seasons and episodes
    if (!(await confirm({
      title: `Delete "${series.title}"?`,
      message: 'Its seasons and episodes will be deleted too. They will no longer be shown on CineWeb.',
      confirmLabel: 'Delete',
      danger: true,
    }))) return;
    setBusy(true);
    setError('');
    try {
      await deleteSeries(series.id);
      notify(`"${series.title}" was deleted.`);
      onDeleted(series.id);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="border-b pb-6 space-y-4">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Cover (or the first episode's thumbnail), the same size as the movie thumbnails */}
        <Link
          to={`/series/${series.id}/seasons`}
          className="relative block w-full md:w-64 shrink-0 aspect-video rounded-box overflow-hidden bg-base-300"
          aria-label={`See ${series.title}`}
        >
          <Thumbnail path={series.thumbnailPath} title={series.title} />
          <span className="badge badge-secondary badge-sm absolute top-2 left-2">Series</span>
        </Link>

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
              <button
                type="button"
                className="btn btn-outline w-32"
                onClick={() => setManaging((open) => !open)}
                aria-expanded={managing}
              >
                {managing ? 'Close seasons' : 'Manage seasons'}
              </button>
              <button type="button" className="btn btn-error w-32" onClick={remove} disabled={busy}>
                {busy && <span className="loading loading-spinner loading-sm" />}
                Delete
              </button>
            </div>
          </>
        )}
      </div>
      {/* edit or delete the seasons and the episodes of this series */}
      {managing && <SeasonsManager seriesId={series.id} />}
    </div>
  );
}

export default MySeriesItem;
