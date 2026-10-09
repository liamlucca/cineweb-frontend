import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ReviewButtons from './ReviewButtons.tsx';
import { AuthContext } from '../context/AuthContext.ts';
import type { Review, User } from '../types/index.ts';

const {
  getReviews, createReview, changeReview, deleteReview,
} = vi.hoisted(() => ({
  getReviews: vi.fn(),
  createReview: vi.fn(),
  changeReview: vi.fn(),
  deleteReview: vi.fn(),
}));
vi.mock('../services/reviewService.ts', () => ({
  getReviews, createReview, changeReview, deleteReview,
}));

const VIEWER: User = {
  id: 2, username: 'viewer', firstName: 'V', lastName: 'V', email: 'v@cineweb.com', phone: null, role: 'viewer',
};

function review(id: number, viewerId: number, rating: boolean): Review {
  return {
    id, viewerId, rating, audiovisualId: 5, audiovisualType: 'movie',
  };
}

function renderButtons(user: User | null) {
  render(
    <AuthContext.Provider value={{
      user, login: vi.fn(), register: vi.fn(), logout: vi.fn(),
    }}
    >
      <MemoryRouter>
        <ReviewButtons type="movie" id={5} />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ReviewButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('counts likes and dislikes', async () => {
    getReviews.mockResolvedValue([review(1, 7, true), review(2, 8, true), review(3, 9, false)]);
    renderButtons(VIEWER);

    expect(await screen.findByRole('button', { name: 'Like (2)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dislike (1)' })).toBeInTheDocument();
  });

  it('creates a like for a viewer who has not voted yet', async () => {
    getReviews.mockResolvedValue([]);
    createReview.mockResolvedValue(review(10, 2, true));
    renderButtons(VIEWER);

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Like (0)' }));

    expect(createReview).toHaveBeenCalledWith({
      viewerId: 2, rating: true, audiovisualId: 5, audiovisualType: 'movie',
    });
    expect(await screen.findByRole('button', { name: 'Like (1)' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('withdraws the vote when the same button is clicked again', async () => {
    getReviews.mockResolvedValue([review(10, 2, true)]);
    deleteReview.mockResolvedValue(undefined);
    renderButtons(VIEWER);

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Like (1)' }));

    expect(deleteReview).toHaveBeenCalledWith(10);
    expect(await screen.findByRole('button', { name: 'Like (0)' })).toBeInTheDocument();
  });

  it('changes a like into a dislike', async () => {
    getReviews.mockResolvedValue([review(10, 2, true)]);
    changeReview.mockResolvedValue(review(10, 2, false));
    renderButtons(VIEWER);

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Dislike (0)' }));

    expect(changeReview).toHaveBeenCalledWith(10, false);
    expect(await screen.findByRole('button', { name: 'Dislike (1)' })).toBeInTheDocument();
  });

  it('lets guests see the counts but not vote', async () => {
    getReviews.mockResolvedValue([review(1, 7, true)]);
    renderButtons(null);

    expect(await screen.findByRole('button', { name: 'Like (1)' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Log in to rate' })).toBeInTheDocument();
  });
});
