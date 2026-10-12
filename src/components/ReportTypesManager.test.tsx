import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReportTypesManager from './ReportTypesManager.tsx';
import { ApiError } from '../services/api.ts';

const { createReportType, updateReportType, deleteReportType } = vi.hoisted(() => ({
  createReportType: vi.fn(),
  updateReportType: vi.fn(),
  deleteReportType: vi.fn(),
}));
vi.mock('../services/reportTypeService.ts', () => ({ createReportType, updateReportType, deleteReportType }));

const TYPES = [
  { id: 1, name: 'Violence', requiresDetails: false },
  { id: 6, name: 'Other', requiresDetails: true },
];

function renderManager() {
  const onSaved = vi.fn();
  const onDeleted = vi.fn();
  render(<ReportTypesManager reportTypes={TYPES} onSaved={onSaved} onDeleted={onDeleted} />);
  return { onSaved, onDeleted };
}

describe('ReportTypesManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists the reasons and marks the ones that need an explanation', () => {
    renderManager();

    expect(screen.getByText('Violence')).toBeInTheDocument();
    expect(screen.getAllByText('Needs an explanation')).toHaveLength(2); // the "Other" badge + the form checkbox
  });

  it('creates a reason and tells the page', async () => {
    const created = { id: 7, name: 'Spam', requiresDetails: true };
    createReportType.mockResolvedValue(created);
    const { onSaved } = renderManager();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('New reason name'), '  Spam ');
    await user.click(screen.getAllByRole('checkbox')[0]);
    await user.click(screen.getByRole('button', { name: 'Add reason' }));

    expect(createReportType).toHaveBeenCalledWith({ name: 'Spam', requiresDetails: true });
    expect(onSaved).toHaveBeenCalledWith(created);
  });

  it('shows why a reason in use cannot be deleted', async () => {
    deleteReportType.mockRejectedValue(
      new ApiError('This report type is used by existing reports, so it cannot be deleted'),
    );
    const { onDeleted } = renderManager();

    await userEvent.setup().click(screen.getAllByRole('button', { name: 'Delete' })[0]);

    expect(await screen.findByRole('alert')).toHaveTextContent('used by existing reports');
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
