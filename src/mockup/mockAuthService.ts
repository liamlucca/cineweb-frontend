import type {
  AuthResponse, LoginRequest, RegisterRequest, User,
} from '../types/index.ts';
import type { AuthService } from '../services/authService.ts';
import { ApiError } from '../services/api.ts';

/*
 * Development-only stand-in for the backend's /api/users endpoints, for working without the backend.
 * Accounts live in localStorage with plain-text passwords: never use real credentials here.
 * It can be deleted (with the switch in authService.ts) once nobody needs to work offline.
 */

interface MockAccount {
  user: User;
  password: string;
}

const ACCOUNTS_KEY = 'cineweb_mock_accounts';
const LATENCY_MS = 500;

const SEED_ACCOUNTS: MockAccount[] = [
  {
    user: {
      id: 1,
      username: 'admin',
      firstName: 'Ada',
      lastName: 'Admin',
      email: 'admin@cineweb.com',
      phone: null,
      role: 'administrator',
    },
    password: 'admin123',
  },
  {
    user: {
      id: 2,
      username: 'viewer',
      firstName: 'Victor',
      lastName: 'Viewer',
      email: 'viewer@cineweb.com',
      phone: null,
      role: 'viewer',
    },
    password: 'viewer123',
  },
];

// Simulates network latency so loading states can be seen
function delay(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, LATENCY_MS);
  });
}

function loadAccounts(): MockAccount[] {
  try {
    const stored = localStorage.getItem(ACCOUNTS_KEY);
    if (stored) return JSON.parse(stored) as MockAccount[];
  } catch {
    // corrupted data: start again from the seed accounts
  }
  return SEED_ACCOUNTS;
}

function saveAccounts(accounts: MockAccount[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function toResponse(user: User): AuthResponse {
  return { token: `mock-token-${user.id}`, user };
}

export default class MockAuthService implements AuthService {
  async login({ login, password }: LoginRequest): Promise<AuthResponse> {
    await delay();
    // like the backend, accept the email or the username
    const value = login.trim().toLowerCase();
    const account = loadAccounts().find(
      (a) => a.user.email === value || a.user.username.toLowerCase() === value,
    );
    if (!account || account.password !== password) {
      throw new ApiError('Incorrect email, username or password.');
    }
    return toResponse(account.user);
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    await delay();
    const accounts = loadAccounts();
    const email = request.email.trim().toLowerCase();
    const username = request.username.trim();

    const taken = accounts.some((a) => a.user.email === email || a.user.username === username);
    if (taken) throw new ApiError('That email or username is already in use.');

    const user: User = {
      id: Math.max(0, ...accounts.map((a) => a.user.id)) + 1,
      username,
      firstName: request.firstName.trim(),
      lastName: request.lastName.trim(),
      email,
      phone: request.phone ?? null,
      role: 'viewer',
    };
    saveAccounts([...accounts, { user, password: request.password }]);
    return toResponse(user);
  }

  // mock tokens are not stored anywhere, so there is nothing to end
  async logout(): Promise<void> {
    await delay();
  }
}
