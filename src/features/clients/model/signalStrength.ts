export type SignalLevel = 1 | 2 | 3 | 4;

export function convertRssi(value: unknown): SignalLevel {
  const rssi = Number.parseInt(String(value), 10);

  if (rssi >= -60) return 4;
  if (rssi >= -69) return 3;
  if (rssi >= -79) return 2;
  return 1;
}

export function getRssiLabel(value: unknown): string {
  const rssi = Number.parseInt(String(value), 10);
  if (!Number.isFinite(rssi)) return 'Unknown signal';
  if (rssi >= -50) return 'Very strong';
  if (rssi >= -67) return 'Strong';
  if (rssi >= -80) return 'Fair';
  return 'Weak';
}
