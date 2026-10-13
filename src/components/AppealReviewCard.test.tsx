import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AppealReviewCard from './AppealReviewCard.tsx';
import ConfirmProvider from '../context/ConfirmProvider.tsx';
import type { Appeal } from '../types/index.ts';

const { getModerationCase, resolveAppeal } = vi.hoisted(() => ({
  getModerationCase: vi.fn(),
  resolveAppeal: vi.fn(),
}));
vi.mock('../services/adminService.ts', () => ({ getModerationCase, resolveAppeal }));

const APPEAL: Appeal = {
  id: 4, description: 'It is a parody.', reportId: 9, administratorId: null, status: 'pending',
};

function renderCard(onResolved = vi.fn()) {
  render(
    <MemoryRouter>
      <ConfirmProvider>
        <AppealReviewCard appeal={APPEAL} onResolved={onResolved} />
      </ConfirmProvider>
    </MemoryRouter>,
  );
  return onResolved;
}

describe('AppealReviewCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the reported content, its owner and the reasons counted', async () => {
    getModerationCase.mockResolvedValue({
      id: 9,
      targetType: 'movie',
      targetId: 3,
      status: 'appealed',
      reportCount: 3,
      createdAt: '2026-10-12T10:00:00.000Z',
      content: {
        title: 'Pilot', state: 'active', ownerId: 5, ownerUsername: 'maria',
      },
      reasons: [
        { reportTypeId: 1, reportType: 'Violence', count: 2 },
        { reportTypeId: 6, reportType: 'Other', count: 1 },
      ],
      appeal: { id: 4, description: 'It is a parody.', status: 'pending' },
      reports: [],
    });
    renderCard();

    await userEvent.setup().click(screen.getByRole('button', { name: 'See the reports' }));

    expect(getModerationCase).toHaveBeenCalledWith(9);
    expect(await screen.findByText('Violence × 2')).toBeInTheDocument();
    expect(screen.getByText('Other × 1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pilot' })).toHaveAttribute('href', '/watch/3');
    expect(screen.getByText(/uploaded by @maria/)).toBeInTheDocument();
  });

  it('rejects the appeal and tells the page the content was suspended', async () => {
    resolveAppeal.mockResolvedValue(true);
    const onResolved = renderCard();

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Reject appeal' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Reject' }));

    expect(resolveAppeal).toHaveBeenCalledWith(4, 'rejected');
    expect(onResolved).toHaveBeenCalledWith(APPEAL, 'rejected', true);
  });

  it('does nothing if the administrator cancels the confirmation', async () => {
    renderCard();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Accept appeal' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' }));

    expect(resolveAppeal).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
