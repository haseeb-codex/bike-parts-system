export interface ProductionRecord {
  _id: string;
  productionNumber: string;
  productCode: string;
  machineCode: string;
  shift: 'morning' | 'evening' | 'night';
  quantityProduced: number;
  quantityRejected: number;
  productionDate: string;
  operatorName: string;
  status: 'planned' | 'in-progress' | 'completed' | 'halted';
}

export interface SalesTransaction {
  _id: string;
  transactionNumber: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerName: string;
  paymentMethod: 'cash' | 'bank' | 'credit';
  status: 'completed' | 'cancelled';
  saleDate: string;
}

export interface InventoryItem {
  _id: string;
  productCode: string;
  productName: string;
  quantityAvailable: number;
  reorderLevel: number;
  location: string;
  unit: string;
}

export interface Employee {
  _id: string;
  employeeCode: string;
  name: string;
  department: string;
  designation: string;
  salary: number;
  status: 'active' | 'inactive';
}

export interface FinancialSummary {
  periodMonth: number;
  periodYear: number;
  totalSales: number;
  totalPurchases: number;
  totalUtilities: number;
  grossProfit: number;
  netProfit: number;
}

export interface DashboardPayload {
  production: ProductionRecord[];
  sales: SalesTransaction[];
  inventory: InventoryItem[];
  employees: Employee[];
  financialSummary: FinancialSummary;
}
