import type { Appeal, AppealDTO } from '../types/index.ts';
import { authHeader, request } from './api.ts';

const NOT_FOUND_ERROR = 'We couldn\'t find that report.';

// Checks that a value from the network really has the shape of an appeal
export function isAppealDTO(value: unknown): value is AppealDTO {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'number'
    && typeof candidate.reportId === 'number'
    && typeof candidate.description === 'string';
}

// "decision" is null while the appeal waits for an administrator
export function toAppeal(dto: AppealDTO): Appeal {
  return {
    id: dto.id,
    description: dto.description,
    reportId: dto.reportId,
    administratorId: dto.administratorId,
    status: dto.decision ?? 'pending',
  };
}

// Only the owner of the reported content can appeal (the backend checks it with the token)
export async function createAppeal(reportId: number, description: string): Promise<void> {
  await request('/api/appeals', NOT_FOUND_ERROR, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ reportId, description }),
  });
}
