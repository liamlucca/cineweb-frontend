import type { ReportRequest, ReportTargetType } from '../types/index.ts';
import { authHeader, request } from './api.ts';

const NOT_FOUND_ERROR = 'We couldn\'t find that video.';

export function isReportTargetType(value: string | undefined): value is ReportTargetType {
  return value === 'movie' || value === 'series';
}

// Only viewers can report; the backend takes the reporter from the token
export async function reportContent(report: ReportRequest): Promise<void> {
  await request('/api/reports', NOT_FOUND_ERROR, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(report),
  });
}
