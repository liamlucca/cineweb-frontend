import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { UserRole } from '../types/index.ts';
import useAuth from '../hooks/useAuth.ts';

interface ProtectedRouteProps {
  // if omitted, any logged-in user can enter
  allowedRoles?: UserRole[];
}

// Wraps a group of routes: guests go to /login, users with the wrong role go home
function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // remember where the user wanted to go, to send them back after logging in
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
