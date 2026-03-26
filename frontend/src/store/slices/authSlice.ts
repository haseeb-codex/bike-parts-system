import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { clearSession, getStoredToken, getStoredUserRaw } from '@/services/authService';
import type { AuthState, AuthUser } from '@/types/auth';

interface AuthPayload {
  user: AuthUser;
  token: string;
}

function getInitialAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isAuthChecking: false,
    };
  }

  const token = getStoredToken();
  const userRaw = getStoredUserRaw();

  if (!token || !userRaw) {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isAuthChecking: false,
    };
  }

  try {
    const user = JSON.parse(userRaw) as AuthUser;

    return {
      user,
      token,
      isAuthenticated: true,
      isAuthChecking: true,
    };
  } catch {
    clearSession();

    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isAuthChecking: false,
    };
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialAuthState(),
  reducers: {
    startAuthCheck: (state) => {
      state.isAuthChecking = true;
    },
    finishAuthCheck: (state) => {
      state.isAuthChecking = false;
    },
    setCredentials: (state, action: PayloadAction<AuthPayload>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isAuthChecking = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAuthChecking = false;
    },
  },
});

export const { startAuthCheck, finishAuthCheck, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
