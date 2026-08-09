import type { NetworkType } from './networkConfig';
import type {
  NetworkSnapshot,
  NetworkTraffic,
  NetworkTrafficState,
  TrafficSample,
  TrafficVector,
} from './types';

const historyLimit = 30;

function getDirection(network: string, vector: 'rx' | 'tx'): TrafficVector {
  const isIncomingInternet = network.startsWith('INTERNET') && vector === 'tx';
  const isOutgoingLocalNetwork = !network.startsWith('INTERNET') && vector === 'rx';
  return isIncomingInternet || isOutgoingLocalNetwork ? 'out' : 'inc';
}

function getSpeed(current: number, previous: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0 || current < previous) return 0;
  return (current - previous) / elapsedSeconds;
}

function appendSample(history: TrafficSample[], sample: TrafficSample): TrafficSample[] {
  return [...history, sample].slice(-historyLimit);
}

export function transformNetworkData(
  current: NetworkSnapshot,
  previous: NetworkTrafficState | null,
  configuredNetworks: Readonly<Record<NetworkType, string>>,
): NetworkTrafficState {
  const interfaces: Record<string, NetworkTraffic> = {};
  const allSpeeds: number[] = [];
  const elapsedSeconds = previous ? (current.stamp - previous.stamp) / 1000 : 0;

  for (const network of Object.keys(configuredNetworks) as NetworkType[]) {
    const counters = current.interfaces[network];
    if (!counters) continue;

    const rxDirection = getDirection(network, 'rx');
    const total = {
      inc: rxDirection === 'inc' ? counters.rx : counters.tx,
      out: rxDirection === 'out' ? counters.rx : counters.tx,
    };
    const previousInterface = previous?.interfaces[network];

    if (!previousInterface) {
      interfaces[network] = { total, speed: { log: [] } };
      continue;
    }

    const speed = {
      inc: getSpeed(total.inc, previousInterface.total.inc, elapsedSeconds),
      out: getSpeed(total.out, previousInterface.total.out, elapsedSeconds),
    };
    const log = appendSample(previousInterface.speed.log, {
      ...speed,
      stamp: current.stamp,
    });

    allSpeeds.push(speed.inc, speed.out);
    interfaces[network] = { total, speed: { ...speed, log } };
  }

  return {
    stamp: current.stamp,
    interfaces,
    max: allSpeeds.length > 0 ? Math.max(...allSpeeds) : 0,
    min: allSpeeds.length > 0 ? Math.min(...allSpeeds) : 0,
  };
}
