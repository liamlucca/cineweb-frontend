import type { Review, ReviewRequest, ReviewTargetType } from '../types/index.ts';
import {
  ApiError, GENERIC_ERROR, authHeader, readJson, request,
} from './api.ts';

const NOT_FOUND_ERROR = 'We couldn\'t find that rating.';

// the backend answers { data: ... } for reviews
async function readData<T>(response: Response): Promise<T> {
  const data = (await readJson(response) as { data?: T } | null)?.data;
  if (data === undefined) throw new ApiError(GENERIC_ERROR);
  return data;
}

export async function getReviews(type: ReviewTargetType, id: number): Promise<Review[]> {
  const response = await request(`/api/reviews/audiovisual/${type}/${id}`, NOT_FOUND_ERROR);
  const reviews = await readData<unknown>(response);
  if (!Array.isArray(reviews)) throw new ApiError(GENERIC_ERROR);
  return reviews as Review[];
}

export async function createReview(review: ReviewRequest): Promise<Review> {
  const response = await request('/api/reviews', NOT_FOUND_ERROR, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(review),
  });
  return readData<Review>(response);
}

// changes a like into a dislike or the other way around
export async function changeReview(id: number, rating: boolean): Promise<Review> {
  const response = await request(`/api/reviews/${id}`, NOT_FOUND_ERROR, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ rating }),
  });
  return readData<Review>(response);
}

// withdraws a review
export async function deleteReview(id: number): Promise<void> {
  await request(`/api/reviews/${id}`, NOT_FOUND_ERROR, { method: 'DELETE', headers: authHeader() });
}
