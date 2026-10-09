import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createAppeal } from '../services/appealService.ts';
import { errorMessage } from '../services/api.ts';

const MAX_DESCRIPTION_LENGTH = 2000;

// Appeal a moderation case against your own content (sketch 7)
export default function AppealPage() {
  // route: /appeal/:reportId, where reportId is the moderation case id
  const { reportId = '' } = useParams();
  const caseId = Number(reportId);

  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  if (!Number.isInteger(caseId) || caseId < 1) {
    return <div role="alert" className="alert alert-error m-4">We couldn&apos;t find that report.</div>;
  }

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

  return (
    <div className="flex justify-center p-4 sm:p-6">
      <div className="card bg-neutral w-full max-w-lg shadow-xl">
        {sent ? (
          <div className="card-body gap-4">
            <h1 className="card-title">Appeal sent</h1>
            <p>An administrator will review it. You can follow its status in your profile.</p>
            <Link to="/profile" className="btn btn-primary">Go to my profile</Link>
          </div>
        ) : (
          <form className="card-body gap-3" onSubmit={handleSubmit}>
            <h1 className="card-title">Appeal case #{caseId}</h1>
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

            {error && <div role="alert" className="alert alert-error text-sm">{error}</div>}

            <div className="card-actions justify-end">
              <Link to="/profile" className="btn btn-ghost">Cancel</Link>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending && <span className="loading loading-spinner loading-sm" />}
                Send appeal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
