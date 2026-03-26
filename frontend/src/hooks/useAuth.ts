import { useEffect, useRef } from 'react';

import * as authService from '@/services/authService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { finishAuthCheck, logout, setCredentials, startAuthCheck } from '@/store/slices/authSlice';
import type { LoginCredentials, UserRole } from '@/types/auth';

let validatedToken: string | null = null;
let validatingToken: string | null = null;

export function useAuth() {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (hasBootstrapped.current) {
      return;
    }

    hasBootstrapped.current = true;

    const runAuthBootstrap = async () => {
      if (!authState.token) {
        validatedToken = null;
        validatingToken = null;
        dispatch(finishAuthCheck());
        return;
      }

      if (validatedToken === authState.token || validatingToken === authState.token) {
        dispatch(finishAuthCheck());
        return;
      }

      validatingToken = authState.token;

      dispatch(startAuthCheck());

      try {
        const user = await authService.getCurrentUser();
        dispatch(
          setCredentials({
            user,
            token: authState.token,
          })
        );
        validatedToken = authState.token;
      } catch {
        authService.clearSession();
        validatedToken = null;
        dispatch(logout());
      } finally {
        validatingToken = null;
        dispatch(finishAuthCheck());
      }
    };

    runAuthBootstrap();
  }, [authState.token, dispatch]);

  const login = async (credentials: LoginCredentials, rememberMe = true): Promise<void> => {
    const session = await authService.login(credentials);
    authService.saveSession(session.user, session.token, rememberMe);
    dispatch(setCredentials(session));
  };

  const signOut = (): void => {
    authService.clearSession();
    dispatch(logout());
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!authState.user) {
      return false;
    }

    return allowedRoles.includes(authState.user.role);
  };

  const hasPermissions = (requiredPermissions: string[]): boolean => {
    if (!requiredPermissions.length) {
      return true;
    }

    const userPermissions = authState.user?.permissions ?? [];
    return requiredPermissions.every((permission) => userPermissions.includes(permission));
  };

  return {
    ...authState,
    login,
    logout: signOut,
    hasRole,
    hasPermissions,
  };
}
