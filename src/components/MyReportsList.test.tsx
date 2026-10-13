import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MyReportsList from './MyReportsList.tsx';
import ConfirmProvider from '../context/ConfirmProvider.tsx';
import type { ModerationCase } from '../types/index.ts';

const { getMyReports, withdrawAppeal } = vi.hoisted(() => ({
  getMyReports: vi.fn(),
  withdrawAppeal: vi.fn(),
}));
vi.mock('../services/viewerService.ts', () => ({ getMyReports }));
vi.mock('../services/appealService.ts', () => ({ withdrawAppeal }));

function moderationCase(id: number, changes: Partial<ModerationCase>): ModerationCase {
  return {
    id,
    targetType: 'movie',
    targetId: 3,
    status: 'pending',
    reportCount: 3,
    createdAt: '2026-10-12T10:00:00.000Z',
    content: {
      title: `Video ${id}`, state: 'active', ownerId: 2, ownerUsername: 'me',
    },
    reasons: [{ reportTypeId: 1, reportType: 'Violence', count: 3 }],
    appeal: null,
    ...changes,
  };
}

function renderList() {
  render(
    <MemoryRouter>
      <ConfirmProvider>
        <MyReportsList />
      </ConfirmProvider>
    </MemoryRouter>,
  );
}

describe('MyReportsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('offers to appeal an open case that has no appeal', async () => {
    getMyReports.mockResolvedValue([moderationCase(7, {})]);
    renderList();

    expect(await screen.findByRole('link', { name: 'Appeal' })).toHaveAttribute('href', '/appeal/7');
    expect(screen.queryByRole('button', { name: 'Withdraw appeal' })).not.toBeInTheDocument();
  });

  it('withdraws a pending appeal and loads the cases again', async () => {
    getMyReports
      .mockResolvedValueOnce([moderationCase(8, {
        status: 'appealed', appeal: { id: 20, description: 'Mine', status: 'pending' },
      })])
      .mockResolvedValueOnce([moderationCase(8, {})]);
    withdrawAppeal.mockResolvedValue(undefined);
    renderList();

    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: 'Withdraw appeal' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Withdraw' }));

    expect(withdrawAppeal).toHaveBeenCalledWith(20);
    expect(await screen.findByRole('link', { name: 'Appeal' })).toBeInTheDocument();
    expect(getMyReports).toHaveBeenCalledTimes(2);
  });

  it('says so when nobody reported the viewer\'s videos', async () => {
    getMyReports.mockResolvedValue([]);
    renderList();

    expect(await screen.findByText('Nobody has reported your videos. Keep it up!')).toBeInTheDocument();
  });
});
