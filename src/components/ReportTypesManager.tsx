import { useState } from 'react';
import type { FormEvent } from 'react';
import type { ReportType } from '../types/index.ts';
import { createReportType, deleteReportType, updateReportType } from '../services/reportTypeService.ts';
import { errorMessage } from '../services/api.ts';

interface ReportTypesManagerProps {
  reportTypes: ReportType[]
  // tells the page a type was created or edited, so it can update its list
  onSaved: (reportType: ReportType) => void
  onDeleted: (id: number) => void
}

interface ReportTypeRowProps {
  reportType: ReportType
  onSaved: (reportType: ReportType) => void
  onDeleted: (id: number) => void
}

// One reason of the catalog: shows it, or edits it in place
function ReportTypeRow({ reportType, onSaved, onDeleted }: ReportTypeRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(reportType.name);
  const [requiresDetails, setRequiresDetails] = useState(reportType.requiresDetails);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function startEditing() {
    setName(reportType.name);
    setRequiresDetails(reportType.requiresDetails);
    setError('');
    setEditing(true);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      onSaved(await updateReportType(reportType.id, { name: name.trim(), requiresDetails }));
      setEditing(false);
    } catch (err) {
      // a 409 explains it: "A report type with that name already exists"
      setError(errorMessage(err));
    }
    setBusy(false);
  }

  async function remove() {
    if (!window.confirm(`Delete the reason "${reportType.name}"?`)) return;
    setBusy(true);
    setError('');
    try {
      await deleteReportType(reportType.id);
      onDeleted(reportType.id);
    } catch (err) {
      // a 409 explains that reports already use it
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <li className="card bg-base-200">
      <div className="card-body p-4 gap-2">
        {editing ? (
          <form className="flex flex-col sm:flex-row sm:items-center gap-3" onSubmit={save}>
            <input
              className="input input-bordered w-full sm:flex-1"
              aria-label="Reason name"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={requiresDetails}
                onChange={(e) => setRequiresDetails(e.target.checked)}
              />
              <span className="text-sm">Needs an explanation</span>
            </label>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-sm btn-success" disabled={busy}>
                {busy && <span className="loading loading-spinner loading-xs" />}
                Save
              </button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditing(false)} disabled={busy}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold flex-1">{reportType.name}</span>
            {reportType.requiresDetails && <span className="badge badge-outline badge-sm">Needs an explanation</span>}
            <button type="button" className="btn btn-sm btn-ghost" onClick={startEditing} disabled={busy}>Edit</button>
            <button type="button" className="btn btn-sm btn-error btn-outline" onClick={remove} disabled={busy}>
              Delete
            </button>
          </div>
        )}
        {error && <p role="alert" className="text-sm text-error">{error}</p>}
      </div>
    </li>
  );
}

// CRUD of the report reasons that viewers choose from in the report form
function ReportTypesManager({ reportTypes, onSaved, onDeleted }: ReportTypesManagerProps) {
  const [name, setName] = useState('');
  const [requiresDetails, setRequiresDetails] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError('');
    try {
      onSaved(await createReportType({ name: name.trim(), requiresDetails }));
      setName('');
      setRequiresDetails(false);
    } catch (err) {
      setError(errorMessage(err));
    }
    setCreating(false);
  }

  return (
    <section className="space-y-4">
      <p className="opacity-70 text-sm">
        These are the reasons viewers can choose when they report a video. Reasons that need an
        explanation, such as &quot;Other&quot;, ask the viewer to write one.
      </p>

      <form className="card bg-neutral" onSubmit={create}>
        <div className="card-body p-4 gap-3">
          <h2 className="card-title text-base">New reason</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              className="input input-bordered w-full sm:flex-1"
              placeholder="E.g: Spam or misleading"
              aria-label="New reason name"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label className="label cursor-pointer gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={requiresDetails}
                onChange={(e) => setRequiresDetails(e.target.checked)}
              />
              <span className="text-sm">Needs an explanation</span>
            </label>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating && <span className="loading loading-spinner loading-sm" />}
              Add reason
            </button>
          </div>
          {error && <div role="alert" className="alert alert-error text-sm">{error}</div>}
        </div>
      </form>

      {reportTypes.length === 0
        ? <p className="opacity-70">There are no reasons yet. Add the first one above.</p>
        : (
          <ul className="space-y-2">
            {reportTypes.map((reportType) => (
              <ReportTypeRow key={reportType.id} reportType={reportType} onSaved={onSaved} onDeleted={onDeleted} />
            ))}
          </ul>
        )}
    </section>
  );
}

export default ReportTypesManager;
