import api from '@/services/api';
import { API_ENDPOINTS } from '@/utils/constants';
import type {
  DashboardPayload,
  Employee,
  FinancialSummary,
  InventoryItem,
  ProductionRecord,
  SalesTransaction,
} from '@/types/dashboard';

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
}

interface ApiItemResponse<T> {
  success: boolean;
  data: T;
}

export async function getDashboardPayload(): Promise<DashboardPayload> {
  const [productionRes, salesRes, inventoryRes, employeesRes, financialRes] = await Promise.all([
    api.get<ApiListResponse<ProductionRecord>>(
      `${API_ENDPOINTS.PRODUCTION}?limit=200&sortBy=productionDate&order=desc`
    ),
    api.get<ApiListResponse<SalesTransaction>>(
      `${API_ENDPOINTS.SALES}?limit=200&sortBy=saleDate&order=desc`
    ),
    api.get<ApiListResponse<InventoryItem>>(
      `${API_ENDPOINTS.INVENTORY}?limit=200&sortBy=updatedAt&order=desc`
    ),
    api.get<ApiListResponse<Employee>>(
      `${API_ENDPOINTS.EMPLOYEES}?limit=200&sortBy=createdAt&order=desc`
    ),
    api.get<ApiItemResponse<FinancialSummary>>(`${API_ENDPOINTS.FINANCIAL}/summary`),
  ]);

  return {
    production: productionRes.data.data,
    sales: salesRes.data.data,
    inventory: inventoryRes.data.data,
    employees: employeesRes.data.data,
    financialSummary: financialRes.data.data,
  };
}
