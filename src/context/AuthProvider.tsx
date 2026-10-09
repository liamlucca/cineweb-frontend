import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, User } from '../types/index.ts';
import { authService } from '../services/authService.ts';
import {
  clearSession, getStoredSession, getToken, saveSession,
} from '../services/session.ts';
import { AuthContext } from './AuthContext.ts';
import type { AuthContextValue } from './AuthContext.ts';

interface AuthProviderProps {
  children: ReactNode;
}

// Keeps the logged-in user available to the whole app and persists it in localStorage
function AuthProvider({ children }: AuthProviderProps) {
  // read synchronously so protected routes don't redirect before the session is restored
  const [user, setUser] = useState<User | null>(() => getStoredSession()?.user ?? null);

  // the saved token may have expired or been revoked: ask the backend once when the app starts
  useEffect(() => {
    const token = getToken();
    if (!token) return undefined;

    let cancelled = false;
    authService.getCurrentUser()
      .then((current) => {
        // ignore the answer if the user logged in or out while it was on its way
        if (cancelled || getToken() !== token) return;
        if (current) {
          // also refreshes the saved data (the profile may have changed)
          saveSession({ token, user: current });
          setUser(current);
        } else {
          clearSession();
          setUser(null);
        }
      })
      .catch(() => {
        // server unreachable: keep the saved session instead of logging the user out
      });

    return () => { cancelled = true; };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const startSession = (session: AuthResponse) => {
      saveSession(session);
      setUser(session.user);
    };

    return {
      user,
      login: async (request) => startSession(await authService.login(request)),
      register: async (request) => startSession(await authService.register(request)),
      updateProfile: async (changes) => {
        const updated = await authService.updateProfile(changes);
        const token = getToken();
        if (token) saveSession({ token, user: updated });
        setUser(updated);
      },
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
