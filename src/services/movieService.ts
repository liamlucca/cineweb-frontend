import type {
  Movie, MovieDTO, MovieUpdate, MovieUploadData,
} from '../types/index.ts';
import {
  API_URL, ApiError, CONNECTION_ERROR, GENERIC_ERROR, authHeader,
} from './api.ts';

const NOT_FOUND_ERROR = 'We couldn\'t find that video.';

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(CONNECTION_ERROR);
  }

  if (response.status === 404) throw new ApiError(NOT_FOUND_ERROR);
  if (!response.ok) throw new ApiError(GENERIC_ERROR);
  return response;
}

async function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

// Full URL of a video file served by the backend (path looks like "/movies/123-name.mp4")
export function videoUrl(path: string): string {
  return `${API_URL}${path}`;
}

// Simplified shape used by the movie cards
export function toMovie(movie: MovieDTO): Movie {
  return {
    id: movie.id,
    title: movie.title,
    platform: movie.category,
    file: videoUrl(movie.path),
  };
}

export async function getMovies(): Promise<MovieDTO[]> {
  const data = await readJson(await request('/api/movie'));
  if (!Array.isArray(data)) throw new ApiError(GENERIC_ERROR);
  return data as MovieDTO[];
}

export async function getMovie(id: string): Promise<MovieDTO> {
  const data = await readJson(await request(`/api/movie/${encodeURIComponent(id)}`));
  const movie = (data as { movie?: MovieDTO } | null)?.movie;
  if (!movie) throw new ApiError(GENERIC_ERROR);
  return movie;
}

export async function updateMovie(id: number, changes: MovieUpdate): Promise<void> {
  await request(`/api/movie/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(changes),
  });
}

export async function deleteMovie(id: number): Promise<void> {
  await request(`/api/movie/${id}`, { method: 'DELETE', headers: authHeader() });
}

// Uses XMLHttpRequest instead of fetch because fetch cannot report upload progress
export function uploadMovie(
  data: MovieUploadData,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  // NOTE: keep this key as 'file', the backend's multer config expects that exact field name
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else if (xhr.status === 400) reject(new ApiError('Please check the information you entered.'));
      else reject(new ApiError(GENERIC_ERROR));
    });
    xhr.addEventListener('error', () => reject(new ApiError(CONNECTION_ERROR)));

    xhr.open('POST', `${API_URL}/api/movie`);
    Object.entries(authHeader()).forEach(([name, value]) => xhr.setRequestHeader(name, value));
    xhr.send(formData);
  });
}
