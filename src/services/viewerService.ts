import type { ModerationCase, UserDTO, ViewerProfile } from '../types/index.ts';
import {
  ApiError, GENERIC_ERROR, authHeader, readJson, request,
} from './api.ts';
import { isUserDTO, toUser } from './authService.ts';
import { toModerationCase } from './reportService.ts';

const NOT_FOUND_ERROR = 'We couldn\'t find your profile.';

// GET /api/viewers/me answers the viewer (snake_case) plus their activity lists
interface ViewerDTO extends UserDTO {
  reportsReceivedCount: number
  appeals: unknown[]
  uploadedAudiovisuals: unknown[]
  reviews: unknown[]
}

function isViewerDTO(value: unknown): value is ViewerDTO {
  if (!isUserDTO(value)) return false;
  const candidate = value as unknown as Record<string, unknown>;
  return typeof candidate.reportsReceivedCount === 'number'
    && Array.isArray(candidate.appeals)
    && Array.isArray(candidate.uploadedAudiovisuals)
    && Array.isArray(candidate.reviews);
}

// Only for viewers: administrators get a 403 from these endpoints
export async function getViewerProfile(): Promise<ViewerProfile> {
  const response = await request('/api/viewers/me', NOT_FOUND_ERROR, { headers: authHeader() });
  const dto = (await readJson(response) as { data?: unknown } | null)?.data;
  if (!isViewerDTO(dto)) throw new ApiError(GENERIC_ERROR);

  return {
    user: toUser(dto),
    // movies and episodes uploaded by this viewer (series themselves are not counted)
    uploadedCount: dto.uploadedAudiovisuals.length,
    reviewsCount: dto.reviews.length,
    reportsReceivedCount: dto.reportsReceivedCount,
  };
}

// Moderation cases opened against the viewer's content, with their appeal if there is one
export async function getMyReports(): Promise<ModerationCase[]> {
  const response = await request('/api/viewers/me/reports', NOT_FOUND_ERROR, { headers: authHeader() });
  const data = (await readJson(response) as { data?: unknown } | null)?.data;
  if (!Array.isArray(data)) throw new ApiError(GENERIC_ERROR);
  return data.map(toModerationCase);
}
