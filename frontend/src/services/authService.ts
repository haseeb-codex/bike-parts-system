import api from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';
import type { AuthUser, LoginCredentials } from '@/types/auth';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface LoginData {
  user: AuthUser;
  token: string;
}

interface MeData {
  user: AuthUser;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

function getStorage(rememberMe: boolean): Storage {
  return rememberMe ? localStorage : sessionStorage;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUserRaw(): string | null {
  return localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
}

export function saveSession(user: AuthUser, token: string, rememberMe = true): void {
  clearSession();
  const storage = getStorage(rememberMe);
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export async function login(credentials: LoginCredentials): Promise<LoginData> {
  const response = await api.post<ApiResponse<LoginData>>(
    `${API_ENDPOINTS.AUTH}/login`,
    credentials
  );
  return response.data.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<ApiResponse<MeData>>(`${API_ENDPOINTS.AUTH}/me`);
  return response.data.data.user;
}
