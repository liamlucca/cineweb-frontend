import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Account } from '../types/index.ts';
import { createAdministrator } from '../services/adminService.ts';
import { errorMessage } from '../services/api.ts';

interface NewAdministratorFormProps {
  onCreated: (account: Account) => void
}

// Only administrators can create other administrators (public sign-up creates viewers)
function NewAdministratorForm({ onCreated }: NewAdministratorFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // inputs are uncontrolled, like the login form, so the password is never kept in state
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const field = (name: string) => String(data.get(name) ?? '').trim();

    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const account = await createAdministrator({
        username: field('username'),
        firstName: field('firstName'),
        lastName: field('lastName'),
        email: field('email'),
        password: String(data.get('password') ?? ''),
      });
      setSuccess(`The administrator "${account.username}" was created.`);
      form.reset();
      onCreated(account);
    } catch (err) {
      setError(errorMessage(err));
    }
    setSubmitting(false);
  }

  return (
    <form className="card bg-base-200 max-w-xl" onSubmit={handleSubmit}>
      <div className="card-body grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input name="firstName" className="input input-bordered w-full" placeholder="First name" aria-label="First name" required maxLength={100} />
        <input name="lastName" className="input input-bordered w-full" placeholder="Last name" aria-label="Last name" required maxLength={100} />
        <input name="username" className="input input-bordered w-full" placeholder="Username" aria-label="Username" required minLength={3} maxLength={50} />
        <input name="email" type="email" className="input input-bordered w-full" placeholder="Email" aria-label="Email" required />
        <input name="password" type="password" className="input input-bordered w-full sm:col-span-2" placeholder="Password (at least 8 characters)" aria-label="Password" autoComplete="new-password" required minLength={8} />

        <button type="submit" className="btn btn-primary sm:col-span-2" disabled={submitting}>
          {submitting && <span className="loading loading-spinner loading-sm" />}
          Create administrator
        </button>
        {error && <div role="alert" className="alert alert-error text-sm sm:col-span-2">{error}</div>}
        {success && <div role="status" className="alert alert-success text-sm sm:col-span-2">{success}</div>}
      </div>
    </form>
  );
}

export default NewAdministratorForm;
