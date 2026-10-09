import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AuthProvider from './AuthProvider.tsx';
import useAuth from '../hooks/useAuth.ts';
import { saveSession } from '../services/session.ts';
import type { User } from '../types/index.ts';

// fake service, so the test controls what the "backend" answers
const { getCurrentUser } = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));
vi.mock('../services/authService.ts', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    getCurrentUser,
  },
}));

const SAVED_USER: User = {
  id: 2,
  username: 'viewer',
  firstName: 'Victor',
  lastName: 'Viewer',
  email: 'viewer@cineweb.com',
  phone: null,
  role: 'viewer',
};

// shows who the app thinks is logged in
function CurrentUser() {
  const { user } = useAuth();
  return <p>{user ? user.username : 'guest'}</p>;
}

function renderWithSavedSession() {
  saveSession({ token: 'saved-token', user: SAVED_USER });
  render(
    <AuthProvider>
      <CurrentUser />
    </AuthProvider>,
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
  });

  it('logs out when the backend says the saved token is no longer valid', async () => {
    getCurrentUser.mockResolvedValue(null);
    renderWithSavedSession();

    // the saved session is shown right away, before the backend answers
    expect(screen.getByText('viewer')).toBeInTheDocument();
    expect(await screen.findByText('guest')).toBeInTheDocument();
    expect(localStorage.getItem('cineweb_token')).toBeNull();
  });

  it('updates the user with the data from the backend', async () => {
    getCurrentUser.mockResolvedValue({ ...SAVED_USER, username: 'renamed' });
    renderWithSavedSession();

    expect(await screen.findByText('renamed')).toBeInTheDocument();
    expect(localStorage.getItem('cineweb_token')).toBe('saved-token');
  });

  it('keeps the saved session when the server is unreachable', async () => {
    getCurrentUser.mockRejectedValue(new Error('offline'));
    renderWithSavedSession();

    await waitFor(() => expect(getCurrentUser).toHaveBeenCalled());
    expect(screen.getByText('viewer')).toBeInTheDocument();
    expect(localStorage.getItem('cineweb_token')).toBe('saved-token');
  });

  it('does not ask the backend when nobody is logged in', () => {
    render(
      <AuthProvider>
        <CurrentUser />
      </AuthProvider>,
    );

    expect(screen.getByText('guest')).toBeInTheDocument();
    expect(getCurrentUser).not.toHaveBeenCalled();
  });
});
