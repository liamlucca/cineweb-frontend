import type { WatchLaterItem, WatchLaterType } from '../types/index.ts';
import {
  ApiError, GENERIC_ERROR, authHeader, readJson, request,
} from './api.ts';

const NOT_FOUND_ERROR = 'We couldn\'t find that video.';

// Every call needs a viewer session: each viewer only sees and changes their own list

function isWatchLaterItem(value: unknown): value is WatchLaterItem {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'number'
    && typeof candidate.audiovisualId === 'number'
    && (candidate.audiovisualType === 'movie' || candidate.audiovisualType === 'series');
}

export async function getWatchLater(): Promise<WatchLaterItem[]> {
  const response = await request('/api/watch-later', NOT_FOUND_ERROR, { headers: authHeader() });
  const data = (await readJson(response) as { data?: unknown } | null)?.data;
  if (!Array.isArray(data)) throw new ApiError(GENERIC_ERROR);
  return data.filter(isWatchLaterItem).map((item) => ({
    ...item,
    title: String(item.title ?? ''),
    category: String(item.category ?? ''),
    description: String(item.description ?? ''),
    addedAt: String(item.addedAt ?? ''),
  }));
}

// Returns the id of the new item, needed to remove it later
export async function addToWatchLater(audiovisualType: WatchLaterType, audiovisualId: number): Promise<number> {
  const response = await request('/api/watch-later', NOT_FOUND_ERROR, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ audiovisualType, audiovisualId }),
  });
  const data = (await readJson(response) as { data?: { id?: unknown } } | null)?.data;
  if (typeof data?.id !== 'number') throw new ApiError(GENERIC_ERROR);
  return data.id;
}

export async function removeFromWatchLater(itemId: number): Promise<void> {
  await request(`/api/watch-later/${itemId}`, NOT_FOUND_ERROR, { method: 'DELETE', headers: authHeader() });
}
