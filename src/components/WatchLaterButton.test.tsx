import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import WatchLaterButton from './WatchLaterButton.tsx';
import { AuthContext } from '../context/AuthContext.ts';
import type { User } from '../types/index.ts';

const { getWatchLater, addToWatchLater, removeFromWatchLater } = vi.hoisted(() => ({
  getWatchLater: vi.fn(),
  addToWatchLater: vi.fn(),
  removeFromWatchLater: vi.fn(),
}));
vi.mock('../services/watchLaterService.ts', () => ({ getWatchLater, addToWatchLater, removeFromWatchLater }));

const VIEWER: User = {
  id: 2, username: 'viewer', firstName: 'V', lastName: 'V', email: 'v@cineweb.com', phone: null, role: 'viewer',
};
const ADMIN: User = { ...VIEWER, id: 1, role: 'administrator' };

function renderButton(user: User | null) {
  render(
    <AuthContext.Provider value={{
      user, login: vi.fn(), register: vi.fn(), logout: vi.fn(), updateProfile: vi.fn(),
    }}
    >
      <MemoryRouter>
        <WatchLaterButton type="series" id={4} />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('WatchLaterButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves the content and then removes it', async () => {
    getWatchLater.mockResolvedValue([]);
    addToWatchLater.mockResolvedValue(30);
    removeFromWatchLater.mockResolvedValue(undefined);
    renderButton(VIEWER);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: '＋ Watch later' }));
    expect(addToWatchLater).toHaveBeenCalledWith('series', 4);
    const saved = await screen.findByRole('button', { name: '✓ In Watch later' });
    expect(saved).toHaveAttribute('aria-pressed', 'true');

    await user.click(saved);
    expect(removeFromWatchLater).toHaveBeenCalledWith(30);
    expect(await screen.findByRole('button', { name: '＋ Watch later' })).toBeInTheDocument();
  });

  it('knows when the content is already in the list', async () => {
    getWatchLater.mockResolvedValue([{
      id: 9, viewerId: 2, audiovisualId: 4, audiovisualType: 'series', addedAt: '', title: 'S', category: '', description: '',
    }]);
    renderButton(VIEWER);

    expect(await screen.findByRole('button', { name: '✓ In Watch later' })).toBeInTheDocument();
  });

  it('asks guests to log in', () => {
    renderButton(null);
    expect(screen.getByRole('link', { name: '＋ Watch later' })).toHaveAttribute('href', '/login');
  });

  it('shows nothing to administrators', () => {
    renderButton(ADMIN);
    expect(screen.queryByText(/Watch later/)).not.toBeInTheDocument();
    expect(getWatchLater).not.toHaveBeenCalled();
  });
});
