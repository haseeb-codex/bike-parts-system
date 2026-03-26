import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children?: ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  loginRedirectTo?: string;
  unauthorizedRedirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  loginRedirectTo = '/login',
  unauthorizedRedirectTo = '/unauthorized',
}: ProtectedRouteProps) {
  const { isAuthenticated, isAuthChecking, hasPermissions, hasRole } = useAuth();
  const location = useLocation();

  if (isAuthChecking) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={loginRedirectTo} replace state={{ from: location }} />;
  }

  const roleAllowed = requiredRoles.length === 0 || hasRole(requiredRoles);
  const permissionAllowed = hasPermissions(requiredPermissions);

  if (!roleAllowed || !permissionAllowed) {
    return <Navigate to={unauthorizedRedirectTo} replace state={{ from: location }} />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
