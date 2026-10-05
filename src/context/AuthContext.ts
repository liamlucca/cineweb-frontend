import { createContext } from 'react';
import type { LoginRequest, RegisterRequest, User } from '../types/index.ts';

export interface AuthContextValue {
  // null when nobody is logged in
  user: User | null;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
