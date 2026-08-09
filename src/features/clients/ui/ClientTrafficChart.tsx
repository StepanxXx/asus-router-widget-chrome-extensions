import type { ClientTrafficSample } from '../model/types';

type ClientTrafficChartProps = {
  samples: ClientTrafficSample[];
  max: number;
};

const width = 150;
const height = 50;
const maxPoints = 30;

function createPoints(
  samples: ClientTrafficSample[],
  vector: 'inc' | 'out',
  max: number,
): string {
  const scaleMax = max > 0 ? max : 1;

  return samples
    .map((sample, index) => {
      const x = index / (maxPoints - 1) * width;
      const value = Math.max(0, sample[vector]);
      const y = height - Math.min(height, value / scaleMax * height);
      return `${x},${y}`;
    })
    .join(' ');
}

export function ClientTrafficChart({ samples, max }: ClientTrafficChartProps) {
  return (
    <svg
      className="clients-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Client traffic history"
    >
      <polyline className="clients-chart-line clients-chart-line--out" points={createPoints(samples, 'out', max)} />
      <polyline className="clients-chart-line clients-chart-line--inc" points={createPoints(samples, 'inc', max)} />
    </svg>
  );
}
