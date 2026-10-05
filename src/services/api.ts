import { getToken } from './session.ts';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Error whose message is already friendly and can be shown to the user as is
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Header for requests that need the logged-in user
export function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
