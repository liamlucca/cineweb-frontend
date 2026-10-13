import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Episode } from '../types/index.ts';
import { deleteEpisode, getEpisodes, updateEpisode } from '../services/seriesService.ts';
import { errorMessage } from '../services/api.ts';
import RequestStatus from './RequestStatus.tsx';
import useToast from '../hooks/useToast.ts';

interface EpisodeRowProps {
  episode: Episode
  onUpdated: (episode: Episode) => void
  onDeleted: (id: number) => void
}

// One episode: shows it, or edits its number, title and description in place
function EpisodeRow({ episode, onUpdated, onDeleted }: EpisodeRowProps) {
  const { notify } = useToast();
  const [editing, setEditing] = useState(false);
  const [number, setNumber] = useState(String(episode.number));
  const [title, setTitle] = useState(episode.title);
  const [description, setDescription] = useState(episode.description);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function startEditing() {
    setNumber(String(episode.number));
    setTitle(episode.title);
    setDescription(episode.description);
    setError('');
    setEditing(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      onUpdated(await updateEpisode(episode.id, {
        episode_number: Number(number),
        title: title.trim(),
        description: description.trim(),
      }));
      setEditing(false);
      notify('The episode was saved.');
    } catch (err) {
      // a 409 explains that the number is already used in this season
      setError(errorMessage(err));
    }
    setBusy(false);
  }

  async function remove() {
    if (!window.confirm(`Delete episode ${episode.number}, "${episode.title}"? It will no longer be shown on CineWeb.`)) return;
    setBusy(true);
    setError('');
    try {
      await deleteEpisode(episode.id);
      notify('The episode was deleted.');
      onDeleted(episode.id);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <li className="bg-base-100 rounded-box p-3">
      {editing ? (
        <form className="grid grid-cols-1 sm:grid-cols-[6rem_1fr] gap-2" onSubmit={save}>
          <input
            type="number"
            min={1}
            step={1}
            required
            aria-label="Episode number"
            className="input input-bordered input-sm w-full"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />
          <input
            required
            maxLength={255}
            aria-label="Episode title"
            className="input input-bordered input-sm w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            aria-label="Episode description"
            className="textarea textarea-bordered textarea-sm w-full sm:col-span-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="btn btn-xs btn-success" disabled={busy}>Save</button>
            <button type="button" className="btn btn-xs btn-ghost" onClick={() => setEditing(false)} disabled={busy}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold flex-1 min-w-0 truncate">{episode.number}. {episode.title}</span>
          <button type="button" className="btn btn-xs btn-ghost" onClick={startEditing} disabled={busy}>Edit</button>
          <button type="button" className="btn btn-xs btn-error btn-outline" onClick={remove} disabled={busy}>Delete</button>
        </div>
      )}
      {error && <p role="alert" className="text-xs text-error mt-1">{error}</p>}
    </li>
  );
}

interface EpisodesManagerProps {
  seasonId: number
}

// The episodes of one season, each one editable and deletable by the uploader
function EpisodesManager({ seasonId }: EpisodesManagerProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getEpisodes(String(seasonId))
      .then((data) => {
        if (!cancelled) setEpisodes(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [seasonId]);

  return (
    <RequestStatus loading={loading} error={error} isEmpty={episodes.length === 0} emptyMessage="This season has no episodes yet.">
      <ul className="space-y-2">
        {episodes.map((episode) => (
          <EpisodeRow
            key={episode.id}
            episode={episode}
            onUpdated={(updated) => setEpisodes((current) => current
              .map((item) => (item.id === updated.id ? updated : item))
              .sort((a, b) => a.number - b.number))}
            onDeleted={(id) => setEpisodes((current) => current.filter((item) => item.id !== id))}
          />
        ))}
      </ul>
    </RequestStatus>
  );
}

export default EpisodesManager;
