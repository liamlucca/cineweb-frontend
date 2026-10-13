import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MainNavbar from './MainNavbar.tsx';
import type { User } from '../types/index.ts';

const VIEWER: User = {
  id: 2, username: 'maria', firstName: 'Maria', lastName: 'P', email: 'm@cineweb.com', phone: null, role: 'viewer',
};
const ADMIN: User = { ...VIEWER, id: 1, username: 'admin', role: 'administrator' };

function renderNavbar(user: User | null, onLogout = vi.fn()) {
  render(
    <MemoryRouter>
      <MainNavbar user={user} onLogout={onLogout} />
    </MemoryRouter>,
  );
  return onLogout;
}

// the links of the large-screen bar (the hamburger menu repeats them for phones)
function mainLinks() {
  return within(screen.getByRole('navigation', { name: 'Main' }));
}

describe('MainNavbar', () => {
  it('shows guests the public links and "Log In"', () => {
    renderNavbar(null);

    expect(mainLinks().getByRole('link', { name: 'Search' })).toBeInTheDocument();
    expect(mainLinks().queryByRole('link', { name: 'My Videos' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute('href', '/login');
  });

  it('shows viewers their pages and the upload menu', () => {
    renderNavbar(VIEWER);

    expect(mainLinks().getByRole('link', { name: 'My Videos' })).toBeInTheDocument();
    expect(mainLinks().getByRole('link', { name: 'Watch later' })).toBeInTheDocument();
    expect(mainLinks().getByText('Upload')).toBeInTheDocument();
    expect(mainLinks().queryByRole('link', { name: 'Administration' })).not.toBeInTheDocument();
  });

  it('shows administrators the administration link instead', () => {
    renderNavbar(ADMIN);

    expect(mainLinks().getByRole('link', { name: 'Administration' })).toBeInTheDocument();
    expect(mainLinks().queryByRole('link', { name: 'My Videos' })).not.toBeInTheDocument();
  });

  it('tells the app to log out', async () => {
    const onLogout = renderNavbar(VIEWER);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Log Out' }));

    expect(onLogout).toHaveBeenCalled();
  });
});
