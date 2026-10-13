import { Link } from 'react-router-dom';
import type { CatalogItem } from '../types/index.ts';
import { catalogItemPath, formatDuration } from '../utils/catalog.ts';
import Thumbnail from './Thumbnail.tsx';

interface ContentCardProps {
  item: CatalogItem
}

// A movie or series card: thumbnail with its type and duration, title and category.
// The whole card is a link to its page.
function ContentCard({ item }: ContentCardProps) {
  const duration = formatDuration(item.duration);

  return (
    <Link
      to={catalogItemPath(item)}
      className="group block rounded-box focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`${item.title} (${item.kind === 'series' ? 'series' : 'movie'})`}
    >
      <figure className="relative aspect-video rounded-box overflow-hidden bg-base-300 shadow-md transition duration-300 group-hover:shadow-xl group-hover:ring-2 group-hover:ring-primary/70">
        <Thumbnail path={item.thumbnailPath} title={item.title} className="transition-transform duration-300 group-hover:scale-105" />
        <span className={`badge badge-sm absolute top-2 left-2 ${item.kind === 'series' ? 'badge-secondary' : 'badge-primary'}`}>
          {item.kind === 'series' ? 'Series' : 'Movie'}
        </span>
        {duration && <span className="badge badge-sm badge-neutral absolute bottom-2 right-2">{duration}</span>}
      </figure>
      <div className="pt-2 px-1">
        <p className="font-semibold leading-snug truncate group-hover:text-primary">{item.title}</p>
        <p className="text-xs opacity-60 truncate">{item.category}</p>
      </div>
    </Link>
  );
}

export default ContentCard;
