import { Line } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import '@/lib/charts';

interface TrendLineChartProps {
  labels: string[];
  data: number[];
  label?: string;
}

/** Gráfico de línea con relleno degradado para tendencias temporales. */
export function TrendLineChart({ labels, data, label = 'Valores' }: TrendLineChartProps) {
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', maxTicksLimit: 8 } },
      y: { grid: { color: 'rgba(148,163,184,0.15)' }, ticks: { color: '#94a3b8' }, beginAtZero: true },
    },
    elements: { line: { tension: 0.4 } },
  };

  return (
    <div className="h-64">
      <Line
        options={options}
        data={{
          labels,
          datasets: [
            {
              label,
              data,
              borderColor: '#3563ff',
              backgroundColor: 'rgba(53,99,255,0.12)',
              fill: true,
              pointRadius: 0,
              pointHoverRadius: 4,
              borderWidth: 2,
            },
          ],
        }}
      />
    </div>
  );
}
