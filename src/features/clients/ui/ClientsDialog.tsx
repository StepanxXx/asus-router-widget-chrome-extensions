import type { VNode } from 'preact';
import { useState } from 'preact/hooks';
import { useClientsTraffic } from '../hooks/useClientsTraffic';
import { getRssiLabel } from '../model/signalStrength';
import type { ClientTrafficState, ClientView } from '../model/types';
import { formatMegabitsPerSecond, formatMegabytes } from '../../../shared/formatTraffic';
import { TrafficChart } from '../../../shared/TrafficChart';
import { SignalStrengthIcon } from './SignalStrengthIcon';

const detailRows = [
  'mac',
  'nickName',
  'ip',
  'internetMode',
  'from',
  'vendor',
  'isGN',
  'wlConnectTime',
  'ipMethod',
] as const;

const connectionNames: Record<string, string> = {
  '0': 'Ethernet',
  '1': '2.4 GHz',
  '2': '5 GHz',
  '3': '5 GHz - 2',
  '4': '6 GHz',
};

type ClientFilter = 'all' | 'online' | 'offline';

const clientFilters: Array<{ value: ClientFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
];

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function TrafficDirection({ direction }: { direction: 'download' | 'upload' }) {
  const isDownload = direction === 'download';

  return (
    <span
      className={`clients-traffic-direction clients-traffic-direction--${direction}`}
      aria-label={direction}
      title={direction}
    >
      {isDownload ? '▼' : '▲'}
    </span>
  );
}

function LoginStatus({ loggedIn }: { loggedIn: boolean }) {
  return (
    <span
      className={`clients-login-status ${loggedIn ? 'is-logged-in' : 'is-logged-out'}`}
      aria-label={loggedIn ? 'Logged in' : 'Not logged in'}
      title={loggedIn ? 'Logged in' : 'Not logged in'}
    >
      <span className="clients-login-status-icon" aria-hidden="true">
        {loggedIn ? '✓' : '—'}
      </span>
      {loggedIn ? 'Yes' : 'No'}
    </span>
  );
}

function LinkRate({ direction, value }: { direction: 'rx' | 'tx'; value: unknown }) {
  const isRx = direction === 'rx';
  const label = isRx ? 'Current receive rate' : 'Current transmit rate';

  return (
    <span
      className={`clients-link-rate clients-link-rate--${direction}`}
      aria-label={label}
      title={label}
    >
      <span className="clients-link-rate-icon" aria-hidden="true">
        {isRx ? '▼' : '▲'}
      </span>
      <strong>{direction.toUpperCase()}</strong>
      <span>{displayValue(value)}</span>
    </span>
  );
}

function ClientHeader({ client }: { client: ClientView }) {
  const online = client.isOnline === '1';
  const connection = connectionNames[client.isWL ?? ''] ?? 'Unknown';
  const name = displayValue(client.name || client.nickName || client.mac);

  return (
    <div className={`clients-card ${online ? 'is-online' : 'is-offline'}`}>
      <strong className="clients-card-name" title={name}>
        {name}
      </strong>
      <span>{connection}</span>
      {client.isWL !== '0' && online ? (
        <span className="clients-signal" title={getRssiLabel(client.rssi)}>
          <SignalStrengthIcon value={client.rssi} />
          RSSI {displayValue(client.rssi)}
        </span>
      ) : (
        <span className="clients-signal">&nbsp;</span>
      )}
      <span className="clients-online-state">{online ? '● Online' : '○ Offline'}</span>
      {client.internetState === 0 && <span className="clients-blocked">Internet blocked</span>}
    </div>
  );
}

function sortClients(state: ClientTrafficState, filter: ClientFilter): Array<[string, ClientView]> {
  return Object.entries(state.clients)
    .filter(([, client]) => {
      if (filter === 'all') return true;
      return filter === 'online' ? client.isOnline === '1' : client.isOnline !== '1';
    })
    .sort(([, first], [, second]) => {
      const loginDifference = Number(second.isLogin ?? 0) - Number(first.isLogin ?? 0);
      if (loginDifference !== 0) return loginDifference;
      const onlineDifference = Number(second.isOnline ?? 0) - Number(first.isOnline ?? 0);
      if (onlineDifference !== 0) return onlineDifference;
      return Number(second.isWL ?? 0) - Number(first.isWL ?? 0);
    });
}

function ClientsTable({ state, filter }: { state: ClientTrafficState; filter: ClientFilter }) {
  const clients = sortClients(state, filter);

  if (clients.length === 0) {
    return <p className="clients-status">No {filter} clients found.</p>;
  }

  return (
    <table className="clients-table">
      <tbody>
        <tr>
          <th className="clients-title-cell" scope="row">
            Client
          </th>
          {clients.map(([id, client]) => (
            <td key={id}>
              <ClientHeader client={client} />
            </td>
          ))}
        </tr>
        <tr>
          <th className="clients-title-cell" scope="row">
            Traffic peak
            <br />
            {formatMegabitsPerSecond(state.max)}
          </th>
          {clients.map(([id, client]) => (
            <td key={id}>
              <TrafficChart
                samples={client.log}
                max={state.max}
                className="clients-chart"
                label="Client traffic history"
              />
            </td>
          ))}
        </tr>
        <tr>
          <th className="clients-title-cell" scope="row">
            Speed ↓
          </th>
          {clients.map(([id, client]) => (
            <td key={id}>
              {formatMegabitsPerSecond(client.speedInc)} <TrafficDirection direction="download" />
            </td>
          ))}
        </tr>
        <tr>
          <th className="clients-title-cell" scope="row">
            Speed ↑
          </th>
          {clients.map(([id, client]) => (
            <td key={id}>
              {formatMegabitsPerSecond(client.speedOut)} <TrafficDirection direction="upload" />
            </td>
          ))}
        </tr>
        <tr>
          <th className="clients-title-cell" scope="row">
            Total ↓
          </th>
          {clients.map(([id, client]) => (
            <td key={id}>
              {formatMegabytes(client.inc)} <TrafficDirection direction="download" />
            </td>
          ))}
        </tr>
        <tr>
          <th className="clients-title-cell" scope="row">
            Total ↑
          </th>
          {clients.map(([id, client]) => (
            <td key={id}>
              {formatMegabytes(client.out)} <TrafficDirection direction="upload" />
            </td>
          ))}
        </tr>
        <tr>
          <th className="clients-title-cell" scope="row">
            Logged in
          </th>
          {clients.map(([id, client]) => (
            <td key={id}>
              <LoginStatus loggedIn={client.isLogin === '1'} />
            </td>
          ))}
        </tr>
        <tr>
          <th className="clients-title-cell" scope="row">
            curRx
          </th>
          {clients.map(([id, client]) => (
            <td key={id}>
              <LinkRate direction="rx" value={client.curRx} />
            </td>
          ))}
        </tr>
        <tr>
          <th className="clients-title-cell" scope="row">
            curTx
          </th>
          {clients.map(([id, client]) => (
            <td key={id}>
              <LinkRate direction="tx" value={client.curTx} />
            </td>
          ))}
        </tr>
        {detailRows.map((field) => (
          <tr key={field}>
            <th className="clients-title-cell" scope="row">
              {field}
            </th>
            {clients.map(([id, client]) => (
              <td key={id} title={displayValue(client[field])}>
                {displayValue(client[field])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type ClientsViewProps = {
  onClose: () => void;
  onCloseIcon: () => VNode;
  title: string;
};

export function ClientsView({ onClose, onCloseIcon, title }: ClientsViewProps) {
  const query = useClientsTraffic();
  const [filter, setFilter] = useState<ClientFilter>('online');

  return (
    <>
      <header className="dialog-header">
        <button className="dialog-close" type="button" aria-label="Back to home" onClick={onClose}>
          {onCloseIcon()}
        </button>
        <div className="dialog-title">
          <span>Live router insights</span>
          <h2>{title}</h2>
        </div>
        <div className="clients-filters" role="group" aria-label="Filter clients">
          {clientFilters.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`clients-filter ${filter === option.value ? 'is-active' : ''}`}
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="dialog-live-status">
          <span aria-hidden="true" /> Live
        </span>
      </header>
      <div className="clients-content">
        {query.isPending && <p className="clients-status">Loading clients…</p>}
        {query.isError && (
          <p className="clients-status clients-status--error">{query.error.message}</p>
        )}
        {query.data && Object.keys(query.data.clients).length === 0 && (
          <p className="clients-status">No clients found.</p>
        )}
        {query.data && Object.keys(query.data.clients).length > 0 && (
          <ClientsTable state={query.data} filter={filter} />
        )}
      </div>
    </>
  );
}
