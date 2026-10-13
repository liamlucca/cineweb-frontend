import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { WatchLaterType } from '../types/index.ts';
import { addToWatchLater, getWatchLater, removeFromWatchLater } from '../services/watchLaterService.ts';
import { errorMessage } from '../services/api.ts';
import useAuth from '../hooks/useAuth.ts';
import useToast from '../hooks/useToast.ts';

interface WatchLaterButtonProps {
  type: WatchLaterType
  id: number
}

// "Add to Watch later" (sketch 3). Viewers can save or remove the content; guests are invited to log in.
function WatchLaterButton({ type, id }: WatchLaterButtonProps) {
  const { user } = useAuth();
  const { notify } = useToast();
  const isViewer = user?.role === 'viewer';
  // id of the list item when the content is saved, null when it is not
  const [itemId, setItemId] = useState<number | null>(null);
  const [loading, setLoading] = useState(isViewer);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isViewer) return undefined;
    let cancelled = false;
    setLoading(true);
    getWatchLater()
      .then((items) => {
        if (cancelled) return;
        const saved = items.find((item) => item.audiovisualType === type && item.audiovisualId === id);
        setItemId(saved?.id ?? null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [isViewer, type, id]);

  async function toggle() {
    setBusy(true);
    setError('');
    try {
      if (itemId === null) {
        setItemId(await addToWatchLater(type, id));
        notify('Added to your Watch later list.');
      } else {
        await removeFromWatchLater(itemId);
        setItemId(null);
        notify('Removed from your Watch later list.', 'info');
      }
    } catch (err) {
      setError(errorMessage(err));
    }
    setBusy(false);
  }

  // administrators do not have a list
  if (user && !isViewer) return null;

  if (!user) {
    return <Link to="/login" className="btn btn-sm btn-outline">＋ Watch later</Link>;
  }

  const saved = itemId !== null;
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        className={`btn btn-sm ${saved ? 'btn-secondary' : 'btn-outline'}`}
        onClick={toggle}
        disabled={loading || busy}
        aria-pressed={saved}
      >
        {(loading || busy) && <span className="loading loading-spinner loading-xs" />}
        {saved ? '✓ In Watch later' : '＋ Watch later'}
      </button>
      {error && <p role="alert" className="text-xs text-error">{error}</p>}
    </div>
  );
}

export default WatchLaterButton;
