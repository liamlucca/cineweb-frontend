import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ModerationCase } from '../types/index.ts';
import { getMyReports } from '../services/viewerService.ts';
import { withdrawAppeal } from '../services/appealService.ts';
import { errorMessage } from '../services/api.ts';
import RequestStatus from './RequestStatus.tsx';
import CaseSummary from './CaseSummary.tsx';
import useToast from '../hooks/useToast.ts';
import useConfirm from '../hooks/useConfirm.ts';

// "Reports about my content" (sketch 7): the cases opened against the viewer's videos,
// with a button to appeal an open case or to withdraw an appeal that is still pending
function MyReportsList() {
  const { notify } = useToast();
  const { confirm } = useConfirm();
  const [cases, setCases] = useState<ModerationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [actionError, setActionError] = useState('');

  function load() {
    return getMyReports()
      .then(setCases)
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function withdraw(moderationCase: ModerationCase) {
    if (!moderationCase.appeal) return;
    if (!(await confirm({
      title: 'Withdraw your appeal?',
      message: 'You can appeal this case again later.',
      confirmLabel: 'Withdraw',
    }))) return;

    setBusyId(moderationCase.id);
    setActionError('');
    try {
      await withdrawAppeal(moderationCase.appeal.id);
      notify(`Your appeal for case #${moderationCase.id} was withdrawn.`);
      await load();
    } catch (err) {
      // a 409 explains it was already reviewed
      setActionError(errorMessage(err));
    }
    setBusyId(null);
  }

  return (
    <section>
      <h2 className="text-xl font-bold mt-8 mb-1">Reports about my content</h2>
      <p className="text-sm opacity-70 mb-3">
        When a video gets 3 reports, a case opens. You can appeal it, and an administrator decides.
      </p>
      {actionError && <div role="alert" className="alert alert-error text-sm mb-3">{actionError}</div>}

      <RequestStatus
        loading={loading}
        error={error}
        isEmpty={cases.length === 0}
        emptyMessage="Nobody has reported your videos. Keep it up!"
      >
        <ul className="space-y-3">
          {cases.map((item) => (
            <li key={item.id} className="card bg-base-200">
              <div className="card-body p-4 gap-3 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <CaseSummary moderationCase={item} showOwner={false} />
                </div>
                {item.status === 'pending' && !item.appeal && (
                  <Link to={`/appeal/${item.id}`} className="btn btn-sm btn-primary self-start sm:self-center">
                    Appeal
                  </Link>
                )}
                {item.appeal?.status === 'pending' && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline self-start sm:self-center"
                    onClick={() => withdraw(item)}
                    disabled={busyId === item.id}
                  >
                    {busyId === item.id && <span className="loading loading-spinner loading-xs" />}
                    Withdraw appeal
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </RequestStatus>
    </section>
  );
}

export default MyReportsList;
