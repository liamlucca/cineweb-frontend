// Reads a video file in the browser to get its length and a thumbnail, before uploading it.
// No React and no HTTP: it only uses the browser's <video> and <canvas> elements.

export interface VideoInfo {
  // JPEG image of a frame near second 2, or null if the browser could not draw one
  thumbnail: Blob | null
  // length in whole seconds, or null if the file does not say
  duration: number | null
}

// the frame used as thumbnail: second 2, or the middle of shorter videos
const FRAME_SECOND = 2;
// thumbnails are scaled down to this width, keeping the proportions
const MAX_WIDTH = 640;
const JPEG_QUALITY = 0.82;
// some files never fire the events: give up after a while instead of waiting forever
const TIMEOUT_MS = 10000;

export function captureVideoInfo(file: File): Promise<VideoInfo> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    let duration: number | null = null;
    let done = false;

    function finish(thumbnail: Blob | null) {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve({ thumbnail, duration });
    }
    const timer = window.setTimeout(() => finish(null), TIMEOUT_MS);

    video.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(video.duration) && video.duration > 0) duration = Math.round(video.duration);
      // seeking makes the browser decode that frame; "seeked" fires when it is ready
      video.currentTime = Math.min(FRAME_SECOND, (duration ?? 0) / 2);
    });

    video.addEventListener('seeked', () => {
      if (!video.videoWidth || !video.videoHeight) {
        finish(null);
        return;
      }
      const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const context = canvas.getContext('2d');
      if (!context) {
        finish(null);
        return;
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => finish(blob), 'image/jpeg', JPEG_QUALITY);
    });

    // a file the browser cannot play still uploads, just without thumbnail or duration
    video.addEventListener('error', () => finish(null));

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = url;
  });
}
