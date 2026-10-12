import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ReportPage from './ReportPage.tsx';
import { ApiError } from '../services/api.ts';

// fake services, so the test controls what the "backend" answers
const { reportContent, getSeries, getReportTypes } = vi.hoisted(() => ({
  reportContent: vi.fn(),
  getSeries: vi.fn(),
  getReportTypes: vi.fn(),
}));
vi.mock('../services/reportService.ts', async (importOriginal) => ({
  ...await importOriginal<typeof import('../services/reportService.ts')>(),
  reportContent,
}));
vi.mock('../services/seriesService.ts', () => ({ getSeries }));
vi.mock('../services/movieService.ts', () => ({ getMovie: vi.fn() }));
vi.mock('../services/reportTypeService.ts', () => ({ getReportTypes }));

const REPORT_TYPES = [
  { id: 1, name: 'Violence', requiresDetails: false },
  { id: 6, name: 'Other', requiresDetails: true },
];

function renderReportPage(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/report/:type/:id" element={<ReportPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function reportWithOtherReason(text: string) {
  const user = userEvent.setup();
  await user.click(await screen.findByLabelText('Other'));
  await user.type(screen.getByLabelText('Explain the reason'), text);
  await user.click(screen.getByRole('button', { name: 'Report' }));
  await user.click(screen.getByRole('button', { name: 'Send report' }));
}

describe('ReportPage', () => {
  beforeEach(() => {
    reportContent.mockReset();
    getSeries.mockResolvedValue({
      id: 1, title: 'Strange Things', category: 'Drama', description: '', uploaderId: 9, uploaderUsername: 'maria',
    });
    getReportTypes.mockResolvedValue(REPORT_TYPES);
  });

  it('shows what is being reported and the reasons from the catalog', async () => {
    renderReportPage('/report/series/1');

    expect(await screen.findByText('Report "Strange Things"')).toBeInTheDocument();
    expect(screen.getByLabelText('Violence')).toBeInTheDocument();
    expect(screen.getByLabelText('Other')).toBeInTheDocument();
  });

  it('sends the series and the "Other" type with its explanation', async () => {
    reportContent.mockResolvedValue(undefined);
    renderReportPage('/report/series/1');

    await reportWithOtherReason('Spoilers in the title');

    expect(reportContent).toHaveBeenCalledWith({
      targetType: 'series', targetId: 1, reportTypeId: 6, details: 'Spoilers in the title',
    });
    expect(await screen.findByText('Thanks for your report')).toBeInTheDocument();
  });

  it('lets a fixed reason be sent without details', async () => {
    reportContent.mockResolvedValue(undefined);
    renderReportPage('/report/series/1');
    const user = userEvent.setup();

    await user.click(await screen.findByLabelText('Violence'));
    await user.click(screen.getByRole('button', { name: 'Report' }));
    await user.click(screen.getByRole('button', { name: 'Send report' }));

    expect(reportContent).toHaveBeenCalledWith({ targetType: 'series', targetId: 1, reportTypeId: 1 });
  });

  it('keeps "Report" disabled until "Other" has an explanation', async () => {
    renderReportPage('/report/series/1');

    await userEvent.setup().click(await screen.findByLabelText('Other'));

    expect(screen.getByRole('button', { name: 'Report' })).toBeDisabled();
  });

  it('shows the reason the backend gives when the report is rejected', async () => {
    reportContent.mockRejectedValue(new ApiError('You have already reported this content'));
    renderReportPage('/report/series/1');

    await reportWithOtherReason('Again');

    expect(await screen.findByRole('alert')).toHaveTextContent('You have already reported this content');
  });

  it('rejects an unknown content type in the URL', () => {
    renderReportPage('/report/podcast/1');

    expect(screen.getByRole('alert')).toHaveTextContent('We couldn\'t find that video.');
  });
});
