import { memo, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';

import type { DashboardPoint } from '@/components/Dashboard/charts/types';
import '@/components/Dashboard/charts/chartSetup';

interface InventoryDistributionChartProps {
  points: DashboardPoint[];
}

const PIE_COLORS = ['#14b8a6', '#0ea5e9', '#6366f1', '#f59e0b', '#ef4444', '#64748b'];

function InventoryDistributionChartComponent({ points }: InventoryDistributionChartProps) {
  const data = useMemo(
    () => ({
      labels: points.map((point) => point.label),
      datasets: [
        {
          label: 'Stock Units',
          data: points.map((point) => point.value),
          backgroundColor: points.map((_, index) => PIE_COLORS[index % PIE_COLORS.length]),
          borderColor: 'rgba(15, 23, 42, 0.08)',
          borderWidth: 1,
        },
      ],
    }),
    [points]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            boxWidth: 10,
            usePointStyle: true,
          },
        },
      },
    }),
    []
  );

  return <Doughnut data={data} options={options} />;
}

export const InventoryDistributionChart = memo(InventoryDistributionChartComponent);
