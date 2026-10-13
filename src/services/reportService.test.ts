import { describe, expect, it } from 'vitest';
import { toCaseReport, toModerationCase } from './reportService.ts';
import { ApiError } from './api.ts';

const CASE_FROM_BACKEND = {
  id: 1,
  targetType: 'movie',
  targetId: 7,
  reportCount: 3,
  status: 'dismissed',
  createdAt: '2026-10-12T23:26:52.000Z',
  content: {
    title: 'claude_test_reported', state: 'active', ownerId: 6, ownerUsername: 'claude_test_other',
  },
  reasons: [
    { reportTypeId: 1, reportType: 'Violence', count: 2 },
    { reportTypeId: 6, reportType: 'Other', count: 1 },
  ],
  appeal: {
    id: 2, description: 'claude test appeal 2', reviewed: true, decision: 'approved',
  },
};

describe('toModerationCase', () => {
  it('converts the backend case and keeps one appeal status', () => {
    const moderationCase = toModerationCase(CASE_FROM_BACKEND);

    expect(moderationCase.content.ownerUsername).toBe('claude_test_other');
    expect(moderationCase.reasons).toEqual(CASE_FROM_BACKEND.reasons);
    expect(moderationCase.appeal).toEqual({ id: 2, description: 'claude test appeal 2', status: 'approved' });
  });

  it('treats an appeal without a decision as pending, and no appeal as null', () => {
    const pending = toModerationCase({
      ...CASE_FROM_BACKEND,
      status: 'appealed',
      appeal: { ...CASE_FROM_BACKEND.appeal, reviewed: false, decision: null },
    });
    const none = toModerationCase({ ...CASE_FROM_BACKEND, status: 'pending', appeal: null });

    expect(pending.appeal?.status).toBe('pending');
    expect(none.appeal).toBeNull();
  });

  it('rejects data that is not a case', () => {
    expect(() => toModerationCase({ ...CASE_FROM_BACKEND, status: 'closed' })).toThrow(ApiError);
    expect(() => toModerationCase(null)).toThrow(ApiError);
  });
});

describe('toCaseReport', () => {
  it('keeps the reason and the details of one report', () => {
    expect(toCaseReport({
      id: 4, targetType: 'movie', targetId: 7, reporterId: 8, reportTypeId: 1, reportType: 'Violence', details: null,
    })).toEqual({
      id: 4, reporterId: 8, reportType: 'Violence', details: null,
    });
  });
});
