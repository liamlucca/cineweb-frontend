import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SeasonsManager from './SeasonsManager.tsx';
import ConfirmProvider from '../context/ConfirmProvider.tsx';

const {
  getSeasons, updateSeason, deleteSeason, getEpisodes,
} = vi.hoisted(() => ({
  getSeasons: vi.fn(),
  updateSeason: vi.fn(),
  deleteSeason: vi.fn(),
  getEpisodes: vi.fn(),
}));
vi.mock('../services/seriesService.ts', () => ({
  getSeasons, updateSeason, deleteSeason, getEpisodes, updateEpisode: vi.fn(), deleteEpisode: vi.fn(),
}));

const SEASON = {
  id: 3, seriesId: 1, seasonNumber: 1, description: 'First',
};

describe('SeasonsManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSeasons.mockResolvedValue([SEASON]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('edits the number and the description of a season', async () => {
    updateSeason.mockResolvedValue({ ...SEASON, seasonNumber: 2, description: 'Second' });
    render(<SeasonsManager seriesId={1} />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Edit' }));
    await user.clear(screen.getByLabelText('Season number'));
    await user.type(screen.getByLabelText('Season number'), '2');
    await user.clear(screen.getByLabelText('Season description'));
    await user.type(screen.getByLabelText('Season description'), ' Second ');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(updateSeason).toHaveBeenCalledWith(3, { season_number: 2, description: 'Second' });
    expect(await screen.findByText('Season 2')).toBeInTheDocument();
  });

  it('deletes a season after the confirmation', async () => {
    deleteSeason.mockResolvedValue(undefined);
    render(<ConfirmProvider><SeasonsManager seriesId={1} /></ConfirmProvider>);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Delete' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    expect(deleteSeason).toHaveBeenCalledWith(3);
    expect(await screen.findByText('This series has no seasons yet.')).toBeInTheDocument();
  });

  it('opens the episodes of a season', async () => {
    getEpisodes.mockResolvedValue([{
      id: 8, seasonId: 3, number: 1, title: 'Pilot', description: '', path: '/series/x.mp4',
    }]);
    render(<SeasonsManager seriesId={1} />);

    await userEvent.setup().click(await screen.findByRole('button', { name: 'Episodes' }));

    expect(getEpisodes).toHaveBeenCalledWith('3');
    expect(await screen.findByText('1. Pilot')).toBeInTheDocument();
  });
});
