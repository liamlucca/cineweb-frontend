import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ReportPage from './ReportPage.tsx';
import { ApiError } from '../services/api.ts';

// fake services, so the test controls what the "backend" answers
const { reportContent, getSeries } = vi.hoisted(() => ({
  reportContent: vi.fn(),
  getSeries: vi.fn(),
}));
vi.mock('../services/reportService.ts', async (importOriginal) => ({
  ...await importOriginal<typeof import('../services/reportService.ts')>(),
  reportContent,
}));
vi.mock('../services/seriesService.ts', () => ({ getSeries }));
vi.mock('../services/movieService.ts', () => ({ getMovie: vi.fn() }));

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
  await user.type(screen.getByLabelText('Other reason'), text);
  await user.click(screen.getByRole('button', { name: 'Report' }));
  await user.click(screen.getByRole('button', { name: 'Send report' }));
}

describe('ReportPage', () => {
  beforeEach(() => {
    reportContent.mockReset();
    getSeries.mockResolvedValue({
      id: 1, title: 'Strange Things', category: 'Drama', description: '', uploaderId: 9,
    });
  });

  it('shows what is being reported', async () => {
    renderReportPage('/report/series/1');

    expect(await screen.findByText('Report "Strange Things"')).toBeInTheDocument();
  });

  it('sends the series and the "Other" reason with its text', async () => {
    reportContent.mockResolvedValue(undefined);
    renderReportPage('/report/series/1');

    await reportWithOtherReason('Spoilers in the title');

    expect(reportContent).toHaveBeenCalledWith({
      targetType: 'series', targetId: 1, reason: 'Other: Spoilers in the title',
    });
    expect(await screen.findByText('Thanks for your report')).toBeInTheDocument();
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
