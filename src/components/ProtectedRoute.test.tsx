import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.tsx';
import { AuthContext } from '../context/AuthContext.ts';
import type { User, UserRole } from '../types/index.ts';

function makeUser(role: UserRole): User {
  return {
    id: 1,
    username: role,
    firstName: 'Test',
    lastName: 'User',
    email: `${role}@cineweb.com`,
    phone: null,
    role,
  };
}

// Renders a viewer-only page at /upload, plus the pages the guard can redirect to
function renderAt(path: string, user: User | null) {
  const value = {
    user, login: vi.fn(), register: vi.fn(), logout: vi.fn(),
  };

  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<p>Home page</p>} />
          <Route path="/login" element={<p>Login page</p>} />
          <Route element={<ProtectedRoute allowedRoles={['viewer']} />}>
            <Route path="/upload" element={<p>Upload page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('sends guests to the login page', () => {
    renderAt('/upload', null);

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Upload page')).not.toBeInTheDocument();
  });

  it('sends users with another role to the home page', () => {
    renderAt('/upload', makeUser('administrator'));

    expect(screen.getByText('Home page')).toBeInTheDocument();
    expect(screen.queryByText('Upload page')).not.toBeInTheDocument();
  });

  it('shows the page to users with an allowed role', () => {
    renderAt('/upload', makeUser('viewer'));

    expect(screen.getByText('Upload page')).toBeInTheDocument();
  });
});
