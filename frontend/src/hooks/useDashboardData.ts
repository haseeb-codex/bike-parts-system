import { useCallback, useEffect, useMemo, useState } from 'react';

import { getDashboardPayload } from '@/services/dashboardService';
import type {
  DashboardPayload,
  FinancialSummary,
  InventoryItem,
  ProductionRecord,
  SalesTransaction,
} from '@/types/dashboard';

const REFRESH_INTERVAL_MS = 60_000;

interface Kpis {
  dailyProductionUnits: number;
  productionTrendPercent: number;
  inventoryHealthPercent: number;
  lowStockCount: number;
  todaysSalesOrders: number;
  salesTrendPercent: number;
  workforceActive: number;
  workforceTotal: number;
}

interface LinePoint {
  label: string;
  value: number;
}

interface BarPoint {
  label: string;
  value: number;
}

interface PiePoint {
  label: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  type: 'production' | 'sales';
  title: string;
  subtitle: string;
  amountLabel: string;
  timestamp: string;
}

export interface AlertItem {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

interface DashboardViewModel {
  kpis: Kpis;
  productionTrend: LinePoint[];
  salesByDay: BarPoint[];
  inventoryDistribution: PiePoint[];
  activity: ActivityItem[];
  alerts: AlertItem[];
  financialSummary: FinancialSummary;
}

const INITIAL_SUMMARY: FinancialSummary = {
  periodMonth: 0,
  periodYear: 0,
  totalSales: 0,
  totalPurchases: 0,
  totalUtilities: 0,
  grossProfit: 0,
  netProfit: 0,
};

const INITIAL_DATA: DashboardPayload = {
  production: [],
  sales: [],
  inventory: [],
  employees: [],
  financialSummary: INITIAL_SUMMARY,
};

function isSameUtcDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function buildTrailingDays(days: number): Date[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - 1 - index));
    return date;
  });
}

function sumByDay<T>(
  items: T[],
  datePicker: (item: T) => string,
  valuePicker: (item: T) => number,
  days: Date[]
): number[] {
  return days.map((day) => {
    let total = 0;
    items.forEach((item) => {
      const itemDate = new Date(datePicker(item));
      if (isSameUtcDay(itemDate, day)) {
        total += valuePicker(item);
      }
    });
    return total;
  });
}

function computeTrend(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function buildInventoryDistribution(inventory: InventoryItem[]): PiePoint[] {
  const topItems = [...inventory]
    .sort((a, b) => b.quantityAvailable - a.quantityAvailable)
    .slice(0, 5)
    .map((item) => ({ label: item.productCode, value: item.quantityAvailable }));

  const topTotal = topItems.reduce((sum, item) => sum + item.value, 0);
  const overall = inventory.reduce((sum, item) => sum + item.quantityAvailable, 0);

  if (overall - topTotal > 0) {
    topItems.push({ label: 'Other', value: overall - topTotal });
  }

  return topItems;
}

function buildActivity(production: ProductionRecord[], sales: SalesTransaction[]): ActivityItem[] {
  const productionItems: ActivityItem[] = production.slice(0, 5).map((record) => ({
    id: `prod-${record._id}`,
    type: 'production',
    title: `${record.productCode} batch ${record.productionNumber}`,
    subtitle: `${record.quantityProduced} units by ${record.operatorName}`,
    amountLabel: `${record.status}`,
    timestamp: record.productionDate,
  }));

  const salesItems: ActivityItem[] = sales.slice(0, 5).map((sale) => ({
    id: `sale-${sale._id}`,
    type: 'sales',
    title: `${sale.productCode} sale ${sale.transactionNumber}`,
    subtitle: `${sale.customerName} • ${sale.quantity} units`,
    amountLabel: `${sale.totalAmount.toFixed(0)} PKR`,
    timestamp: sale.saleDate,
  }));

  return [...productionItems, ...salesItems]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);
}

function buildAlerts(
  inventory: InventoryItem[],
  production: ProductionRecord[],
  sales: SalesTransaction[]
): AlertItem[] {
  const lowStock = inventory.filter((item) => item.quantityAvailable <= item.reorderLevel);
  const halted = production.filter((item) => item.status === 'halted');
  const cancelledSales = sales.filter((item) => item.status === 'cancelled');

  const alerts: AlertItem[] = [];

  if (lowStock.length > 0) {
    alerts.push({
      id: 'low-stock',
      severity: 'high',
      title: `${lowStock.length} low-stock item${lowStock.length > 1 ? 's' : ''}`,
      description: 'Reorder threshold reached. Review inventory priority list.',
    });
  }

  if (halted.length > 0) {
    alerts.push({
      id: 'halted-production',
      severity: 'medium',
      title: `${halted.length} halted production run${halted.length > 1 ? 's' : ''}`,
      description: 'Machine or material issue flagged in active records.',
    });
  }

  if (cancelledSales.length > 0) {
    alerts.push({
      id: 'cancelled-sales',
      severity: 'low',
      title: `${cancelledSales.length} cancelled order${cancelledSales.length > 1 ? 's' : ''}`,
      description: 'Review cancellation reasons to improve fulfillment quality.',
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'stable',
      severity: 'low',
      title: 'Operations stable',
      description: 'No critical alerts in current dashboard window.',
    });
  }

  return alerts;
}

function toViewModel(data: DashboardPayload): DashboardViewModel {
  const now = new Date();
  const todayProduction = data.production
    .filter((record) => isSameUtcDay(new Date(record.productionDate), now))
    .reduce((sum, record) => sum + record.quantityProduced, 0);

  const todaySalesOrders = data.sales.filter((sale) =>
    isSameUtcDay(new Date(sale.saleDate), now)
  ).length;

  const lowStockCount = data.inventory.filter(
    (item) => item.quantityAvailable <= item.reorderLevel
  ).length;

  const inventoryHealthPercent = data.inventory.length
    ? Number((((data.inventory.length - lowStockCount) / data.inventory.length) * 100).toFixed(1))
    : 100;

  const activeEmployees = data.employees.filter((employee) => employee.status === 'active').length;

  const trailing14 = buildTrailingDays(14);
  const productionByDay = sumByDay(
    data.production,
    (record) => record.productionDate,
    (record) => record.quantityProduced,
    trailing14
  );
  const salesOrdersByDay = sumByDay(
    data.sales,
    (sale) => sale.saleDate,
    () => 1,
    trailing14
  );

  const currentWeekProduction = productionByDay.slice(7).reduce((sum, value) => sum + value, 0);
  const previousWeekProduction = productionByDay.slice(0, 7).reduce((sum, value) => sum + value, 0);

  const currentWeekSalesOrders = salesOrdersByDay.slice(7).reduce((sum, value) => sum + value, 0);
  const previousWeekSalesOrders = salesOrdersByDay
    .slice(0, 7)
    .reduce((sum, value) => sum + value, 0);

  const trailing7 = trailing14.slice(7);

  const productionTrend = trailing7.map((day, index) => ({
    label: formatShortDate(day),
    value: productionByDay[index + 7],
  }));

  const salesByDay = trailing7.map((day, index) => ({
    label: formatShortDate(day),
    value: salesOrdersByDay[index + 7],
  }));

  return {
    kpis: {
      dailyProductionUnits: todayProduction,
      productionTrendPercent: computeTrend(currentWeekProduction, previousWeekProduction),
      inventoryHealthPercent,
      lowStockCount,
      todaysSalesOrders: todaySalesOrders,
      salesTrendPercent: computeTrend(currentWeekSalesOrders, previousWeekSalesOrders),
      workforceActive: activeEmployees,
      workforceTotal: data.employees.length,
    },
    productionTrend,
    salesByDay,
    inventoryDistribution: buildInventoryDistribution(data.inventory),
    activity: buildActivity(data.production, data.sales),
    alerts: buildAlerts(data.inventory, data.production, data.sales),
    financialSummary: data.financialSummary,
  };
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardPayload>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh: boolean) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);
      const payload = await getDashboardPayload();
      setData(payload);
    } catch {
      setError('Unable to load dashboard data right now. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData(false);

    const intervalId = window.setInterval(() => {
      void loadData(true);
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [loadData]);

  const viewModel = useMemo(() => toViewModel(data), [data]);

  const refresh = useCallback(() => {
    void loadData(true);
  }, [loadData]);

  return {
    loading,
    refreshing,
    error,
    refresh,
    viewModel,
  };
}
