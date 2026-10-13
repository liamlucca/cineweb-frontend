import { useState } from 'react';
import { mediaUrl } from '../services/api.ts';
import { gradientFor } from '../utils/catalog.ts';

interface ThumbnailProps {
  // "/thumbnails/..." from the backend, or null for content uploaded before thumbnails existed
  path: string | null | undefined
  title: string
  className?: string
}

// The image of a movie, series or episode. Without one (or if it fails to load) it shows a
// gradient with the title, so a card is never an empty box.
function Thumbnail({ path, title, className = '' }: ThumbnailProps) {
  const [failed, setFailed] = useState(false);
  const src = mediaUrl(path);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`w-full h-full flex items-end p-3 bg-gradient-to-br ${gradientFor(title)} ${className}`} aria-hidden="true">
      <span className="text-white font-extrabold leading-tight line-clamp-3 drop-shadow text-lg">{title}</span>
    </div>
  );
}

export default Thumbnail;
