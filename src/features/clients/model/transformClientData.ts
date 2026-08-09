import type {
  ClientMap,
  ClientTrafficCounters,
  ClientTrafficSample,
  ClientTrafficSnapshot,
  ClientTrafficState,
} from './types';

const historyLimit = 30;

function calculateSpeed(
  current: number,
  previous: number | undefined,
  elapsedSeconds: number,
): number {
  if (previous === undefined || elapsedSeconds <= 0 || current < previous) return 0;
  return (current - previous) / elapsedSeconds;
}

function getRange(history: Record<string, ClientTrafficSample[]>): { max: number; min: number } {
  const speeds = Object.values(history).flatMap((samples) =>
    samples.flatMap(({ inc, out }) => [Math.max(0, inc), Math.max(0, out)]),
  );

  return {
    max: speeds.length > 0 ? Math.max(...speeds) : 0,
    min: speeds.length > 0 ? Math.min(...speeds) : 0,
  };
}

export function transformClientData(
  clients: ClientMap,
  trafficSnapshot: ClientTrafficSnapshot,
  previous: ClientTrafficState | null,
): ClientTrafficState {
  const transformedClients: ClientTrafficState['clients'] = {};
  const counters: Record<string, ClientTrafficCounters> = {};
  const history: Record<string, ClientTrafficSample[]> = {};
  const elapsedSeconds = previous ? (trafficSnapshot.stamp - previous.stamp) / 1000 : 0;

  for (const [clientId, client] of Object.entries(clients)) {
    const currentCounters = trafficSnapshot.traffic[clientId] ?? { inc: 0, out: 0 };
    const previousCounters = previous?.counters[clientId];
    const speedInc = calculateSpeed(currentCounters.inc, previousCounters?.inc, elapsedSeconds);
    const speedOut = calculateSpeed(currentCounters.out, previousCounters?.out, elapsedSeconds);
    const sample = { inc: speedInc, out: speedOut, stamp: trafficSnapshot.stamp };
    const clientHistory = client.isOnline === '0'
      ? []
      : [...(previous?.history[clientId] ?? []), sample].slice(-historyLimit);

    counters[clientId] = currentCounters;
    history[clientId] = clientHistory;
    transformedClients[clientId] = {
      ...client,
      ...currentCounters,
      speedInc,
      speedOut,
      log: clientHistory,
    };
  }

  return {
    stamp: trafficSnapshot.stamp,
    clients: transformedClients,
    counters,
    history,
    ...getRange(history),
  };
}
