import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { Season, Series } from '../types/index.ts';
import { getSeasons, uploadEpisode } from '../services/seriesService.ts';
import { errorMessage } from '../services/api.ts';

interface NewEpisodeFormProps {
  series: Series[]
  // id of the logged-in user (the backend still requires id_author)
  authorId: number
  // last season created on the page, so its series' season list is fetched again
  newestSeason: Season | null
}

function NewEpisodeForm({ series, authorId, newestSeason }: NewEpisodeFormProps) {
  const [seriesId, setSeriesId] = useState('');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [seasonsError, setSeasonsError] = useState('');
  const [seasonId, setSeasonId] = useState('');

  const [episodeNumber, setEpisodeNumber] = useState('1');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  // link to the season's episode list, shown after a successful upload
  const [uploadedTo, setUploadedTo] = useState('');

  // load the seasons of the chosen series
  useEffect(() => {
    if (!seriesId) return undefined;

    let cancelled = false;
    setLoadingSeasons(true);
    setSeasonsError('');

    getSeasons(seriesId)
      .then((data) => {
        if (!cancelled) setSeasons(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setSeasonsError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoadingSeasons(false);
      });

    return () => { cancelled = true; };
  }, [seriesId, newestSeason]);

  function handleSeriesChange(e: ChangeEvent<HTMLSelectElement>) {
    setSeriesId(e.target.value);
    // the old season belongs to another series
    setSeasonId('');
    setSeasons([]);
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    // keep the form: event.currentTarget is null after the await
    const form = event.currentTarget;

    setUploading(true);
    setProgress(0);
    setError('');
    setUploadedTo('');

    try {
      await uploadEpisode({
        id_season: Number(seasonId),
        episode_number: Number(episodeNumber),
        title: title.trim(),
        description: description.trim(),
        id_author: authorId,
      }, file, setProgress);
      setUploadedTo(`/series/${seriesId}/season/${seasonId}/episodes`);
      // ready for the next episode of the same season
      setEpisodeNumber(String(Number(episodeNumber) + 1));
      setTitle('');
      setDescription('');
      setFile(null);
      form.reset();
    } catch (err) {
      setError(errorMessage(err));
    }

    setUploading(false);
  }

  return (
    <form className="card bg-neutral shadow-xl" onSubmit={handleSubmit}>
      <div className="card-body gap-3">
        <h2 className="card-title">3. New episode</h2>

        <label className="label" htmlFor="episode-series">Series</label>
        <select
          id="episode-series"
          className="select select-bordered w-full"
          required
          value={seriesId}
          onChange={handleSeriesChange}
        >
          <option value="" disabled>Choose a series</option>
          {series.map((item) => (
            <option key={item.id} value={item.id}>{item.title}</option>
          ))}
        </select>

        <label className="label" htmlFor="episode-season">Season</label>
        <select
          id="episode-season"
          className="select select-bordered w-full"
          required
          disabled={!seriesId || loadingSeasons}
          value={seasonId}
          onChange={(e) => setSeasonId(e.target.value)}
        >
          <option value="" disabled>{loadingSeasons ? 'Loading seasons...' : 'Choose a season'}</option>
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>Season {season.seasonNumber}</option>
          ))}
        </select>
        {seasonsError && <p role="alert" className="text-sm text-error">{seasonsError}</p>}
        {seriesId && !loadingSeasons && !seasonsError && seasons.length === 0 && (
          <p className="text-sm opacity-70">This series has no seasons yet. Add one first.</p>
        )}

        <label className="label" htmlFor="episode-number">Episode number</label>
        <input
          id="episode-number"
          type="number"
          min={1}
          step={1}
          className="input input-bordered w-full"
          required
          value={episodeNumber}
          onChange={(e) => setEpisodeNumber(e.target.value)}
        />

        <label className="label" htmlFor="episode-title">Title</label>
        <input
          id="episode-title"
          className="input input-bordered w-full"
          placeholder="Episode name"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="label" htmlFor="episode-description">Description</label>
        <textarea
          id="episode-description"
          className="textarea textarea-bordered w-full"
          placeholder="What happens in this episode?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="label" htmlFor="episode-file">Video file</label>
        <input
          id="episode-file"
          type="file"
          accept="video/*"
          className="file-input file-input-bordered w-full"
          required
          onChange={handleFileSelect}
        />

        <button type="submit" className="btn btn-primary w-full mt-2" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload episode'}
        </button>

        {uploading && <progress className="progress progress-primary w-full" value={progress} max={100} />}

        {error && <div role="alert" className="alert alert-error text-sm">{error}</div>}

        {uploadedTo && (
          <div role="status" className="alert alert-success text-sm">
            The episode was uploaded.
            <Link to={uploadedTo} className="link">See the episodes</Link>
          </div>
        )}
      </div>
    </form>
  );
}

export default NewEpisodeForm;
