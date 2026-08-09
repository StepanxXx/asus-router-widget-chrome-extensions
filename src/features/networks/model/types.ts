export type TrafficVector = 'inc' | 'out';

export type NetworkCounters = {
  rx: number;
  tx: number;
};

export type NetworkSnapshot = {
  stamp: number;
  interfaces: Record<string, NetworkCounters>;
};

export type TrafficSample = {
  inc: number;
  out: number;
  stamp: number;
};

export type NetworkTraffic = {
  total: Record<TrafficVector, number>;
  speed: Partial<Record<TrafficVector, number>> & {
    log: TrafficSample[];
  };
};

export type NetworkTrafficState = {
  stamp: number;
  interfaces: Record<string, NetworkTraffic>;
  max: number;
  min: number;
};
