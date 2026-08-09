import type { TrafficSample } from '../model/types';
import { createSmoothChartPath } from '../../../shared/chartPaths';

type TrafficChartProps = {
  samples: TrafficSample[];
  max: number;
};

const width = 150;
const height = 50;
export function TrafficChart({ samples, max }: TrafficChartProps) {
  const incoming = createSmoothChartPath(samples, 'inc', max, { width, height });
  const outgoing = createSmoothChartPath(samples, 'out', max, { width, height });

  return (
    <svg
      className="networks-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Network traffic history"
    >
      <path className="networks-chart-area networks-chart-area--out" d={outgoing.area} />
      <path className="networks-chart-area networks-chart-area--inc" d={incoming.area} />
      <path className="networks-chart-line networks-chart-line--out" d={outgoing.line} />
      <path className="networks-chart-line networks-chart-line--inc" d={incoming.line} />
    </svg>
  );
}
