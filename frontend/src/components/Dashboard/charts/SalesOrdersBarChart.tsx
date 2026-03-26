import { memo, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

import type { DashboardPoint } from '@/components/Dashboard/charts/types';
import '@/components/Dashboard/charts/chartSetup';

interface SalesOrdersBarChartProps {
  points: DashboardPoint[];
}

function SalesOrdersBarChartComponent({ points }: SalesOrdersBarChartProps) {
  const data = useMemo(
    () => ({
      labels: points.map((point) => point.label),
      datasets: [
        {
          label: 'Orders',
          data: points.map((point) => point.value),
          backgroundColor: 'rgba(16, 185, 129, 0.75)',
          borderRadius: 6,
          maxBarThickness: 28,
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

  return <Bar data={data} options={options} />;
}

export const SalesOrdersBarChart = memo(SalesOrdersBarChartComponent);
