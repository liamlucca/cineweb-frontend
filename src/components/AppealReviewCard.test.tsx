import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AppealReviewCard from './AppealReviewCard.tsx';
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
      <AppealReviewCard appeal={APPEAL} onResolved={onResolved} />
    </MemoryRouter>,
  );
  return onResolved;
}

describe('AppealReviewCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the reported case with its reasons counted', async () => {
    getModerationCase.mockResolvedValue({
      id: 9, targetType: 'movie', targetId: 3, status: 'appealed', reportCount: 3,
      reasons: ['Violence', 'Other: spam', 'Violence'],
    });
    renderCard();

    await userEvent.setup().click(screen.getByRole('button', { name: 'See the reports' }));

    expect(getModerationCase).toHaveBeenCalledWith(9);
    expect(await screen.findByText('Violence (2)')).toBeInTheDocument();
    expect(screen.getByText('Other: spam (1)')).toBeInTheDocument();
  });

  it('rejects the appeal and tells the page the content was suspended', async () => {
    resolveAppeal.mockResolvedValue(true);
    const onResolved = renderCard();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Reject appeal' }));

    expect(resolveAppeal).toHaveBeenCalledWith(4, 'rejected');
    expect(onResolved).toHaveBeenCalledWith(APPEAL, 'rejected', true);
  });

  it('does nothing if the administrator cancels the confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderCard();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Accept appeal' }));

    expect(resolveAppeal).not.toHaveBeenCalled();
  });
});
