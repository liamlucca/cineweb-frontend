import type {
  Movie, MovieDTO, MovieUpdate, MovieUploadData,
} from '../types/index.ts';
import {
  API_URL, ApiError, GENERIC_ERROR, authHeader, readJson, request, uploadWithProgress,
} from './api.ts';

const NOT_FOUND_ERROR = 'We couldn\'t find that video.';

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
  const data = await readJson(await request('/api/movie', NOT_FOUND_ERROR));
  if (!Array.isArray(data)) throw new ApiError(GENERIC_ERROR);
  return data as MovieDTO[];
}

export async function getMovie(id: string): Promise<MovieDTO> {
  const data = await readJson(await request(`/api/movie/${encodeURIComponent(id)}`, NOT_FOUND_ERROR));
  const movie = (data as { movie?: MovieDTO } | null)?.movie;
  if (!movie) throw new ApiError(GENERIC_ERROR);
  return movie;
}

export async function updateMovie(id: number, changes: MovieUpdate): Promise<void> {
  await request(`/api/movie/${id}`, NOT_FOUND_ERROR, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(changes),
  });
}

export async function deleteMovie(id: number): Promise<void> {
  await request(`/api/movie/${id}`, NOT_FOUND_ERROR, { method: 'DELETE', headers: authHeader() });
}

export function uploadMovie(
  data: MovieUploadData,
  file: File,
  onProgress: (percent: number) => void,
): Promise<void> {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  // NOTE: keep this key as 'file', the backend's multer config expects that exact field name
  formData.append('file', file);
  return uploadWithProgress('/api/movie', formData, onProgress);
}
