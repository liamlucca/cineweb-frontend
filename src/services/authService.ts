import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/index.ts';
import { API_URL, ApiError } from './api.ts';
import { isUser } from './session.ts';
import MockAuthService from '../mockup/mockAuthService.ts';

/**
 * Strategy pattern: the app only depends on this interface. The real backend
 * implementation and the mock are interchangeable, and which one is used is
 * decided in a single place (the bottom of this file) from .env.
 */
export interface AuthService {
  login(request: LoginRequest): Promise<AuthResponse>;
  register(request: RegisterRequest): Promise<AuthResponse>;
}

const CONNECTION_ERROR = 'We couldn\'t reach the server. Please try again later.';
const GENERIC_ERROR = 'Something went wrong. Please try again.';

function isAuthResponse(value: unknown): value is AuthResponse {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.token === 'string' && isUser(candidate.user);
}

// Talks to the backend endpoints listed in CLAUDE.md ("API contract")
class HttpAuthService implements AuthService {
  login(request: LoginRequest): Promise<AuthResponse> {
    return HttpAuthService.post('/auth/login', request, {
      401: 'Incorrect email or password.',
    });
  }

  register(request: RegisterRequest): Promise<AuthResponse> {
    return HttpAuthService.post('/auth/register', request, {
      400: 'Please check the information you entered.',
      409: 'That email or username is already in use.',
    });
  }

  private static async post(
    path: string,
    body: LoginRequest | RegisterRequest,
    errorMessages: Partial<Record<number, string>>,
  ): Promise<AuthResponse> {
    let response: Response;
    try {
      response = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      throw new ApiError(CONNECTION_ERROR);
    }

    if (!response.ok) {
      throw new ApiError(errorMessages[response.status] ?? GENERIC_ERROR);
    }

    const data: unknown = await response.json().catch(() => null);
    if (!isAuthResponse(data)) throw new ApiError(GENERIC_ERROR);
    return data;
  }
}

// Set VITE_USE_MOCK_AUTH=true in .env while the backend has no /auth endpoints
export const authService: AuthService = import.meta.env.VITE_USE_MOCK_AUTH === 'true'
  ? new MockAuthService()
  : new HttpAuthService();
