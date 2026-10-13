import type {
  AppealDecision, CaseAppeal, CaseReport, ModerationCase, ModerationCaseStatus, ReasonCount,
  ReportRequest, ReportTargetType,
} from '../types/index.ts';
import { ApiError, GENERIC_ERROR, authHeader, request } from './api.ts';

const NOT_FOUND_ERROR = 'We couldn\'t find that video.';

const CASE_STATUSES: ModerationCaseStatus[] = ['pending', 'appealed', 'upheld', 'dismissed'];

export function isReportTargetType(value: string | undefined): value is ReportTargetType {
  return value === 'movie' || value === 'series';
}

export function isCaseStatus(value: unknown): value is ModerationCaseStatus {
  return CASE_STATUSES.includes(value as ModerationCaseStatus);
}

// Only viewers can report; the backend takes the reporter from the token
export async function reportContent(report: ReportRequest): Promise<void> {
  await request('/api/reports', NOT_FOUND_ERROR, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(report),
  });
}

type Json = Record<string, unknown>;

const asObject = (value: unknown): Json => (
  typeof value === 'object' && value !== null ? value as Json : {}
);
const textOrNull = (value: unknown): string | null => (typeof value === 'string' ? value : null);

function toReasonCount(value: unknown): ReasonCount {
  const reason = asObject(value);
  return {
    reportTypeId: Number(reason.reportTypeId),
    reportType: String(reason.reportType ?? ''),
    count: Number(reason.count),
  };
}

// the backend sends reviewed + decision; the app keeps one status, as for any appeal
function toCaseAppeal(value: unknown): CaseAppeal | null {
  if (typeof value !== 'object' || value === null) return null;
  const appeal = value as Json;
  return {
    id: Number(appeal.id),
    description: String(appeal.description ?? ''),
    status: (appeal.decision as AppealDecision | null) ?? 'pending',
  };
}

// Converts a case as GET /api/reports, GET /api/reports/:id and GET /api/viewers/me/reports send it.
// Throws when the value does not look like a case, so pages never show half-broken data.
export function toModerationCase(value: unknown): ModerationCase {
  const item = asObject(value);
  if (typeof item.id !== 'number'
    || typeof item.targetType !== 'string'
    || !isReportTargetType(item.targetType)
    || !isCaseStatus(item.status)) {
    throw new ApiError(GENERIC_ERROR);
  }
  const content = asObject(item.content);
  return {
    id: item.id,
    targetType: item.targetType,
    targetId: Number(item.targetId),
    status: item.status,
    reportCount: Number(item.reportCount),
    createdAt: String(item.createdAt ?? ''),
    content: {
      title: textOrNull(content.title),
      state: textOrNull(content.state),
      ownerId: typeof content.ownerId === 'number' ? content.ownerId : null,
      ownerUsername: textOrNull(content.ownerUsername),
    },
    reasons: Array.isArray(item.reasons) ? item.reasons.map(toReasonCount) : [],
    appeal: toCaseAppeal(item.appeal),
  };
}

export function toCaseReport(value: unknown): CaseReport {
  const report = asObject(value);
  return {
    id: Number(report.id),
    reporterId: Number(report.reporterId),
    reportType: String(report.reportType ?? ''),
    details: textOrNull(report.details),
  };
}
