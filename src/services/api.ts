import { getToken } from './session.ts';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const CONNECTION_ERROR = 'We couldn\'t reach the server. Please try again later.';
export const GENERIC_ERROR = 'Something went wrong. Please try again.';
export const INVALID_DATA_ERROR = 'Please check the information you entered.';

// Error whose message is already friendly and can be shown to the user as is
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Message to show the user for any error thrown by a service
export function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : GENERIC_ERROR;
}

// Header for requests that need the logged-in user
export function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// fetch that turns network and HTTP failures into an ApiError with a friendly message
export async function request(
  path: string,
  notFoundMessage: string,
  init: RequestInit = {},
): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(CONNECTION_ERROR);
  }

  if (response.status === 404) throw new ApiError(notFoundMessage);
  if (response.status === 400) throw new ApiError(INVALID_DATA_ERROR);
  if (!response.ok) throw new ApiError(GENERIC_ERROR);
  return response;
}

// Body of a response as JSON, or null when it is not valid JSON
export async function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

// Sends a multipart form with POST and reports the upload progress (0-100).
// Uses XMLHttpRequest instead of fetch because fetch cannot report upload progress.
export function uploadWithProgress(
  path: string,
  formData: FormData,
  onProgress: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else if (xhr.status === 400) reject(new ApiError(INVALID_DATA_ERROR));
      else reject(new ApiError(GENERIC_ERROR));
    });
    xhr.addEventListener('error', () => reject(new ApiError(CONNECTION_ERROR)));

    xhr.open('POST', `${API_URL}${path}`);
    Object.entries(authHeader()).forEach(([name, value]) => xhr.setRequestHeader(name, value));
    xhr.send(formData);
  });
}
