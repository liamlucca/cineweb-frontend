import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Season } from '../types/index.ts';
import { deleteSeason, getSeasons, updateSeason } from '../services/seriesService.ts';
import { errorMessage } from '../services/api.ts';
import RequestStatus from './RequestStatus.tsx';
import EpisodesManager from './EpisodesManager.tsx';

interface SeasonRowProps {
  season: Season
  onUpdated: (season: Season) => void
  onDeleted: (id: number) => void
}

// One season: edit its number and description, delete it, or open its episodes
function SeasonRow({ season, onUpdated, onDeleted }: SeasonRowProps) {
  const [editing, setEditing] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [number, setNumber] = useState(String(season.seasonNumber));
  const [description, setDescription] = useState(season.description);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function startEditing() {
    setNumber(String(season.seasonNumber));
    setDescription(season.description);
    setError('');
    setEditing(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      onUpdated(await updateSeason(season.id, { season_number: Number(number), description: description.trim() }));
      setEditing(false);
    } catch (err) {
      // a 409 explains that the number is already used in this series
      setError(errorMessage(err));
    }
    setBusy(false);
  }

  async function remove() {
    if (!window.confirm(`Delete season ${season.seasonNumber} and all its episodes? They will no longer be shown on CineWeb.`)) return;
    setBusy(true);
    setError('');
    try {
      await deleteSeason(season.id);
      onDeleted(season.id);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <li className="bg-base-200 rounded-box p-3 space-y-2">
      {editing ? (
        <form className="flex flex-col gap-2" onSubmit={save}>
          <label className="flex items-center gap-2">
            <span className="text-sm">Season</span>
            <input
              type="number"
              min={1}
              step={1}
              required
              aria-label="Season number"
              className="input input-bordered input-sm w-24"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
            />
          </label>
          <textarea
            aria-label="Season description"
            className="textarea textarea-bordered textarea-sm w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="submit" className="btn btn-xs btn-success" disabled={busy}>Save</button>
            <button type="button" className="btn btn-xs btn-ghost" onClick={() => setEditing(false)} disabled={busy}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold">Season {season.seasonNumber}</span>
          <span className="text-sm opacity-70 flex-1 min-w-0 truncate">{season.description}</span>
          <button
            type="button"
            className="btn btn-xs btn-outline"
            onClick={() => setShowEpisodes((shown) => !shown)}
            aria-expanded={showEpisodes}
          >
            {showEpisodes ? 'Hide episodes' : 'Episodes'}
          </button>
          <button type="button" className="btn btn-xs btn-ghost" onClick={startEditing} disabled={busy}>Edit</button>
          <button type="button" className="btn btn-xs btn-error btn-outline" onClick={remove} disabled={busy}>Delete</button>
        </div>
      )}
      {error && <p role="alert" className="text-xs text-error">{error}</p>}
      {showEpisodes && <EpisodesManager seasonId={season.id} />}
    </li>
  );
}

interface SeasonsManagerProps {
  seriesId: number
}

// The seasons of one of the user's series, managed from "My Videos"
function SeasonsManager({ seriesId }: SeasonsManagerProps) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getSeasons(String(seriesId))
      .then((data) => {
        if (!cancelled) setSeasons(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [seriesId]);

  return (
    <RequestStatus loading={loading} error={error} isEmpty={seasons.length === 0} emptyMessage="This series has no seasons yet.">
      <ul className="space-y-2">
        {seasons.map((season) => (
          <SeasonRow
            key={season.id}
            season={season}
            onUpdated={(updated) => setSeasons((current) => current
              .map((item) => (item.id === updated.id ? updated : item))
              .sort((a, b) => a.seasonNumber - b.seasonNumber))}
            onDeleted={(id) => setSeasons((current) => current.filter((item) => item.id !== id))}
          />
        ))}
      </ul>
    </RequestStatus>
  );
}

export default SeasonsManager;
