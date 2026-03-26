export type UserRole = 'admin' | 'manager' | 'operator';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions?: string[];
  isActive?: boolean;
  lastLoginAt?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthChecking: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
