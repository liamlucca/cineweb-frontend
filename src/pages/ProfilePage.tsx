import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { ProfileUpdate, ViewerProfile } from '../types/index.ts';
import useAuth from '../hooks/useAuth.ts';
import { getViewerProfile } from '../services/viewerService.ts';
import { errorMessage } from '../services/api.ts';
import RequestStatus from '../components/RequestStatus.tsx';
import MyReportsList from '../components/MyReportsList.tsx';

// Viewer activity from GET /api/viewers/me (administrators do not have it)
function ViewerActivity() {
  const [profile, setProfile] = useState<ViewerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getViewerProfile()
      .then(setProfile)
      .catch((err: unknown) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <RequestStatus loading={loading} error={error} isEmpty={!profile} emptyMessage="">
      {profile && (
        <>
          <div className="stats stats-vertical sm:stats-horizontal bg-base-200 w-full">
            <div className="stat">
              <div className="stat-title">Uploaded videos</div>
              <div className="stat-value text-2xl">{profile.uploadedCount}</div>
              <div className="stat-desc"><Link to="/my-videos" className="link">See my videos</Link></div>
            </div>
            <div className="stat">
              <div className="stat-title">Ratings given</div>
              <div className="stat-value text-2xl">{profile.reviewsCount}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Reports received</div>
              <div className="stat-value text-2xl">{profile.reportsReceivedCount}</div>
              <div className="stat-desc">on content you uploaded</div>
            </div>
          </div>

          {/* the cases against the viewer's content, with "Appeal" and "Withdraw appeal" */}
          <MyReportsList />
        </>
      )}
    </RequestStatus>
  );
}

function ProfilePage() {
  const { user, updateProfile } = useAuth();
  // the form starts with the current data (no password: it is never kept in state)
  const [username, setUsername] = useState(user?.username ?? '');
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // ProtectedRoute only lets logged-in users in, so this only satisfies TypeScript
  if (!user) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    // send only what changed
    const changes: ProfileUpdate = {};
    if (username.trim() !== user.username) changes.username = username.trim();
    if (firstName.trim() !== user.firstName) changes.firstName = firstName.trim();
    if (lastName.trim() !== user.lastName) changes.lastName = lastName.trim();
    if (email.trim().toLowerCase() !== user.email) changes.email = email.trim();

    setError('');
    setMessage('');
    if (Object.keys(changes).length === 0) {
      setMessage('There is nothing to change.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(changes);
      setMessage('Your profile was saved.');
    } catch (err) {
      setError(errorMessage(err));
    }
    setSaving(false);
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">My profile</h1>
      <p className="opacity-70 mb-6">
        {user.role === 'administrator' ? 'Administrator' : 'Viewer'} account
      </p>

      <form className="card bg-neutral shadow-xl mb-8" onSubmit={handleSubmit}>
        <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="label">Username</span>
            <input className="input input-bordered w-full" required minLength={3} maxLength={50} value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">Email</span>
            <input type="email" className="input input-bordered w-full" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">First name</span>
            <input className="input input-bordered w-full" required maxLength={100} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">Last name</span>
            <input className="input input-bordered w-full" required maxLength={100} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </label>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <span className="loading loading-spinner loading-sm" />}
              Save changes
            </button>
            {message && <span role="status" className="text-sm text-success">{message}</span>}
          </div>
          {error && <div role="alert" className="alert alert-error text-sm md:col-span-2">{error}</div>}
        </div>
      </form>

      {user.role === 'viewer' && <ViewerActivity />}
    </div>
  );
}

export default ProfilePage;
