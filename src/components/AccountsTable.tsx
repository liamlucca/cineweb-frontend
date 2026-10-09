import { useState } from 'react';
import type { Account } from '../types/index.ts';
import { setAccountActive } from '../services/adminService.ts';
import { errorMessage } from '../services/api.ts';

interface AccountsTableProps {
  accounts: Account[]
  // the logged-in administrator, who cannot deactivate themselves
  currentUserId: number
  // tells the page an account changed, so it can update its list
  onChanged: (account: Account) => void
}

// Viewers and administrators, with a button to activate or deactivate each account
function AccountsTable({ accounts, currentUserId, onChanged }: AccountsTableProps) {
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');

  async function toggle(account: Account) {
    const action = account.active ? 'Deactivate' : 'Activate';
    if (!window.confirm(`${action} the account "${account.username}"?`)) return;

    setBusyId(account.id);
    setError('');
    try {
      onChanged(await setAccountActive(account.id, !account.active));
    } catch (err) {
      setError(errorMessage(err));
    }
    setBusyId(null);
  }

  return (
    <div>
      {error && <div role="alert" className="alert alert-error text-sm mb-3">{error}</div>}
      {/* the table scrolls sideways on phones instead of breaking the layout */}
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th className="hidden md:table-cell">Email</th>
              <th>Role</th>
              <th>State</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td>{account.username}</td>
                <td>{account.firstName} {account.lastName}</td>
                <td className="hidden md:table-cell">{account.email}</td>
                <td>{account.role}</td>
                <td>
                  <span className={`badge ${account.active ? 'badge-success' : 'badge-ghost'}`}>
                    {account.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {account.id !== currentUserId && (
                    <button
                      type="button"
                      className={`btn btn-xs ${account.active ? 'btn-error' : 'btn-success'}`}
                      onClick={() => toggle(account)}
                      disabled={busyId === account.id}
                    >
                      {account.active ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AccountsTable;
