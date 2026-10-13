import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { VideoInfo } from '../utils/videoThumbnail.ts';
import { captureVideoInfo } from '../utils/videoThumbnail.ts';
import { formatDuration } from '../utils/catalog.ts';

interface VideoPickerProps {
  id: string
  // tells the form which file was chosen, with the thumbnail and duration read from it
  onPicked: (file: File, info: VideoInfo) => void
  disabled?: boolean
}

// File input for a video. When a file is chosen it captures a thumbnail (near second 2)
// and reads the duration, and shows them as a preview before uploading.
function VideoPicker({ id, onPicked, disabled = false }: VideoPickerProps) {
  const [reading, setReading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [noThumbnail, setNoThumbnail] = useState(false);

  // free the preview image's memory when it changes or the form goes away
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setReading(true);
    setNoThumbnail(false);
    const info = await captureVideoInfo(file);
    setPreviewUrl(info.thumbnail ? URL.createObjectURL(info.thumbnail) : null);
    setNoThumbnail(info.thumbnail === null);
    setDuration(info.duration);
    setReading(false);
    onPicked(file, info);
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        id={id}
        type="file"
        accept="video/*"
        required
        disabled={disabled}
        onChange={handleChange}
        className="file-input file-input-bordered w-full"
      />
      {reading && (
        <p className="text-sm opacity-70 flex items-center gap-2">
          <span className="loading loading-spinner loading-xs" /> Preparing the thumbnail...
        </p>
      )}
      {!reading && previewUrl && (
        <figure className="relative rounded-box overflow-hidden aspect-video bg-base-300">
          <img src={previewUrl} alt="Thumbnail of the chosen video" className="w-full h-full object-cover" />
          {duration !== null && (
            <span className="badge badge-neutral badge-sm absolute bottom-2 right-2">{formatDuration(duration)}</span>
          )}
        </figure>
      )}
      {!reading && noThumbnail && (
        <p className="text-xs opacity-70">
          This browser could not read a frame of the video. It will be uploaded without a thumbnail.
        </p>
      )}
    </div>
  );
}

export default VideoPicker;
