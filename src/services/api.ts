import { getToken } from './session.ts';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const CONNECTION_ERROR = 'We couldn\'t reach the server. Please try again later.';
export const GENERIC_ERROR = 'Something went wrong. Please try again.';

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
