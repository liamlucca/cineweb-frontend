import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { WatchLaterItem } from '../types/index.ts';
import { getWatchLater, removeFromWatchLater } from '../services/watchLaterService.ts';
import { errorMessage } from '../services/api.ts';
import { contentPath } from '../utils/moderation.ts';
import RequestStatus from '../components/RequestStatus.tsx';
import useDocumentTitle from '../hooks/useDocumentTitle.ts';
import useToast from '../hooks/useToast.ts';

// The viewer's "Watch later" list (sketch 3): movies and series saved from their detail page
function WatchLaterPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<WatchLaterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [removeError, setRemoveError] = useState('');

  useEffect(() => {
    getWatchLater()
      .then(setItems)
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function remove(item: WatchLaterItem) {
    setBusyId(item.id);
    setRemoveError('');
    try {
      await removeFromWatchLater(item.id);
      setItems((current) => current.filter((saved) => saved.id !== item.id));
      notify(`"${item.title}" was removed from your list.`, 'info');
    } catch (err) {
      setRemoveError(errorMessage(err));
    }
    setBusyId(null);
  }

  // browser tab title
  useDocumentTitle('Watch later');

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">Watch later</h1>
      <p className="opacity-70 mb-6">Movies and series you saved to watch another time.</p>
      {removeError && <div role="alert" className="alert alert-error text-sm mb-4">{removeError}</div>}

      {!loading && !error && items.length === 0 ? (
        <div className="card bg-base-200">
          <div className="card-body items-center text-center gap-3">
            <p className="text-lg">Your list is empty.</p>
            <p className="opacity-70 text-sm">Press &quot;＋ Watch later&quot; on any movie or series to save it here.</p>
            <Link to="/search" className="btn btn-primary">Find something to watch</Link>
          </div>
        </div>
      ) : (
        <RequestStatus loading={loading} error={error} isEmpty={false} emptyMessage="">
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="card bg-base-200">
                <div className="card-body p-4 gap-3 sm:flex-row sm:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge badge-ghost badge-sm">{item.audiovisualType === 'movie' ? 'Movie' : 'Series'}</span>
                      {item.category && <span className="badge badge-outline badge-sm">{item.category}</span>}
                    </div>
                    <Link to={contentPath(item.audiovisualType, item.audiovisualId)} className="link link-hover text-lg font-semibold">
                      {item.title}
                    </Link>
                    {item.description && <p className="text-sm opacity-70 line-clamp-2">{item.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Link to={contentPath(item.audiovisualType, item.audiovisualId)} className="btn btn-sm btn-primary">
                      Watch
                    </Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => remove(item)}
                      disabled={busyId === item.id}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </RequestStatus>
      )}
    </div>
  );
}

export default WatchLaterPage;
