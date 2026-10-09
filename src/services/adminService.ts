import type {
  Account, Appeal, AppealDecision, ModerationCase, ModerationCaseStatus, RegisterRequest,
} from '../types/index.ts';
import {
  ApiError, GENERIC_ERROR, authHeader, readJson, request,
} from './api.ts';
import { isUserDTO, toUser } from './authService.ts';
import { isAppealDTO, toAppeal } from './appealService.ts';
import { isReportTargetType } from './reportService.ts';

// Every function here needs an administrator session: the backend answers 403 otherwise

const APPEAL_NOT_FOUND = 'That appeal was already resolved or does not exist.';
const CASE_NOT_FOUND = 'We couldn\'t find that report.';
const USER_NOT_FOUND = 'We couldn\'t find that user.';

const CASE_STATUSES: ModerationCaseStatus[] = ['pending', 'appealed', 'upheld', 'dismissed'];

// the backend answers { data: ... } on every administrator endpoint
async function readBody(response: Response): Promise<Record<string, unknown>> {
  const body = await readJson(response);
  if (typeof body !== 'object' || body === null) throw new ApiError(GENERIC_ERROR);
  return body as Record<string, unknown>;
}

function toAccount(value: unknown): Account {
  if (!isUserDTO(value)) throw new ApiError(GENERIC_ERROR);
  return { ...toUser(value), active: Boolean(value.active) };
}

function jsonRequest(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(body),
  };
}

export async function getPendingAppeals(): Promise<Appeal[]> {
  const response = await request('/api/administrators/appeals', APPEAL_NOT_FOUND, { headers: authHeader() });
  const { data } = await readBody(response);
  if (!Array.isArray(data)) throw new ApiError(GENERIC_ERROR);
  return data.filter(isAppealDTO).map(toAppeal);
}

// GET /api/reports/:id answers { data: case, reportCount, reports: [{ reason, ... }] }
export async function getModerationCase(id: number): Promise<ModerationCase> {
  const response = await request(`/api/reports/${id}`, CASE_NOT_FOUND, { headers: authHeader() });
  const { data, reportCount, reports } = await readBody(response);
  const moderationCase = data as Record<string, unknown> | null;
  if (!moderationCase
    || typeof moderationCase.targetType !== 'string'
    || !isReportTargetType(moderationCase.targetType)
    || !CASE_STATUSES.includes(moderationCase.status as ModerationCaseStatus)) {
    throw new ApiError(GENERIC_ERROR);
  }

  return {
    id: Number(moderationCase.id),
    targetType: moderationCase.targetType,
    targetId: Number(moderationCase.targetId),
    status: moderationCase.status as ModerationCaseStatus,
    reportCount: Number(reportCount),
    reasons: Array.isArray(reports)
      ? reports.map((report) => String((report as { reason?: unknown }).reason ?? ''))
      : [],
  };
}

// "approved" keeps the content online; "rejected" suspends it. Returns whether it was suspended.
export async function resolveAppeal(id: number, decision: AppealDecision): Promise<boolean> {
  const response = await request(
    `/api/administrators/appeals/${id}`,
    APPEAL_NOT_FOUND,
    jsonRequest('PATCH', { decision }),
  );
  const { contentSuspended } = await readBody(response);
  return contentSuspended === true;
}

// viewers and administrators
export async function getAccounts(): Promise<Account[]> {
  const response = await request('/api/administrators/users', USER_NOT_FOUND, { headers: authHeader() });
  const { data } = await readBody(response);
  if (!Array.isArray(data)) throw new ApiError(GENERIC_ERROR);
  return data.map(toAccount);
}

// a deactivated account cannot log in, and its sessions stop working at once
export async function setAccountActive(id: number, active: boolean): Promise<Account> {
  const response = await request(
    `/api/administrators/users/${id}/active`,
    USER_NOT_FOUND,
    jsonRequest('PATCH', { active }),
  );
  const { data } = await readBody(response);
  return toAccount(data);
}

export async function createAdministrator(account: RegisterRequest): Promise<Account> {
  // same validation as the public sign-up, in snake_case
  const response = await request('/api/administrators', USER_NOT_FOUND, jsonRequest('POST', {
    user_name: account.username,
    first_name: account.firstName,
    last_name: account.lastName,
    email: account.email,
    password: account.password,
  }));
  const { data } = await readBody(response);
  return toAccount(data);
}
