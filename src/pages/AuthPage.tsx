import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.ts';
import { ApiError } from '../services/api.ts';

interface AuthLocationState {
  from?: string;
}

function AuthPage() {
  const { user, login, register } = useAuth();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // once logged in, go back to the page that sent us here (or home)
  if (user) {
    const from = (location.state as AuthLocationState | null)?.from ?? '/';
    return <Navigate to={from} replace />;
  }

  // inputs are uncontrolled so the password is never kept in React state
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? '').trim();

    setSubmitting(true);
    setError('');
    try {
      if (isRegister) {
        await register({
          firstName: field('firstName'),
          lastName: field('lastName'),
          email: field('email'),
          username: field('username'),
          password: String(data.get('password') ?? ''),
        });
      } else {
        await login({ login: field('login'), password: String(data.get('password') ?? '') });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  function toggleMode() {
    setIsRegister(!isRegister);
    setError('');
  }

  return (
    <div className="min-h-[78vh] flex flex-col gap-8 items-center justify-center bg-base-100 px-4">

      <h1 className="text-4xl sm:text-5xl font-bold">Welcome!</h1>

      <div className="card bg-neutral w-full max-w-sm shadow-xl">
        <form className="card-body" onSubmit={handleSubmit}>
          <h2 className="card-title justify-center">
            {isRegister ? 'Sign Up' : 'Log In'}
          </h2>
          <p className="text-sm">Enter your details:</p>

          {isRegister && (
            <>
              <input name="firstName" className="input input-bordered w-full" placeholder="First name..." autoComplete="given-name" required />
              <input name="lastName" className="input input-bordered w-full" placeholder="Last name..." autoComplete="family-name" required />
            </>
          )}

          {/* log in accepts the email or the username; sign up asks for both */}
          {isRegister ? (
            <>
              <input name="email" type="email" className="input input-bordered w-full" placeholder="Email..." autoComplete="email" required />
              <input name="username" className="input input-bordered w-full" placeholder="Username..." autoComplete="username" minLength={3} maxLength={50} required />
            </>
          ) : (
            <input name="login" className="input input-bordered w-full" placeholder="Email or username..." autoComplete="username" required />
          )}

          <input
            name="password"
            type="password"
            className="input input-bordered w-full"
            placeholder="Password..."
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            // the backend rejects sign-up passwords shorter than 8 characters
            minLength={isRegister ? 8 : undefined}
            required
          />
          {isRegister && <p className="text-xs opacity-70">At least 8 characters.</p>}

          {error && (
            <div role="alert" className="alert alert-error text-sm">
              {error}
            </div>
          )}

          <button type="submit" className="btn bg-primary text-primary-content w-full" disabled={submitting}>
            {submitting && <span className="loading loading-spinner loading-sm" />}
            {isRegister ? 'Sign Up' : 'Log In'}
          </button>

          <button type="button" className="link color-base-content text-sm text-center" onClick={toggleMode}>
            {isRegister ? 'Already have an account? Log in' : 'No account yet? Sign up'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
