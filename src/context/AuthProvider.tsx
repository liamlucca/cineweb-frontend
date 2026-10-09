import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, User } from '../types/index.ts';
import { authService } from '../services/authService.ts';
import { clearSession, getStoredSession, saveSession } from '../services/session.ts';
import { AuthContext } from './AuthContext.ts';
import type { AuthContextValue } from './AuthContext.ts';

interface AuthProviderProps {
  children: ReactNode;
}

// Keeps the logged-in user available to the whole app and persists it in localStorage
function AuthProvider({ children }: AuthProviderProps) {
  // read synchronously so protected routes don't redirect before the session is restored
  const [user, setUser] = useState<User | null>(() => getStoredSession()?.user ?? null);

  const value = useMemo<AuthContextValue>(() => {
    const startSession = (session: AuthResponse) => {
      saveSession(session);
      setUser(session.user);
    };

    return {
      user,
      login: async (request) => startSession(await authService.login(request)),
      register: async (request) => startSession(await authService.register(request)),
      logout: () => {
        // tell the backend first (it needs the saved token), but don't wait for its answer
        authService.logout();
        clearSession();
        setUser(null);
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
