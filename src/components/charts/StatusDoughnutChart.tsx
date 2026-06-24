import { Doughnut } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import '@/lib/charts';

interface StatusDoughnutChartProps {
  /** Pares etiqueta/valor con su color. */
  segments: { label: string; value: number; color: string }[];
}

/** Gráfico de dona para distribución por estado. */
export function StatusDoughnutChart({ segments }: StatusDoughnutChartProps) {
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#94a3b8', usePointStyle: true, padding: 16 },
      },
    },
  };

  return (
    <div className="h-64">
      <Doughnut
        options={options}
        data={{
          labels: segments.map((s) => s.label),
          datasets: [
            {
              data: segments.map((s) => s.value),
              backgroundColor: segments.map((s) => s.color),
              borderWidth: 0,
              hoverOffset: 6,
            },
          ],
        }}
      />
    </div>
  );
}
