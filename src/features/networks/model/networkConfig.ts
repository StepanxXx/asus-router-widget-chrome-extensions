export const networkTypes = {
  INTERNET0: 'INTERNET',
  WIRED: 'LAN',
  WIRELESS0: '2.4GHz',
  WIRELESS1: '5GHz',
} as const;

export type NetworkType = keyof typeof networkTypes;
