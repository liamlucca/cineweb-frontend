import type { AuthResponse, User } from '../types/index.ts';

const TOKEN_KEY = 'cineweb_token';
const USER_KEY = 'cineweb_user';

// Checks that a value parsed from JSON really has the shape of a User
export function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'number'
    && typeof candidate.username === 'string'
    && typeof candidate.email === 'string'
    && (candidate.role === 'administrator' || candidate.role === 'viewer');
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveSession({ token, user }: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Restores the session saved by a previous visit. Corrupted data is discarded.
export function getStoredSession(): AuthResponse | null {
  const token = getToken();
  const rawUser = localStorage.getItem(USER_KEY);
  if (!token || !rawUser) return null;

  try {
    const user: unknown = JSON.parse(rawUser);
    if (isUser(user)) return { token, user };
  } catch {
    // invalid JSON: handled below as "no session"
  }
  clearSession();
  return null;
}
