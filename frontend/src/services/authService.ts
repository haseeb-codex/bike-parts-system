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

export function saveSession(user: AuthUser, token: string): void {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
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
