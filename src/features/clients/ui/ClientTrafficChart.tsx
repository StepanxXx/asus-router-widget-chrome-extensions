import type { ClientTrafficSample } from '../model/types';
import { createSmoothChartPath } from '../../../shared/chartPaths';

type ClientTrafficChartProps = {
  samples: ClientTrafficSample[];
  max: number;
};

const width = 150;
const height = 50;
export function ClientTrafficChart({ samples, max }: ClientTrafficChartProps) {
  const incoming = createSmoothChartPath(samples, 'inc', max, { width, height });
  const outgoing = createSmoothChartPath(samples, 'out', max, { width, height });

  return (
    <svg
      className="clients-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Client traffic history"
    >
      <path className="clients-chart-area clients-chart-area--out" d={outgoing.area} />
      <path className="clients-chart-area clients-chart-area--inc" d={incoming.area} />
      <path className="clients-chart-line clients-chart-line--out" d={outgoing.line} />
      <path className="clients-chart-line clients-chart-line--inc" d={incoming.line} />
    </svg>
  );
}
