import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AuthPage from './AuthPage.tsx';
import { AuthContext } from '../context/AuthContext.ts';
import type { AuthContextValue } from '../context/AuthContext.ts';
import { ApiError } from '../services/api.ts';

function renderAuthPage(login: AuthContextValue['login']) {
  const value: AuthContextValue = {
    user: null, login, register: vi.fn(), logout: vi.fn(), updateProfile: vi.fn(),
  };

  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

async function fillAndSubmitLogin() {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText('Email or username...'), 'viewer@cineweb.com');
  await user.type(screen.getByPlaceholderText('Password...'), 'wrong-password');
  await user.click(screen.getByRole('button', { name: 'Log In' }));
}

describe('AuthPage', () => {
  it('sends the typed email or username and password to login', async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    renderAuthPage(login);

    await fillAndSubmitLogin();

    expect(login).toHaveBeenCalledWith({ login: 'viewer@cineweb.com', password: 'wrong-password' });
  });

  it('shows the friendly message of a failed login', async () => {
    const login = vi.fn().mockRejectedValue(new ApiError('Incorrect email, username or password.'));
    renderAuthPage(login);

    await fillAndSubmitLogin();

    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email, username or password.');
    expect(screen.getByRole('button', { name: 'Log In' })).toBeEnabled();
  });

  it('shows a generic message for unexpected errors', async () => {
    const login = vi.fn().mockRejectedValue(new Error('TypeError in some code'));
    renderAuthPage(login);

    await fillAndSubmitLogin();

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
  });

  it('switches to the sign up form', async () => {
    renderAuthPage(vi.fn());

    await userEvent.setup().click(screen.getByRole('button', { name: 'No account yet? Sign up' }));

    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('First name...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username...')).toBeInTheDocument();
  });
});
