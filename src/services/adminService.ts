import type {
  Account, Appeal, AppealDecision, CaseFilters, ModerationCase, ModerationCaseDetail, RegisterRequest,
} from '../types/index.ts';
import {
  ApiError, GENERIC_ERROR, authHeader, readJson, request,
} from './api.ts';
import { isUserDTO, toUser } from './authService.ts';
import { isAppealDTO, toAppeal } from './appealService.ts';
import { toCaseReport, toModerationCase } from './reportService.ts';

// Every function here needs an administrator session: the backend answers 403 otherwise

const APPEAL_NOT_FOUND = 'That appeal was already resolved or does not exist.';
const CASE_NOT_FOUND = 'We couldn\'t find that report.';
const USER_NOT_FOUND = 'We couldn\'t find that user.';

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

// GET /api/reports with optional ?id=, ?status= and ?reportTypeId= (newest cases first)
export async function getModerationCases(filters: CaseFilters = {}): Promise<ModerationCase[]> {
  const query = new URLSearchParams();
  if (filters.id) query.set('id', String(filters.id));
  if (filters.status) query.set('status', filters.status);
  if (filters.reportTypeId) query.set('reportTypeId', String(filters.reportTypeId));
  const search = query.toString();

  const response = await request(`/api/reports${search ? `?${search}` : ''}`, CASE_NOT_FOUND, { headers: authHeader() });
  const { data } = await readBody(response);
  if (!Array.isArray(data)) throw new ApiError(GENERIC_ERROR);
  return data.map(toModerationCase);
}

// GET /api/reports/:id answers { data: case summary, reportCount, reports: [{ reportType, details, ... }] }
export async function getModerationCase(id: number): Promise<ModerationCaseDetail> {
  const response = await request(`/api/reports/${id}`, CASE_NOT_FOUND, { headers: authHeader() });
  const { data, reports } = await readBody(response);
  return {
    ...toModerationCase(data),
    reports: Array.isArray(reports) ? reports.map(toCaseReport) : [],
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
