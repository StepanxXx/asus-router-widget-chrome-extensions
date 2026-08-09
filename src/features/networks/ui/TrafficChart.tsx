import type { TrafficSample } from '../model/types';

type TrafficChartProps = {
  samples: TrafficSample[];
  max: number;
};

const width = 150;
const height = 50;
const maxPoints = 30;

function createPoints(samples: TrafficSample[], vector: 'inc' | 'out', max: number): string {
  const scaleMax = max > 0 ? max : 1;
  const denominator = Math.max(maxPoints - 1, 1);

  return samples
    .map((sample, index) => {
      const x = (index / denominator) * width;
      const value = Math.max(0, sample[vector]);
      const y = height - Math.min(height, (value / scaleMax) * height);
      return `${x},${y}`;
    })
    .join(' ');
}

export function TrafficChart({ samples, max }: TrafficChartProps) {
  return (
    <svg
      className="networks-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Network traffic history"
    >
      <polyline className="networks-chart-line networks-chart-line--out" points={createPoints(samples, 'out', max)} />
      <polyline className="networks-chart-line networks-chart-line--inc" points={createPoints(samples, 'inc', max)} />
    </svg>
  );
}
