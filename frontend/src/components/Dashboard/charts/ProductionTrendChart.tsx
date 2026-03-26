import { memo, useMemo } from 'react';
import { Line } from 'react-chartjs-2';

import type { DashboardPoint } from '@/components/Dashboard/charts/types';
import '@/components/Dashboard/charts/chartSetup';

interface ProductionTrendChartProps {
  points: DashboardPoint[];
}

function ProductionTrendChartComponent({ points }: ProductionTrendChartProps) {
  const data = useMemo(
    () => ({
      labels: points.map((point) => point.label),
      datasets: [
        {
          label: 'Units Produced',
          data: points.map((point) => point.value),
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.18)',
          fill: true,
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    }),
    [points]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.2)' },
          ticks: { precision: 0 },
        },
        x: {
          grid: { display: false },
        },
      },
    }),
    []
  );

  return <Line data={data} options={options} />;
}

export const ProductionTrendChart = memo(ProductionTrendChartComponent);
