export function getRssiLabel(value: unknown): string {
  const rssi = Number.parseInt(String(value), 10);
  if (!Number.isFinite(rssi)) return 'Unknown signal';
  if (rssi >= -50) return 'Very strong';
  if (rssi >= -67) return 'Strong';
  if (rssi >= -80) return 'Fair';
  return 'Weak';
}
