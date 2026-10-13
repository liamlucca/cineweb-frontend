import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Appeal, AppealDecision, ModerationCase } from '../types/index.ts';
import { getModerationCase, resolveAppeal } from '../services/adminService.ts';
import { errorMessage } from '../services/api.ts';
import CaseSummary from './CaseSummary.tsx';
import useConfirm from '../hooks/useConfirm.ts';

interface AppealReviewCardProps {
  appeal: Appeal
  // tells the page the appeal was resolved, so it can leave the pending list
  onResolved: (appeal: Appeal, decision: AppealDecision, contentSuspended: boolean) => void
}

// One pending appeal (sketch B): see the reported case, then accept or reject the appeal
function AppealReviewCard({ appeal, onResolved }: AppealReviewCardProps) {
  const { confirm } = useConfirm();
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
    const accepted = await confirm(decision === 'approved'
      ? { title: 'Accept this appeal?', message: 'The content will stay online.', confirmLabel: 'Accept' }
      : {
        title: 'Reject this appeal?', message: 'The content will be suspended.', confirmLabel: 'Reject', danger: true,
      });
    if (!accepted) return;

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
            {/* the reported content, its owner and the reasons grouped by the backend */}
            <CaseSummary moderationCase={moderationCase} />
            <Link to={`/admin/reports/${moderationCase.id}`} className="link">See every report</Link>
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
