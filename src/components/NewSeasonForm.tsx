import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Season, Series } from '../types/index.ts';
import { createSeason } from '../services/seriesService.ts';
import { errorMessage } from '../services/api.ts';

interface NewSeasonFormProps {
  // series the user can add a season to
  series: Series[]
  onCreated: (season: Season) => void
}

function NewSeasonForm({ series, onCreated }: NewSeasonFormProps) {
  const [seriesId, setSeriesId] = useState('');
  const [seasonNumber, setSeasonNumber] = useState('1');
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
      const season = await createSeason({
        id_serie: Number(seriesId),
        season_number: Number(seasonNumber),
        description: description.trim(),
      });
      setSuccess(`Season ${season.seasonNumber} was added. Now upload its episodes.`);
      setDescription('');
      // the next season is the most likely one to add after this
      setSeasonNumber(String(season.seasonNumber + 1));
      onCreated(season);
    } catch (err) {
      setError(errorMessage(err));
    }

    setSubmitting(false);
  }

  return (
    <form className="card bg-neutral shadow-xl" onSubmit={handleSubmit}>
      <div className="card-body gap-3">
        <h2 className="card-title">2. New season</h2>

        {series.length === 0 && <p className="text-sm opacity-70">You have no series yet. Create one first.</p>}

        <label className="label" htmlFor="season-series">Series</label>
        <select
          id="season-series"
          className="select select-bordered w-full"
          required
          value={seriesId}
          onChange={(e) => setSeriesId(e.target.value)}
        >
          <option value="" disabled>Choose a series</option>
          {series.map((item) => (
            <option key={item.id} value={item.id}>{item.title}</option>
          ))}
        </select>

        <label className="label" htmlFor="season-number">Season number</label>
        <input
          id="season-number"
          type="number"
          min={1}
          step={1}
          className="input input-bordered w-full"
          required
          value={seasonNumber}
          onChange={(e) => setSeasonNumber(e.target.value)}
        />

        <label className="label" htmlFor="season-description">Description</label>
        <textarea
          id="season-description"
          className="textarea textarea-bordered w-full"
          placeholder="What happens in this season?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit" className="btn btn-primary w-full mt-2" disabled={submitting || series.length === 0}>
          {submitting ? 'Adding...' : 'Add season'}
        </button>

        {error && <div role="alert" className="alert alert-error text-sm">{error}</div>}
        {success && <div role="status" className="alert alert-success text-sm">{success}</div>}
      </div>
    </form>
  );
}

export default NewSeasonForm;
