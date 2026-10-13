import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { AppealDecision, ModerationCaseDetail } from '../types/index.ts';
import { getModerationCase, resolveAppeal } from '../services/adminService.ts';
import { errorMessage } from '../services/api.ts';
import RequestStatus from '../components/RequestStatus.tsx';
import CaseSummary from '../components/CaseSummary.tsx';
import useDocumentTitle from '../hooks/useDocumentTitle.ts';
import useToast from '../hooks/useToast.ts';
import useConfirm from '../hooks/useConfirm.ts';

// Detail of a moderation case for administrators: the reported content and user,
// every report with its reason and details, and the appeal (which can be decided here)
function ModerationCasePage() {
  const { notify } = useToast();
  const { confirm } = useConfirm();
  const { id = '' } = useParams();
  const caseId = Number(id);
  const validId = Number.isInteger(caseId) && caseId > 0;

  const [moderationCase, setModerationCase] = useState<ModerationCaseDetail | null>(null);
  const [loading, setLoading] = useState(validId);
  const [error, setError] = useState(validId ? '' : 'We couldn\'t find that report.');
  const [deciding, setDeciding] = useState(false);
  const [decisionError, setDecisionError] = useState('');

  const load = useCallback(() => {
    if (!validId) return () => undefined;
    let cancelled = false;
    setLoading(true);
    setError('');
    getModerationCase(caseId)
      .then((data) => {
        if (!cancelled) setModerationCase(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [caseId, validId]);

  useEffect(() => load(), [load]);

  async function decide(decision: AppealDecision) {
    const appeal = moderationCase?.appeal;
    if (!appeal) return;
    const accepted = await confirm(decision === 'approved'
      ? { title: 'Accept this appeal?', message: 'The content will stay online.', confirmLabel: 'Accept' }
      : {
        title: 'Reject this appeal?', message: 'The content will be suspended.', confirmLabel: 'Reject', danger: true,
      });
    if (!accepted) return;

    setDeciding(true);
    setDecisionError('');
    try {
      const suspended = await resolveAppeal(appeal.id, decision);
      notify(decision === 'approved'
        ? 'Appeal accepted: the content stays online.'
        : `Appeal rejected${suspended ? ': the content was suspended.' : '.'}`);
      load();
    } catch (err) {
      setDecisionError(errorMessage(err));
    }
    setDeciding(false);
  }

  // browser tab title
  useDocumentTitle(`Report case #${id}`);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <Link to="/admin" className="link text-sm">← Back to administration</Link>

      <RequestStatus loading={loading} error={error} isEmpty={!moderationCase} emptyMessage="">
        {moderationCase && (
          <>
            <div className="card bg-neutral">
              <div className="card-body p-4 md:p-6">
                <CaseSummary moderationCase={moderationCase} />
                <p className="text-sm opacity-80">
                  {moderationCase.reportCount} reports in total.
                  {moderationCase.content.ownerUsername && ` Reported user: @${moderationCase.content.ownerUsername}.`}
                </p>
              </div>
            </div>

            <section className="card bg-base-200">
              <div className="card-body p-4 md:p-6 gap-3">
                <h2 className="card-title text-lg">Appeal</h2>
                {moderationCase.appeal ? (
                  <>
                    <p className="whitespace-pre-line">{moderationCase.appeal.description}</p>
                    {moderationCase.appeal.status === 'pending' && (
                      <div className="card-actions justify-end">
                        <button type="button" className="btn btn-sm btn-success" onClick={() => decide('approved')} disabled={deciding}>
                          Accept appeal
                        </button>
                        <button type="button" className="btn btn-sm btn-error" onClick={() => decide('rejected')} disabled={deciding}>
                          Reject appeal
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="opacity-70">The owner has not appealed this case.</p>
                )}
                {decisionError && <p role="alert" className="text-sm text-error">{decisionError}</p>}
              </div>
            </section>

            <section className="card bg-base-200">
              <div className="card-body p-4 md:p-6 gap-3">
                <h2 className="card-title text-lg">Reports</h2>
                {/* the table scrolls sideways on phones instead of breaking the layout */}
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Reason</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {moderationCase.reports.map((report) => (
                        <tr key={report.id}>
                          <td>{report.id}</td>
                          <td className="whitespace-nowrap">{report.reportType}</td>
                          <td className="whitespace-pre-line">{report.details ?? <span className="opacity-50">—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </RequestStatus>
    </div>
  );
}

export default ModerationCasePage;
