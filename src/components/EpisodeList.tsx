import { Link } from 'react-router-dom';
import type { Episode } from '../types/index.ts';
import { formatDuration } from '../utils/catalog.ts';
import Thumbnail from './Thumbnail.tsx';

interface EpisodeListProps {
  seriesId: number | string
  seasonId: number | string
  episodes: Episode[]
  // the episode being watched, highlighted in the list
  currentEpisodeId?: number
}

// The episodes of a season: thumbnail, number, title, duration and description, each linking to its player
function EpisodeList({
  seriesId, seasonId, episodes, currentEpisodeId,
}: EpisodeListProps) {
  if (episodes.length === 0) {
    return <p className="opacity-70">This season has no episodes yet.</p>;
  }

  return (
    <ol className="space-y-3">
      {episodes.map((episode) => {
        const current = episode.id === currentEpisodeId;
        const duration = formatDuration(episode.duration);
        return (
          <li key={episode.id}>
            <Link
              to={`/watch-series/${seriesId}/${seasonId}/${episode.id}`}
              className={`group flex gap-3 sm:gap-4 rounded-box p-2 transition-colors hover:bg-base-200 ${current ? 'bg-base-200 ring-1 ring-primary' : ''}`}
              aria-current={current ? 'true' : undefined}
            >
              <figure className="relative w-32 sm:w-44 shrink-0 aspect-video rounded-box overflow-hidden bg-base-300">
                <Thumbnail path={episode.thumbnailPath} title={episode.title} className="transition-transform duration-300 group-hover:scale-105" />
                {duration && <span className="badge badge-xs badge-neutral absolute bottom-1 right-1">{duration}</span>}
              </figure>
              <div className="min-w-0 py-1">
                <p className="font-semibold group-hover:text-primary">
                  <span className="opacity-60">{episode.number}.</span> {episode.title}
                  {current && <span className="badge badge-primary badge-xs ml-2 align-middle">Playing</span>}
                </p>
                {episode.description && <p className="text-sm opacity-70 line-clamp-2">{episode.description}</p>}
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export default EpisodeList;
