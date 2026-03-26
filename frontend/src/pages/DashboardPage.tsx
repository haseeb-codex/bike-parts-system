import { lazy, Suspense } from 'react';
import { Factory, Package, RefreshCcw, ShoppingCart, TrendingUp, Users2 } from 'lucide-react';

import { ActivityFeed } from '@/components/Dashboard/ActivityFeed';
import { AlertsPanel } from '@/components/Dashboard/AlertsPanel';
import { ChartCard } from '@/components/Dashboard/ChartCard';
import { DashboardSkeleton } from '@/components/Dashboard/DashboardSkeleton';
import { StatCard } from '@/components/Dashboard/StatCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { PageShell } from '@/components/Layout/PageShell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProductionTrendChart = lazy(() =>
  import('@/components/Dashboard/charts/ProductionTrendChart').then((module) => ({
    default: module.ProductionTrendChart,
  }))
);

const SalesOrdersBarChart = lazy(() =>
  import('@/components/Dashboard/charts/SalesOrdersBarChart').then((module) => ({
    default: module.SalesOrdersBarChart,
  }))
);

const InventoryDistributionChart = lazy(() =>
  import('@/components/Dashboard/charts/InventoryDistributionChart').then((module) => ({
    default: module.InventoryDistributionChart,
  }))
);

function formatTrend(value: number): string {
  return `${value >= 0 ? '+' : ''}${value}%`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value);
}

function ChartFallback() {
  return <div className="h-[250px] animate-pulse rounded-lg bg-secondary/60" />;
}

export default function DashboardPage() {
  const { loading, refreshing, error, refresh, viewModel } = useDashboardData();

  if (loading) {
    return (
      <PageShell
        title="Operations Dashboard"
        description="Live operations intelligence for production, sales, inventory, and workforce."
      >
        <DashboardSkeleton />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Operations Dashboard"
      description="Live operations intelligence for production, sales, inventory, and workforce."
      actions={
        <>
          <Button type="button" variant="outline" onClick={refresh} disabled={refreshing}>
            <RefreshCcw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </>
      }
    >
      {error ? (
        <Card className="mb-4 border-red-300 bg-red-50/80 dark:border-red-700 dark:bg-red-950/20">
          <CardContent className="py-4 text-sm text-red-700 dark:text-red-300">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Daily Production"
          value={`${viewModel.kpis.dailyProductionUnits.toLocaleString()} units`}
          trend={formatTrend(viewModel.kpis.productionTrendPercent)}
          trendType={viewModel.kpis.productionTrendPercent >= 0 ? 'success' : 'warning'}
          icon={Factory}
          description="7-day trend"
        />
        <StatCard
          title="Inventory Health"
          value={`${viewModel.kpis.inventoryHealthPercent}%`}
          trend={`${viewModel.kpis.lowStockCount} low stock`}
          trendType={viewModel.kpis.lowStockCount > 0 ? 'warning' : 'success'}
          icon={Package}
          description="availability index"
        />
        <StatCard
          title="Sales Orders"
          value={viewModel.kpis.todaysSalesOrders.toLocaleString()}
          trend={formatTrend(viewModel.kpis.salesTrendPercent)}
          trendType={viewModel.kpis.salesTrendPercent >= 0 ? 'success' : 'warning'}
          icon={ShoppingCart}
          description="vs previous week"
        />
        <StatCard
          title="Workforce Availability"
          value={`${viewModel.kpis.workforceActive}/${viewModel.kpis.workforceTotal}`}
          trend={`${viewModel.kpis.workforceTotal - viewModel.kpis.workforceActive} inactive`}
          trendType="secondary"
          icon={Users2}
          description="active employees"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard title="Production Trend" description="Units produced over the last seven days">
            <Suspense fallback={<ChartFallback />}>
              <ProductionTrendChart points={viewModel.productionTrend} />
            </Suspense>
          </ChartCard>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Financial Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Total Sales</span>
              <span className="text-sm font-semibold">
                {formatCurrency(viewModel.financialSummary.totalSales)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Total Purchases</span>
              <span className="text-sm font-semibold">
                {formatCurrency(viewModel.financialSummary.totalPurchases)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">Utilities</span>
              <span className="text-sm font-semibold">
                {formatCurrency(viewModel.financialSummary.totalUtilities)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-secondary/60 p-3">
              <span className="text-sm font-medium">Net Profit</span>
              <Badge variant={viewModel.financialSummary.netProfit >= 0 ? 'success' : 'warning'}>
                {formatCurrency(viewModel.financialSummary.netProfit)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Sales Orders" description="Order volume comparison by day">
          <Suspense fallback={<ChartFallback />}>
            <SalesOrdersBarChart points={viewModel.salesByDay} />
          </Suspense>
        </ChartCard>
        <ChartCard title="Inventory Mix" description="Current stock distribution by product code">
          <Suspense fallback={<ChartFallback />}>
            <InventoryDistributionChart points={viewModel.inventoryDistribution} />
          </Suspense>
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <ActivityFeed items={viewModel.activity} />
        <AlertsPanel alerts={viewModel.alerts} />
      </div>
    </PageShell>
  );
}
