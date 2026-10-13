import { describe, expect, it } from 'vitest';
import type { MovieDTO } from '../types/index.ts';
import { toMovie } from './movieService.ts';

const MOVIE_FROM_BACKEND: MovieDTO = {
  id: 7,
  id_author: 3,
  path: '/movies/7-trailer.mp4',
  title: 'Trailer',
  category: 'Action',
  views: 12,
  description: 'A short trailer',
  state: 'active',
  uploader_user_name: 'ana',
  thumbnail_path: '/thumbnails/7.jpg',
  duration: 95,
};

describe('toMovie', () => {
  it('converts the backend movie to camelCase', () => {
    expect(toMovie(MOVIE_FROM_BACKEND)).toEqual({
      id: 7,
      title: 'Trailer',
      category: 'Action',
      description: 'A short trailer',
      path: '/movies/7-trailer.mp4',
      views: 12,
      uploaderId: 3,
      uploaderUsername: 'ana',
      thumbnailPath: '/thumbnails/7.jpg',
      duration: 95,
    });
  });

  it('uses null for the fields old movies do not have', () => {
    const movie = toMovie({
      ...MOVIE_FROM_BACKEND,
      uploader_user_name: undefined,
      thumbnail_path: undefined,
      duration: undefined,
    });

    expect(movie.uploaderUsername).toBeNull();
    expect(movie.thumbnailPath).toBeNull();
    expect(movie.duration).toBeNull();
  });
});
