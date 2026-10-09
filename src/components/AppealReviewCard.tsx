import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Appeal, AppealDecision, ModerationCase } from '../types/index.ts';
import { getModerationCase, resolveAppeal } from '../services/adminService.ts';
import { errorMessage } from '../services/api.ts';

interface AppealReviewCardProps {
  appeal: Appeal
  // tells the page the appeal was resolved, so it can leave the pending list
  onResolved: (appeal: Appeal, decision: AppealDecision, contentSuspended: boolean) => void
}

// how many reports gave each reason, most repeated first
function countReasons(reasons: string[]): [string, number][] {
  const counts = new Map<string, number>();
  reasons.forEach((reason) => counts.set(reason, (counts.get(reason) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

// One pending appeal (sketch B): see the reported case, then accept or reject the appeal
function AppealReviewCard({ appeal, onResolved }: AppealReviewCardProps) {
  const [moderationCase, setModerationCase] = useState<ModerationCase | null>(null);
  const [loadingCase, setLoadingCase] = useState(false);
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState('');

  async function showCase() {
    setLoadingCase(true);
    setError('');
    try {
      setModerationCase(await getModerationCase(appeal.reportId));
    } catch (err) {
      setError(errorMessage(err));
    }
    setLoadingCase(false);
  }

  async function decide(decision: AppealDecision) {
    const question = decision === 'approved'
      ? 'Accept this appeal? The content will stay online.'
      : 'Reject this appeal? The content will be suspended.';
    if (!window.confirm(question)) return;

    setDeciding(true);
    setError('');
    try {
      const suspended = await resolveAppeal(appeal.id, decision);
      onResolved(appeal, decision, suspended);
    } catch (err) {
      setError(errorMessage(err));
      setDeciding(false);
    }
  }

  // suspended content is hidden by the backend, so this link may show "not found"
  const contentLink = moderationCase?.targetType === 'series'
    ? `/series/${moderationCase.targetId}/seasons`
    : `/watch/${moderationCase?.targetId}`;

  return (
    <div className="card bg-base-200">
      <div className="card-body p-4 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-bold">Appeal #{appeal.id}</h3>
          <span className="badge badge-outline">Case #{appeal.reportId}</span>
        </div>
        <p className="whitespace-pre-line">{appeal.description}</p>

        {!moderationCase && (
          <button type="button" className="btn btn-sm btn-ghost self-start" onClick={showCase} disabled={loadingCase}>
            {loadingCase && <span className="loading loading-spinner loading-sm" />}
            See the reports
          </button>
        )}

        {moderationCase && (
          <div className="bg-base-100 rounded-box p-3 text-sm space-y-2">
            <p>
              Reported {moderationCase.targetType}: <Link to={contentLink} className="link">#{moderationCase.targetId}</Link>
              {' · '}{moderationCase.reportCount} reports · status: {moderationCase.status}
            </p>
            <ul className="list-disc list-inside">
              {countReasons(moderationCase.reasons).map(([reason, count]) => (
                <li key={reason}>{reason} ({count})</li>
              ))}
            </ul>
          </div>
        )}

        {error && <p role="alert" className="text-sm text-error">{error}</p>}

        <div className="card-actions justify-end">
          <button type="button" className="btn btn-sm btn-success" onClick={() => decide('approved')} disabled={deciding}>
            Accept appeal
          </button>
          <button type="button" className="btn btn-sm btn-error" onClick={() => decide('rejected')} disabled={deciding}>
            Reject appeal
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppealReviewCard;
