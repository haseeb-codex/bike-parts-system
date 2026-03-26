import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

interface PublicRouteProps {
  children: ReactNode;
  restricted?: boolean;
  redirectTo?: string;
}

export function PublicRoute({ children, restricted = false, redirectTo = '/' }: PublicRouteProps) {
  const { isAuthenticated, isAuthChecking } = useAuth();
  const location = useLocation();

  if (isAuthChecking) {
    return null;
  }

  if (restricted && isAuthenticated) {
    const destination = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
    return <Navigate to={destination || redirectTo} replace />;
  }

  return <>{children}</>;
}
