import { lazy, Suspense } from 'react';
import { Factory, Package, RefreshCcw, ShoppingCart, TrendingUp, Users2 } from 'lucide-react';

import { ActivityFeed } from '@/components/Dashboard/ActivityFeed';
import { AlertsPanel } from '@/components/Dashboard/AlertsPanel';
import { ChartCard } from '@/components/Dashboard/ChartCard';
import { DashboardSkeleton } from '@/components/Dashboard/DashboardSkeleton';
import { StatCard } from '@/components/Dashboard/StatCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useI18n } from '@/i18n/LanguageProvider';
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

function ChartFallback() {
  return <div className="h-[250px] animate-pulse rounded-lg bg-secondary/60" />;
}

export default function DashboardPage() {
  const { loading, refreshing, error, refresh, viewModel } = useDashboardData();
  const { language, t } = useI18n();

  const locale =
    language === 'nl' ? 'nl-NL' : language === 'ar' ? 'ar' : language === 'ur' ? 'ur-PK' : 'en-US';

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (loading) {
    return (
      <PageShell
        title={t('dashboard.title', 'Operations Dashboard')}
        description={t(
          'dashboard.subtitle',
          'Live operations intelligence for production, sales, inventory, and workforce.'
        )}
      >
        <DashboardSkeleton />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={t('dashboard.title', 'Operations Dashboard')}
      description={t(
        'dashboard.subtitle',
        'Live operations intelligence for production, sales, inventory, and workforce.'
      )}
      actions={
        <>
          <Button type="button" variant="outline" onClick={refresh} disabled={refreshing}>
            <RefreshCcw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            {refreshing ? t('common.refreshing', 'Refreshing...') : t('common.refresh', 'Refresh')}
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
          title={t('dashboard.dailyProduction', 'Daily Production')}
          value={`${viewModel.kpis.dailyProductionUnits.toLocaleString()} units`}
          trend={formatTrend(viewModel.kpis.productionTrendPercent)}
          trendType={viewModel.kpis.productionTrendPercent >= 0 ? 'success' : 'warning'}
          icon={Factory}
          description={t('dashboard.trend7d', '7-day trend')}
        />
        <StatCard
          title={t('dashboard.inventoryHealth', 'Inventory Health')}
          value={`${viewModel.kpis.inventoryHealthPercent}%`}
          trend={`${viewModel.kpis.lowStockCount} low stock`}
          trendType={viewModel.kpis.lowStockCount > 0 ? 'warning' : 'success'}
          icon={Package}
          description={t('dashboard.availabilityIndex', 'availability index')}
        />
        <StatCard
          title={t('dashboard.salesOrders', 'Sales Orders')}
          value={viewModel.kpis.todaysSalesOrders.toLocaleString()}
          trend={formatTrend(viewModel.kpis.salesTrendPercent)}
          trendType={viewModel.kpis.salesTrendPercent >= 0 ? 'success' : 'warning'}
          icon={ShoppingCart}
          description={t('dashboard.vsPrevWeek', 'vs previous week')}
        />
        <StatCard
          title={t('dashboard.workforceAvailability', 'Workforce Availability')}
          value={`${viewModel.kpis.workforceActive}/${viewModel.kpis.workforceTotal}`}
          trend={`${viewModel.kpis.workforceTotal - viewModel.kpis.workforceActive} inactive`}
          trendType="secondary"
          icon={Users2}
          description={t('dashboard.activeEmployees', 'active employees')}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartCard
            title={t('dashboard.productionTrend', 'Production Trend')}
            description={t(
              'dashboard.productionTrendDesc',
              'Units produced over the last seven days'
            )}
          >
            <Suspense fallback={<ChartFallback />}>
              <ProductionTrendChart points={viewModel.productionTrend} />
            </Suspense>
          </ChartCard>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              {t('dashboard.financialSnapshot', 'Financial Snapshot')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">
                {t('dashboard.totalSales', 'Total Sales')}
              </span>
              <span className="text-sm font-semibold">
                {formatCurrency(viewModel.financialSummary.totalSales)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">
                {t('dashboard.totalPurchases', 'Total Purchases')}
              </span>
              <span className="text-sm font-semibold">
                {formatCurrency(viewModel.financialSummary.totalPurchases)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm text-muted-foreground">
                {t('dashboard.utilities', 'Utilities')}
              </span>
              <span className="text-sm font-semibold">
                {formatCurrency(viewModel.financialSummary.totalUtilities)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-secondary/60 p-3">
              <span className="text-sm font-medium">{t('dashboard.netProfit', 'Net Profit')}</span>
              <Badge variant={viewModel.financialSummary.netProfit >= 0 ? 'success' : 'warning'}>
                {formatCurrency(viewModel.financialSummary.netProfit)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard
          title={t('dashboard.salesOrders', 'Sales Orders')}
          description={t('dashboard.salesOrdersChartDesc', 'Order volume comparison by day')}
        >
          <Suspense fallback={<ChartFallback />}>
            <SalesOrdersBarChart points={viewModel.salesByDay} />
          </Suspense>
        </ChartCard>
        <ChartCard
          title={t('dashboard.inventoryMix', 'Inventory Mix')}
          description={t(
            'dashboard.inventoryMixDesc',
            'Current stock distribution by product code'
          )}
        >
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
