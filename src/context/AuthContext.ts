import { createContext } from 'react';
import type {
  LoginRequest, ProfileUpdate, RegisterRequest, User,
} from '../types/index.ts';

export interface AuthContextValue {
  // null when nobody is logged in
  user: User | null;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => void;
  // saves the changed profile fields and updates the session with the new user
  updateProfile: (changes: ProfileUpdate) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
