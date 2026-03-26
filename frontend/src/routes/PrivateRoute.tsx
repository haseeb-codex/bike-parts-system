import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

interface PrivateRouteProps {
  children?: ReactNode;
  redirectTo?: string;
}

export function PrivateRoute({ children, redirectTo = '/login' }: PrivateRouteProps) {
  const { isAuthenticated, isAuthChecking } = useAuth();
  const location = useLocation();

  if (isAuthChecking) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
