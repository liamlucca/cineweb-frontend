import type { ReportType, ReportTypeInput } from '../types/index.ts';
import {
  ApiError, GENERIC_ERROR, authHeader, readJson, request,
} from './api.ts';

const NOT_FOUND_ERROR = 'We couldn\'t find that report reason.';

// Checks that a value from the network really has the shape of a report type
export function isReportType(value: unknown): value is ReportType {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'number'
    && typeof candidate.name === 'string'
    && typeof candidate.requiresDetails === 'boolean';
}

// the backend answers { data: ... } on every /api/report-types endpoint
async function readReportType(response: Response): Promise<ReportType> {
  const data = (await readJson(response) as { data?: unknown } | null)?.data;
  if (!isReportType(data)) throw new ApiError(GENERIC_ERROR);
  return data;
}

function jsonRequest(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  };
}

// The reasons a viewer can choose when reporting (public)
export async function getReportTypes(): Promise<ReportType[]> {
  const response = await request('/api/report-types', NOT_FOUND_ERROR);
  const data = (await readJson(response) as { data?: unknown } | null)?.data;
  if (!Array.isArray(data)) throw new ApiError(GENERIC_ERROR);
  return data.filter(isReportType);
}

// The functions below need an administrator session (403 otherwise).
// A 409 explains the problem: a repeated name, or a type that reports already use.

export async function createReportType(input: ReportTypeInput): Promise<ReportType> {
  return readReportType(await request('/api/report-types', NOT_FOUND_ERROR, jsonRequest('POST', input)));
}

export async function updateReportType(id: number, changes: Partial<ReportTypeInput>): Promise<ReportType> {
  return readReportType(await request(`/api/report-types/${id}`, NOT_FOUND_ERROR, jsonRequest('PATCH', changes)));
}

export async function deleteReportType(id: number): Promise<void> {
  await request(`/api/report-types/${id}`, NOT_FOUND_ERROR, { method: 'DELETE', headers: authHeader() });
}
