import { createSmoothChartPath, type ChartPoint } from './chartPaths';

type TrafficChartProps = {
  samples: ChartPoint[];
  max: number;
  className: string;
  label: string;
};

const width = 150;
const height = 50;

export function TrafficChart({ samples, max, className, label }: TrafficChartProps) {
  const incoming = createSmoothChartPath(samples, 'inc', max, { width, height });
  const outgoing = createSmoothChartPath(samples, 'out', max, { width, height });

  return (
    <svg
      className={`traffic-chart ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
    >
      <path className="traffic-chart-area traffic-chart-area--out" d={outgoing.area} />
      <path className="traffic-chart-area traffic-chart-area--inc" d={incoming.area} />
      <path className="traffic-chart-line traffic-chart-line--out" d={outgoing.line} />
      <path className="traffic-chart-line traffic-chart-line--inc" d={incoming.line} />
    </svg>
  );
}
