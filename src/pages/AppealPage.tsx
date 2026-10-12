import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ModerationCase } from '../types/index.ts';
import { createAppeal } from '../services/appealService.ts';
import { getMyReports } from '../services/viewerService.ts';
import { errorMessage } from '../services/api.ts';
import RequestStatus from '../components/RequestStatus.tsx';
import CaseSummary from '../components/CaseSummary.tsx';

const MAX_DESCRIPTION_LENGTH = 2000;
const NOT_FOUND = 'We couldn\'t find that report about your content.';

// Appeal a moderation case against your own content (sketch 7).
// Reached from "Reports about my content" in the profile.
export default function AppealPage() {
  // route: /appeal/:reportId, where reportId is the moderation case id
  const { reportId = '' } = useParams();
  const caseId = Number(reportId);
  const validId = Number.isInteger(caseId) && caseId > 0;

  // the case being appealed, so the page says what the appeal is about
  const [moderationCase, setModerationCase] = useState<ModerationCase | null>(null);
  const [loading, setLoading] = useState(validId);
  const [loadError, setLoadError] = useState(validId ? '' : NOT_FOUND);

  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!validId) return undefined;
    let cancelled = false;
    // only the cases about the user's own content are listed, so another user's case is "not found"
    getMyReports()
      .then((cases) => {
        if (cancelled) return;
        const found = cases.find((item) => item.id === caseId);
        if (found) setModerationCase(found);
        else setLoadError(NOT_FOUND);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [caseId, validId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      await createAppeal(caseId, description.trim());
      setSent(true);
    } catch (err) {
      // a 409 explains why ("An appeal already exists for this report"...)
      setError(errorMessage(err));
    }
    setSending(false);
  }

  // a case that was already appealed or decided cannot be appealed again
  const canAppeal = moderationCase?.status === 'pending' && !moderationCase.appeal;

  return (
    <div className="flex justify-center p-4 sm:p-6">
      <div className="card bg-neutral w-full max-w-lg shadow-xl">
        <RequestStatus loading={loading} error={loadError} isEmpty={!moderationCase} emptyMessage="">
          {sent && (
            <div className="card-body gap-4">
              <h1 className="card-title">Appeal sent</h1>
              <p>An administrator will review it. You can follow its status in your profile.</p>
              <Link to="/profile" className="btn btn-primary">Go to my profile</Link>
            </div>
          )}

          {!sent && moderationCase && (
            <form className="card-body gap-3" onSubmit={handleSubmit}>
              <h1 className="card-title">Appeal case #{caseId}</h1>
              <div className="bg-base-100 rounded-box p-3 text-sm">
                <CaseSummary moderationCase={moderationCase} showOwner={false} />
              </div>

              {canAppeal ? (
                <>
                  <p className="text-sm opacity-70">
                    Explain why your content should stay online. An administrator will read it.
                  </p>
                  <textarea
                    className="textarea textarea-bordered w-full min-h-32"
                    aria-label="Why should your content stay online?"
                    required
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <p className="text-xs opacity-70 text-right">{description.length}/{MAX_DESCRIPTION_LENGTH}</p>
                </>
              ) : (
                <p role="status" className="alert alert-info text-sm">
                  This case can no longer be appealed: it was already appealed or decided.
                </p>
              )}

              {error && <div role="alert" className="alert alert-error text-sm">{error}</div>}

              <div className="card-actions justify-end">
                <Link to="/profile" className="btn btn-ghost">{canAppeal ? 'Cancel' : 'Back to my profile'}</Link>
                {canAppeal && (
                  <button type="submit" className="btn btn-primary" disabled={sending}>
                    {sending && <span className="loading loading-spinner loading-sm" />}
                    Send appeal
                  </button>
                )}
              </div>
            </form>
          )}
        </RequestStatus>
      </div>
    </div>
  );
}
