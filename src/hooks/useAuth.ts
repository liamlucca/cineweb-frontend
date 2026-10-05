import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.ts';
import type { AuthContextValue } from '../context/AuthContext.ts';

function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

export default useAuth;
