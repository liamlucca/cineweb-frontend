import type {
  Episode, EpisodeDTO, EpisodeUpdate, EpisodeUploadData, Season, SeasonDTO, SeasonUpdate, SeasonUploadData,
  Series, SeriesDTO, SeriesUpdate, SeriesUploadData,
} from '../types/index.ts';
import {
  ApiError, GENERIC_ERROR, authHeader, readJson, request, uploadWithProgress,
} from './api.ts';

const SERIES_NOT_FOUND = 'We couldn\'t find that series.';
const SEASON_NOT_FOUND = 'We couldn\'t find that season.';
const EPISODE_NOT_FOUND = 'We couldn\'t find that episode.';

// The backend sends snake_case; the pages use the camelCase types
function toSeries(dto: SeriesDTO): Series {
  return {
    id: dto.id,
    title: dto.title,
    category: dto.category,
    description: dto.description,
    uploaderId: dto.id_author,
    uploaderUsername: dto.uploader_user_name ?? null,
    thumbnailPath: dto.thumbnail_path ?? null,
  };
}

function toSeason(dto: SeasonDTO): Season {
  return {
    id: dto.id,
    seriesId: dto.id_serie,
    seasonNumber: dto.season_number,
    description: dto.description,
  };
}

function toEpisode(dto: EpisodeDTO): Episode {
  return {
    id: dto.id,
    seasonId: dto.id_season,
    number: dto.episode_number,
    title: dto.title,
    description: dto.description,
    path: dto.path,
    thumbnailPath: dto.thumbnail_path ?? null,
    duration: dto.duration ?? null,
  };
}

// GET endpoints that return a plain array
async function getList<T>(path: string, notFoundMessage: string): Promise<T[]> {
  const data = await readJson(await request(path, notFoundMessage));
  if (!Array.isArray(data)) throw new ApiError(GENERIC_ERROR);
  return data as T[];
}

// GET /:id endpoints wrap the item in a key, e.g. { serie: {...} }
async function getOne<T>(path: string, key: string, notFoundMessage: string): Promise<T> {
  const data = await readJson(await request(path, notFoundMessage));
  const item = (data as Record<string, T | undefined> | null)?.[key];
  if (!item) throw new ApiError(GENERIC_ERROR);
  return item;
}

// POST endpoints answer { message, data: <created item> }
async function postJson<T>(path: string, body: unknown, notFoundMessage: string): Promise<T> {
  const response = await request(path, notFoundMessage, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  });
  const created = (await readJson(response) as { data?: T } | null)?.data;
  if (!created) throw new ApiError(GENERIC_ERROR);
  return created;
}

export async function getAllSeries(): Promise<Series[]> {
  const list = await getList<SeriesDTO>('/api/series', SERIES_NOT_FOUND);
  return list.map(toSeries);
}

export async function getSeries(id: string): Promise<Series> {
  const dto = await getOne<SeriesDTO>(`/api/series/${encodeURIComponent(id)}`, 'serie', SERIES_NOT_FOUND);
  return toSeries(dto);
}

// Seasons of one series, ordered by season number
export async function getSeasons(seriesId: string): Promise<Season[]> {
  const list = await getList<SeasonDTO>(`/api/seasons/serie/${encodeURIComponent(seriesId)}`, SERIES_NOT_FOUND);
  return list.map(toSeason);
}

export async function getSeason(id: string): Promise<Season> {
  const dto = await getOne<SeasonDTO>(`/api/seasons/${encodeURIComponent(id)}`, 'season', SEASON_NOT_FOUND);
  return toSeason(dto);
}

// Episodes of one season, ordered by episode number
export async function getEpisodes(seasonId: string): Promise<Episode[]> {
  const list = await getList<EpisodeDTO>(`/api/episodes/season/${encodeURIComponent(seasonId)}`, SEASON_NOT_FOUND);
  return list.map(toEpisode);
}

export async function getEpisode(id: string): Promise<Episode> {
  const dto = await getOne<EpisodeDTO>(`/api/episodes/${encodeURIComponent(id)}`, 'episode', EPISODE_NOT_FOUND);
  return toEpisode(dto);
}

// cover: optional image chosen by the user; without it the request is plain JSON
export async function createSeries(data: SeriesUploadData, cover: File | null = null): Promise<Series> {
  if (!cover) return toSeries(await postJson<SeriesDTO>('/api/series', data, SERIES_NOT_FOUND));

  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  formData.append('thumbnail', cover);
  // no Content-Type header: the browser sets the multipart boundary itself
  const response = await request('/api/series', SERIES_NOT_FOUND, {
    method: 'POST', headers: authHeader(), body: formData,
  });
  const created = (await readJson(response) as { data?: SeriesDTO } | null)?.data;
  if (!created) throw new ApiError(GENERIC_ERROR);
  return toSeries(created);
}

// PATCH endpoints answer { message, data: <updated item> }
async function patchJson<T>(path: string, body: unknown, notFoundMessage: string): Promise<T> {
  const response = await request(path, notFoundMessage, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  });
  const updated = (await readJson(response) as { data?: T } | null)?.data;
  if (!updated) throw new ApiError(GENERIC_ERROR);
  return updated;
}

// Logical delete: the backend hides the series, and with it its seasons and episodes
export async function deleteSeries(id: number): Promise<void> {
  await request(`/api/series/${id}`, SERIES_NOT_FOUND, { method: 'DELETE', headers: authHeader() });
}

export async function updateSeries(id: number, changes: SeriesUpdate): Promise<Series> {
  return toSeries(await patchJson<SeriesDTO>(`/api/series/${id}`, changes, SERIES_NOT_FOUND));
}

// Only the series' uploader can change its seasons and episodes (403 otherwise).
// A number that the season or series already uses answers 409 with the backend's message.

export async function updateSeason(id: number, changes: SeasonUpdate): Promise<Season> {
  return toSeason(await patchJson<SeasonDTO>(`/api/seasons/${id}`, changes, SEASON_NOT_FOUND));
}

// Logical delete: the season and its episodes are hidden
export async function deleteSeason(id: number): Promise<void> {
  await request(`/api/seasons/${id}`, SEASON_NOT_FOUND, { method: 'DELETE', headers: authHeader() });
}

export async function updateEpisode(id: number, changes: EpisodeUpdate): Promise<Episode> {
  return toEpisode(await patchJson<EpisodeDTO>(`/api/episodes/${id}`, changes, EPISODE_NOT_FOUND));
}

// Logical delete: the episode is hidden
export async function deleteEpisode(id: number): Promise<void> {
  await request(`/api/episodes/${id}`, EPISODE_NOT_FOUND, { method: 'DELETE', headers: authHeader() });
}

export async function createSeason(data: SeasonUploadData): Promise<Season> {
  return toSeason(await postJson<SeasonDTO>('/api/seasons', data, SERIES_NOT_FOUND));
}

export function uploadEpisode(
  data: EpisodeUploadData,
  file: File,
  thumbnail: Blob | null,
  onProgress: (percent: number) => void,
): Promise<void> {
  const formData = new FormData();
  // "data" must go before the file: the backend names the stored file after data.title
  formData.append('data', JSON.stringify(data));
  // NOTE: keep this key as 'archivo', the backend's multer config for episodes expects that exact field name
  formData.append('archivo', file);
  if (thumbnail) formData.append('thumbnail', thumbnail, 'thumbnail.jpg');
  return uploadWithProgress('/api/episodes', formData, onProgress);
}
