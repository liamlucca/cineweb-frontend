import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import { HttpAuthService } from './authService.ts';
import type { UserDTO } from '../types/index.ts';

// what the backend sends for a user (snake_case)
const BACKEND_USER: UserDTO = {
  id_user: 7,
  user_name: 'ana',
  first_name: 'Ana',
  last_name: 'Perez',
  email: 'ana@cineweb.com',
  role: 'viewer',
  active: true,
};

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// URL and parsed JSON body of the n-th fetch call
function sentRequest(fetchMock: ReturnType<typeof vi.fn>, call = 0) {
  const [url, init] = fetchMock.mock.calls[call] as [string, RequestInit];
  return { url, body: JSON.parse(String(init.body)) as unknown };
}

describe('HttpAuthService', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('logs in at /api/users/login and converts the user to camelCase', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {
      token: 'abc', token_type: 'Bearer', expires_in: 604800, user: BACKEND_USER,
    }));

    const session = await new HttpAuthService().login({ login: 'ana', password: 'secret123' });

    const { url, body } = sentRequest(fetchMock);
    expect(url).toMatch(/\/api\/users\/login$/);
    expect(body).toEqual({ login: 'ana', password: 'secret123' });
    expect(session).toEqual({
      token: 'abc',
      user: {
        id: 7,
        username: 'ana',
        firstName: 'Ana',
        lastName: 'Perez',
        email: 'ana@cineweb.com',
        phone: null,
        role: 'viewer',
      },
    });
  });

  it('shows a friendly message when the credentials are wrong', async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { message: 'Invalid credentials' }));

    await expect(new HttpAuthService().login({ login: 'ana', password: 'nope' }))
      .rejects.toThrow('Incorrect email, username or password.');
  });

  it('rejects a login answer that does not contain a valid user', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { token: 'abc', user: { id: 7 } }));

    await expect(new HttpAuthService().login({ login: 'ana', password: 'secret123' }))
      .rejects.toThrow('Something went wrong. Please try again.');
  });

  it('signs up with snake_case fields and then logs in with the new account', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(201, { data: BACKEND_USER }))
      .mockResolvedValueOnce(jsonResponse(200, { token: 'new-token', user: BACKEND_USER }));

    const session = await new HttpAuthService().register({
      username: 'ana',
      firstName: 'Ana',
      lastName: 'Perez',
      email: 'ana@cineweb.com',
      password: 'secret123',
    });

    const signUp = sentRequest(fetchMock, 0);
    expect(signUp.url).toMatch(/\/api\/users\/register$/);
    expect(signUp.body).toEqual({
      user_name: 'ana',
      first_name: 'Ana',
      last_name: 'Perez',
      email: 'ana@cineweb.com',
      password: 'secret123',
    });

    const logIn = sentRequest(fetchMock, 1);
    expect(logIn.url).toMatch(/\/api\/users\/login$/);
    expect(logIn.body).toEqual({ login: 'ana@cineweb.com', password: 'secret123' });
    expect(session.token).toBe('new-token');
  });

  it('shows a friendly message when the email or username is taken', async () => {
    fetchMock.mockResolvedValue(jsonResponse(409, { message: 'Email or username is already in use' }));

    await expect(new HttpAuthService().register({
      username: 'ana', firstName: 'Ana', lastName: 'Perez', email: 'ana@cineweb.com', password: 'secret123',
    })).rejects.toThrow('That email or username is already in use.');
    // no login attempt after a failed sign-up
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('logs out on the server with the saved token', async () => {
    localStorage.setItem('cineweb_token', 'abc');
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await new HttpAuthService().logout();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/api\/users\/logout$/);
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ Authorization: 'Bearer abc' });
  });

  it('does not fail to log out when the server is unreachable', async () => {
    localStorage.setItem('cineweb_token', 'abc');
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(new HttpAuthService().logout()).resolves.toBeUndefined();
  });
});
