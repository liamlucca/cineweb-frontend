import type {
  AuthResponse, LoginRequest, RegisterRequest, User, UserDTO,
} from '../types/index.ts';
import {
  API_URL, ApiError, CONNECTION_ERROR, GENERIC_ERROR,
} from './api.ts';
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

// Checks that a value from the network really has the shape of the backend's user
function isUserDTO(value: unknown): value is UserDTO {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id_user === 'number'
    && typeof candidate.user_name === 'string'
    && typeof candidate.email === 'string'
    && (candidate.role === 'administrator' || candidate.role === 'viewer');
}

// The backend sends snake_case; the rest of the app uses the camelCase User
export function toUser(dto: UserDTO): User {
  return {
    id: dto.id_user,
    username: dto.user_name,
    firstName: dto.first_name,
    lastName: dto.last_name,
    email: dto.email,
    // the backend has no phone yet
    phone: null,
    role: dto.role,
  };
}

/**
 * Adapter for the backend's /api/users endpoints: it translates the app's
 * requests and types to what the backend expects, and back.
 */
export class HttpAuthService implements AuthService {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const data = await HttpAuthService.post('/api/users/login', request, {
      400: 'Please enter your email or username and your password.',
      401: 'Incorrect email, username or password.',
    });

    // the backend answers { token, token_type, expires_in, user }
    const { token, user } = (data ?? {}) as { token?: unknown, user?: unknown };
    if (typeof token !== 'string' || !isUserDTO(user)) throw new ApiError(GENERIC_ERROR);
    return { token, user: toUser(user) };
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    await HttpAuthService.post('/api/users/register', {
      user_name: request.username,
      first_name: request.firstName,
      last_name: request.lastName,
      email: request.email,
      password: request.password,
    }, {
      400: 'Please check your details: the username needs 3 to 50 characters and the password at least 8.',
      409: 'That email or username is already in use.',
    });

    // the backend answers the sign-up without a token, so log in right away
    return this.login({ login: request.email, password: request.password });
  }

  private static async post(
    path: string,
    body: unknown,
    errorMessages: Partial<Record<number, string>>,
  ): Promise<unknown> {
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

    return response.json().catch(() => null);
  }
}

// Set VITE_USE_MOCK_AUTH=true in .env to use the fake accounts instead of the backend
export const authService: AuthService = import.meta.env.VITE_USE_MOCK_AUTH === 'true'
  ? new MockAuthService()
  : new HttpAuthService();
