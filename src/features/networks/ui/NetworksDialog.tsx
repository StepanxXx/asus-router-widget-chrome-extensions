import { formatMegabitsPerSecond, formatMegabytes } from '../../../shared/formatTraffic';
import { networkTypes, type NetworkType } from '../model/networkConfig';
import type { NetworkTrafficState, TrafficVector } from '../model/types';
import { useNetworkTraffic } from '../hooks/useNetworkTraffic';
import { TrafficChart } from './TrafficChart';

function Direction({ vector }: { vector: TrafficVector }) {
  return (
    <span
      className={`networks-vector networks-vector--${vector}`}
      aria-label={vector === 'inc' ? 'incoming' : 'outgoing'}
    >
      {vector === 'inc' ? '▼' : '▲'}
    </span>
  );
}

function NetworkRows({ state }: { state: NetworkTrafficState }) {
  return (
    <tbody>
      <tr>
        <td className="networks-total-cell" colSpan={4}>
          Max per minute: {formatMegabitsPerSecond(state.max)}
        </td>
      </tr>
      {(Object.keys(networkTypes) as NetworkType[]).map((network) => {
        const traffic = state.interfaces[network];
        if (!traffic) return null;

        return (['inc', 'out'] as const).map((vector, index) => (
          <tr key={`${network}-${vector}`}>
            {index === 0 && (
              <th className="networks-title-cell" rowSpan={2} scope="rowgroup">
                {networkTypes[network]}
              </th>
            )}
            <td className="networks-metric-cell">
              {formatMegabytes(traffic.total[vector])} <Direction vector={vector} />
            </td>
            <td className="networks-metric-cell">
              {formatMegabitsPerSecond(traffic.speed[vector])} <Direction vector={vector} />
            </td>
            {index === 0 && (
              <td className="networks-diagram-cell" rowSpan={2}>
                <TrafficChart samples={traffic.speed.log} max={state.max} />
              </td>
            )}
          </tr>
        ));
      })}
    </tbody>
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
      {query.data && (
        <table className="networks-table">
          <NetworkRows state={query.data} />
        </table>
      )}
    </div>
  );
}
