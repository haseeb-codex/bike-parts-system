import api from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';

export type EmployeeStatus = 'active' | 'inactive';
export type EmployeeRole = 'admin' | 'super_admin' | 'employee';

export interface EmployeeRecord {
  _id: string;
  employeeCode: string;
  name: string;
  role: EmployeeRole;
  phone: string;
  email: string;
  salary: number;
  joiningDate: string;
  status: EmployeeStatus;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFilters {
  role?: EmployeeRole;
  status?: EmployeeStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface EmployeeListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmployeeListResult {
  items: EmployeeRecord[];
  meta?: EmployeeListMeta;
}

export interface CreateEmployeePayload {
  employeeCode?: string;
  name: string;
  role?: EmployeeRole;
  phone: string;
  email: string;
  salary?: number;
  joiningDate: string;
  status?: EmployeeStatus;
  address?: string;
  notes?: string;
}

export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  meta?: EmployeeListMeta;
  message?: string;
}

interface ApiItemResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ApiMessageResponse {
  success: boolean;
  message?: string;
}

export async function listEmployees(filters: EmployeeFilters = {}): Promise<EmployeeListResult> {
  const response = await api.get<ApiListResponse<EmployeeRecord>>(API_ENDPOINTS.EMPLOYEES, {
    params: filters,
  });

  return {
    items: response.data.data,
    meta: response.data.meta,
  };
}

export async function getEmployeeById(id: string): Promise<EmployeeRecord> {
  const response = await api.get<ApiItemResponse<EmployeeRecord>>(
    `${API_ENDPOINTS.EMPLOYEES}/${id}`
  );
  return response.data.data;
}

export async function createEmployee(payload: CreateEmployeePayload): Promise<EmployeeRecord> {
  const response = await api.post<ApiItemResponse<EmployeeRecord>>(
    API_ENDPOINTS.EMPLOYEES,
    payload
  );
  return response.data.data;
}

export async function updateEmployee(
  id: string,
  payload: UpdateEmployeePayload
): Promise<EmployeeRecord> {
  const response = await api.put<ApiItemResponse<EmployeeRecord>>(
    `${API_ENDPOINTS.EMPLOYEES}/${id}`,
    payload
  );
  return response.data.data;
}

export async function deleteEmployee(id: string): Promise<string> {
  const response = await api.delete<ApiMessageResponse>(`${API_ENDPOINTS.EMPLOYEES}/${id}`);
  return response.data.message || 'Employee deleted successfully';
}
