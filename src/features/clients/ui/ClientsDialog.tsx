import { useEffect, useRef } from 'react';
import { useClientsTraffic } from '../hooks/useClientsTraffic';
import type { ClientTrafficState, ClientView } from '../model/types';
import { ClientTrafficChart } from './ClientTrafficChart';

type ClientsDialogProps = {
  onClose: () => void;
};

const detailRows = [
  'mac',
  'nickName',
  'ip',
  'internetMode',
  'curTx',
  'curRx',
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

function formatMegabitsPerSecond(value = 0): string {
  return `${Math.max(0, value / 1024 / 1024 * 8).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} Mbps`;
}

function formatMegabytes(value = 0): string {
  return `${Math.max(0, value / 1024 / 1024).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })} MB`;
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function getRssiLabel(value: unknown): string {
  const rssi = Number.parseInt(String(value), 10);
  if (!Number.isFinite(rssi)) return 'Unknown signal';
  if (rssi >= -50) return 'Very strong';
  if (rssi >= -67) return 'Strong';
  if (rssi >= -80) return 'Fair';
  return 'Weak';
}

function ClientHeader({ client }: { client: ClientView }) {
  const online = client.isOnline === '1';
  const connection = connectionNames[client.isWL ?? ''] ?? 'Unknown';
  const name = displayValue(client.name || client.nickName || client.mac);

  return (
    <div className={`clients-card ${online ? 'is-online' : 'is-offline'}`}>
      <strong className="clients-card-name" title={name}>{name}</strong>
      <span>{connection}</span>
      {client.isWL !== '0' && online && (
        <span title={getRssiLabel(client.rssi)}>RSSI {displayValue(client.rssi)}</span>
      )}
      <span className="clients-online-state">{online ? '● Online' : '○ Offline'}</span>
      {client.internetState === 0 && <span className="clients-blocked">Internet blocked</span>}
    </div>
  );
}

function sortClients(state: ClientTrafficState): Array<[string, ClientView]> {
  return Object.entries(state.clients).sort(([, first], [, second]) => {
    const loginDifference = Number(second.isLogin ?? 0) - Number(first.isLogin ?? 0);
    if (loginDifference !== 0) return loginDifference;
    const onlineDifference = Number(second.isOnline ?? 0) - Number(first.isOnline ?? 0);
    if (onlineDifference !== 0) return onlineDifference;
    return Number(second.isWL ?? 0) - Number(first.isWL ?? 0);
  });
}

function ClientsTable({ state }: { state: ClientTrafficState }) {
  const clients = sortClients(state);

  return (
    <table className="clients-table">
      <tbody>
        <tr>
          <th className="clients-title-cell" scope="row">Client</th>
          {clients.map(([id, client]) => <td key={id}><ClientHeader client={client} /></td>)}
        </tr>
        <tr>
          <th className="clients-title-cell" scope="row">
            Traffic peak<br />{formatMegabitsPerSecond(state.max)}
          </th>
          {clients.map(([id, client]) => (
            <td key={id}><ClientTrafficChart samples={client.log} max={state.max} /></td>
          ))}
        </tr>
        <tr>
          <th className="clients-title-cell" scope="row">Speed ↓</th>
          {clients.map(([id, client]) => <td key={id}>{formatMegabitsPerSecond(client.speedInc)}</td>)}
        </tr>
        <tr>
          <th className="clients-title-cell" scope="row">Speed ↑</th>
          {clients.map(([id, client]) => <td key={id}>{formatMegabitsPerSecond(client.speedOut)}</td>)}
        </tr>
        <tr>
          <th className="clients-title-cell" scope="row">Total ↓</th>
          {clients.map(([id, client]) => <td key={id}>{formatMegabytes(client.inc)}</td>)}
        </tr>
        <tr>
          <th className="clients-title-cell" scope="row">Total ↑</th>
          {clients.map(([id, client]) => <td key={id}>{formatMegabytes(client.out)}</td>)}
        </tr>
        <tr>
          <th className="clients-title-cell" scope="row">Logged in</th>
          {clients.map(([id, client]) => <td key={id}>{client.isLogin === '1' ? '✓' : '—'}</td>)}
        </tr>
        {detailRows.map((field) => (
          <tr key={field}>
            <th className="clients-title-cell" scope="row">{field}</th>
            {clients.map(([id, client]) => <td key={id} title={displayValue(client[field])}>{displayValue(client[field])}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ClientsDialog({ onClose }: ClientsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const query = useClientsTraffic();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog ref={dialogRef} className="clients-modal" onClose={onClose} onCancel={onClose}>
      <header className="clients-header">
        <h2>Clients</h2>
        <button className="clients-close" type="button" aria-label="Close" onClick={() => dialogRef.current?.close()}>
          ×
        </button>
      </header>
      <div className="clients-content">
        {query.isPending && <p className="clients-status">Loading clients…</p>}
        {query.isError && <p className="clients-status clients-status--error">{query.error.message}</p>}
        {query.data && Object.keys(query.data.clients).length === 0 && (
          <p className="clients-status">No clients found.</p>
        )}
        {query.data && Object.keys(query.data.clients).length > 0 && <ClientsTable state={query.data} />}
      </div>
    </dialog>
  );
}
