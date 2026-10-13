import { Link } from 'react-router-dom';
import type { CatalogItem } from '../types/index.ts';
import { catalogItemPath, formatDuration } from '../utils/catalog.ts';
import Thumbnail from './Thumbnail.tsx';
import WatchLaterButton from './WatchLaterButton.tsx';

interface HeroProps {
  // the featured movie or series
  item: CatalogItem
}

// Big banner at the top of the landing page with one featured movie or series
function Hero({ item }: HeroProps) {
  const duration = formatDuration(item.duration);

  return (
    <section className="relative overflow-hidden bg-base-300" aria-label="Featured">
      {/* the thumbnail fills the banner; the gradients keep the text readable */}
      <div className="absolute inset-0">
        <Thumbnail path={item.thumbnailPath} title="" className="opacity-60" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-base-100/90 via-base-100/30 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 pt-24 pb-10 sm:pt-32 md:pt-40 lg:pt-48 md:pb-14">
        <div className="max-w-xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-outline">Featured</span>
            <span className={`badge ${item.kind === 'series' ? 'badge-secondary' : 'badge-primary'}`}>
              {item.kind === 'series' ? 'Series' : 'Movie'}
            </span>
            {item.category && <span className="badge badge-ghost">{item.category}</span>}
            {duration && <span className="badge badge-ghost">{duration}</span>}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight drop-shadow">{item.title}</h1>
          {item.description && <p className="opacity-90 line-clamp-3 md:text-lg">{item.description}</p>}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to={catalogItemPath(item)} className="btn btn-primary">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              {item.kind === 'series' ? 'See seasons' : 'Watch now'}
            </Link>
            <WatchLaterButton type={item.kind} id={item.id} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
