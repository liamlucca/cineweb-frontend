import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type {
  CaseFilters, ModerationCase, ModerationCaseStatus, ReportType,
} from '../types/index.ts';
import { getModerationCases } from '../services/adminService.ts';
import { isCaseStatus } from '../services/reportService.ts';
import { errorMessage } from '../services/api.ts';
import { CASE_STATUS_OPTIONS, CASE_STATUS_TEXT } from '../utils/moderation.ts';
import RequestStatus from './RequestStatus.tsx';
import CaseSummary from './CaseSummary.tsx';

interface ModerationCasesPanelProps {
  // catalog of reasons, for the "Reason" filter
  reportTypes: ReportType[]
}

// List of moderation cases (reported content) with filters by case number, state and reason
function ModerationCasesPanel({ reportTypes }: ModerationCasesPanelProps) {
  // what the filter inputs show
  const [caseId, setCaseId] = useState('');
  const [status, setStatus] = useState<ModerationCaseStatus | ''>('');
  const [reportTypeId, setReportTypeId] = useState('');
  // the filters of the last search: changing them loads the list again
  const [filters, setFilters] = useState<CaseFilters>({});

  const [cases, setCases] = useState<ModerationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getModerationCases(filters)
      .then((data) => {
        if (!cancelled) setCases(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [filters]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters({
      ...(caseId ? { id: Number(caseId) } : {}),
      ...(status ? { status } : {}),
      ...(reportTypeId ? { reportTypeId: Number(reportTypeId) } : {}),
    });
  }

  function clear() {
    setCaseId('');
    setStatus('');
    setReportTypeId('');
    setFilters({});
  }

  const filtering = Object.keys(filters).length > 0;

  return (
    <section className="space-y-4">
      <form className="card bg-neutral" onSubmit={search} aria-label="Filter reports">
        <div className="card-body p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Case number</span>
            <input
              type="number"
              min={1}
              step={1}
              className="input input-bordered w-full"
              placeholder="Any"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">State</span>
            <select
              className="select select-bordered w-full"
              value={status}
              onChange={(e) => setStatus(isCaseStatus(e.target.value) ? e.target.value : '')}
            >
              <option value="">Any state</option>
              {CASE_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{CASE_STATUS_TEXT[option]}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm">Reason</span>
            <select className="select select-bordered w-full" value={reportTypeId} onChange={(e) => setReportTypeId(e.target.value)}>
              <option value="">Any reason</option>
              {reportTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
            </select>
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">Search</button>
            <button type="button" className="btn btn-ghost" onClick={clear} disabled={!filtering && !caseId && !status && !reportTypeId}>
              Clear
            </button>
          </div>
        </div>
      </form>

      <RequestStatus
        loading={loading}
        error={error}
        isEmpty={cases.length === 0}
        emptyMessage={filtering ? 'No reports match these filters.' : 'There are no reports yet: content needs 3 reports to open a case.'}
      >
        <ul className="space-y-3">
          {cases.map((item) => (
            <li key={item.id} className="card bg-base-200">
              <div className="card-body p-4 gap-3 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <CaseSummary moderationCase={item} />
                </div>
                <Link to={`/admin/reports/${item.id}`} className="btn btn-sm btn-outline self-start sm:self-center">
                  See details
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </RequestStatus>
    </section>
  );
}

export default ModerationCasesPanel;
