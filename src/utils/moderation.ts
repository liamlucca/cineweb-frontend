import type {
  AppealStatus, ModerationCaseStatus, ReportTargetType,
} from '../types/index.ts';

// Texts and DaisyUI badge colors for the states of moderation cases and appeals.
// Shared by the administrator screens and the viewer's profile.

export const CASE_STATUS_TEXT: Record<ModerationCaseStatus, string> = {
  pending: 'Open',
  appealed: 'Appealed',
  upheld: 'Upheld: content suspended',
  dismissed: 'Dismissed: content stays online',
};

export const CASE_STATUS_BADGE: Record<ModerationCaseStatus, string> = {
  pending: 'badge-warning',
  appealed: 'badge-info',
  upheld: 'badge-error',
  dismissed: 'badge-success',
};

export const CASE_STATUS_OPTIONS: ModerationCaseStatus[] = ['pending', 'appealed', 'upheld', 'dismissed'];

export const APPEAL_STATUS_TEXT: Record<AppealStatus, string> = {
  pending: 'Waiting for review',
  approved: 'Accepted: the content stays online',
  rejected: 'Rejected: the content was suspended',
};

export const APPEAL_STATUS_BADGE: Record<AppealStatus, string> = {
  pending: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-error',
};

// Page of a movie or a series inside the app
export function contentPath(type: ReportTargetType, id: number): string {
  return type === 'movie' ? `/watch/${id}` : `/series/${id}/seasons`;
}

// "12 Oct 2026" from an ISO date, or '' when it is not a valid date
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
