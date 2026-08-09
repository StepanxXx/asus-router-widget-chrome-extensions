export type ClientDevice = {
  mac?: string;
  name?: string;
  nickName?: string;
  ip?: string;
  isWL?: string;
  isOnline?: string;
  isLogin?: string;
  rssi?: string;
  type?: string;
  defaultType?: string;
  internetMode?: string;
  internetState?: string | number;
  [key: string]: unknown;
};

export type ClientMap = Record<string, ClientDevice>;

export type ClientTrafficCounters = {
  inc: number;
  out: number;
};

export type ClientTrafficSnapshot = {
  stamp: number;
  traffic: Record<string, ClientTrafficCounters>;
};

export type ClientTrafficSample = ClientTrafficCounters & {
  stamp: number;
};

export type ClientView = ClientDevice &
  ClientTrafficCounters & {
    speedInc: number;
    speedOut: number;
    log: ClientTrafficSample[];
  };

export type ClientTrafficState = {
  stamp: number;
  clients: Record<string, ClientView>;
  counters: Record<string, ClientTrafficCounters>;
  history: Record<string, ClientTrafficSample[]>;
  max: number;
  min: number;
};
