import { useEffect, useState } from 'react';
import type {
  Account, Appeal, AppealDecision, ReportType,
} from '../types/index.ts';
import { getAccounts, getPendingAppeals } from '../services/adminService.ts';
import { getReportTypes } from '../services/reportTypeService.ts';
import { errorMessage } from '../services/api.ts';
import useAuth from '../hooks/useAuth.ts';
import RequestStatus from '../components/RequestStatus.tsx';
import AppealReviewCard from '../components/AppealReviewCard.tsx';
import AccountsTable from '../components/AccountsTable.tsx';
import NewAdministratorForm from '../components/NewAdministratorForm.tsx';
import ReportTypesManager from '../components/ReportTypesManager.tsx';
import ModerationCasesPanel from '../components/ModerationCasesPanel.tsx';

type Tab = 'appeals' | 'cases' | 'reportTypes' | 'users' | 'administrators';

const TABS: { id: Tab, label: string }[] = [
  { id: 'appeals', label: 'Pending appeals' },
  { id: 'cases', label: 'Reports' },
  { id: 'reportTypes', label: 'Report reasons' },
  { id: 'users', label: 'Users' },
  { id: 'administrators', label: 'New administrator' },
];

// Administrator landing page (sketch A): pending appeals (sketch B), reported content,
// the report reasons catalog and user management
function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('appeals');

  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loadingAppeals, setLoadingAppeals] = useState(true);
  const [appealsError, setAppealsError] = useState('');
  // result of the last decision, shown above the list
  const [lastResult, setLastResult] = useState('');

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [accountsError, setAccountsError] = useState('');

  // catalog of report reasons (CRUD in its own tab)
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [typesError, setTypesError] = useState('');

  useEffect(() => {
    getPendingAppeals()
      .then(setAppeals)
      .catch((err: unknown) => setAppealsError(errorMessage(err)))
      .finally(() => setLoadingAppeals(false));

    getAccounts()
      .then(setAccounts)
      .catch((err: unknown) => setAccountsError(errorMessage(err)))
      .finally(() => setLoadingAccounts(false));

    getReportTypes()
      .then(setReportTypes)
      .catch((err: unknown) => setTypesError(errorMessage(err)))
      .finally(() => setLoadingTypes(false));
  }, []);

  function handleResolved(appeal: Appeal, decision: AppealDecision, contentSuspended: boolean) {
    setAppeals((current) => current.filter((item) => item.id !== appeal.id));
    setLastResult(decision === 'approved'
      ? `Appeal #${appeal.id} accepted: the content stays online.`
      : `Appeal #${appeal.id} rejected${contentSuspended ? ': the content was suspended.' : '.'}`);
  }

  function handleAccountChanged(changed: Account) {
    setAccounts((current) => {
      const exists = current.some((account) => account.id === changed.id);
      return exists
        ? current.map((account) => (account.id === changed.id ? changed : account))
        : [...current, changed];
    });
  }

  function handleTypeSaved(saved: ReportType) {
    setReportTypes((current) => (current.some((item) => item.id === saved.id)
      ? current.map((item) => (item.id === saved.id ? saved : item))
      : [...current, saved]));
  }

  // ProtectedRoute only lets administrators in, so this only satisfies TypeScript
  if (!user) return null;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Administration</h1>
      <p className="opacity-70 mb-4">Hi, {user.firstName}. Review appeals and manage accounts.</p>

      {/* the tabs scroll sideways on phones instead of wrapping */}
      <div role="tablist" className="tabs tabs-box mb-6 flex-nowrap overflow-x-auto">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`tab whitespace-nowrap ${tab === item.id ? 'tab-active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
            {item.id === 'appeals' && appeals.length > 0 && <span className="badge badge-sm badge-warning ml-2">{appeals.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'appeals' && (
        <section>
          {lastResult && <div role="status" className="alert alert-success text-sm mb-4">{lastResult}</div>}
          <RequestStatus
            loading={loadingAppeals}
            error={appealsError}
            isEmpty={appeals.length === 0}
            emptyMessage="There are no pending appeals."
          >
            <div className="space-y-4">
              {appeals.map((appeal) => (
                <AppealReviewCard key={appeal.id} appeal={appeal} onResolved={handleResolved} />
              ))}
            </div>
          </RequestStatus>
        </section>
      )}

      {/* list of reported content with filters; each case opens its detail page */}
      {tab === 'cases' && <ModerationCasesPanel reportTypes={reportTypes} />}

      {tab === 'reportTypes' && (
        <RequestStatus loading={loadingTypes} error={typesError} isEmpty={false} emptyMessage="">
          <ReportTypesManager
            reportTypes={reportTypes}
            onSaved={handleTypeSaved}
            onDeleted={(id) => setReportTypes((current) => current.filter((item) => item.id !== id))}
          />
        </RequestStatus>
      )}

      {tab === 'users' && (
        <RequestStatus
          loading={loadingAccounts}
          error={accountsError}
          isEmpty={accounts.length === 0}
          emptyMessage="There are no accounts."
        >
          <AccountsTable accounts={accounts} currentUserId={user.id} onChanged={handleAccountChanged} />
        </RequestStatus>
      )}

      {tab === 'administrators' && <NewAdministratorForm onCreated={handleAccountChanged} />}
    </div>
  );
}

export default AdminPage;
