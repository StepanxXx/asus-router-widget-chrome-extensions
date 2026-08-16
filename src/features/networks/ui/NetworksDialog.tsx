import { formatMegabitsPerSecond, formatMegabytes } from '../../../shared/formatTraffic';
import { TrafficChart } from '../../../shared/TrafficChart';
import { useNetworkTraffic } from '../hooks/useNetworkTraffic';
import { networkTypes, type NetworkType } from '../model/networkConfig';
import type { NetworkTraffic, NetworkTrafficState, TrafficVector } from '../model/types';

const trafficMetrics: Array<{ vector: TrafficVector; label: string; symbol: string }> = [
  { vector: 'inc', label: 'Download', symbol: '▼' },
  { vector: 'out', label: 'Upload', symbol: '▲' },
];

function TrafficMetric({
  traffic,
  vector,
  label,
  symbol,
}: (typeof trafficMetrics)[number] & {
  traffic: NetworkTraffic;
}) {
  return (
    <div className={`networks-metric networks-metric--${vector}`}>
      <div className="networks-metric-heading">
        <span className="networks-vector" aria-hidden="true">
          {symbol}
        </span>
        <span>{label}</span>
      </div>
      <strong className="networks-speed">
        {formatMegabitsPerSecond(traffic.speed[vector] ?? 0)}
      </strong>
      <span className="networks-total" title="Total data transferred">
        {formatMegabytes(traffic.total[vector])} total
      </span>
    </div>
  );
}

function NetworkCard({
  name,
  traffic,
  max,
}: {
  name: string;
  traffic: NetworkTraffic;
  max: number;
}) {
  return (
    <article className="networks-card">
      <header className="networks-card-header">
        <div>
          <span className="networks-card-eyebrow">Network interface</span>
          <h3>{name}</h3>
        </div>
        <span className="networks-active-status">
          <span aria-hidden="true">●</span> Active
        </span>
      </header>
      <div className="networks-metrics">
        {trafficMetrics.map((metric) => (
          <TrafficMetric key={metric.vector} traffic={traffic} {...metric} />
        ))}
      </div>
      <div className="networks-chart-panel">
        <div className="networks-chart-header">
          <span>Traffic history</span>
          <span className="networks-chart-legend">
            <span className="is-download">Download</span>
            <span className="is-upload">Upload</span>
          </span>
        </div>
        <TrafficChart
          samples={traffic.speed.log}
          max={max}
          className="networks-chart"
          label={`${name} traffic history`}
        />
      </div>
    </article>
  );
}

function NetworkCards({ state }: { state: NetworkTrafficState }) {
  const networks = (Object.keys(networkTypes) as NetworkType[]).flatMap((network) => {
    const traffic = state.interfaces[network];
    return traffic ? [{ network, traffic }] : [];
  });

  if (networks.length === 0) return <p className="networks-status">No network data found.</p>;

  return (
    <>
      <div className="networks-summary">
        <span className="networks-summary-label">Traffic peak</span>
        <strong>{formatMegabitsPerSecond(state.max)}</strong>
        <span className="networks-summary-caption">Maximum across all interfaces</span>
      </div>
      <div className="networks-grid">
        {networks.map(({ network, traffic }) => (
          <NetworkCard
            key={network}
            name={networkTypes[network]}
            traffic={traffic}
            max={state.max}
          />
        ))}
      </div>
    </>
  );
}

export function NetworksView() {
  const query = useNetworkTraffic();

  return (
    <div className="networks-content">
      {query.isPending && <p className="networks-status">Loading…</p>}
      {query.isError && (
        <p className="networks-status networks-status--error">{query.error.message}</p>
      )}
      {query.data && <NetworkCards state={query.data} />}
    </div>
  );
}
