import { describe, expect, it } from 'vitest';
import { convertRssi, getRssiLabel } from './signalStrength';

describe('convertRssi', () => {
  it.each([
    [-100, 1],
    [-90, 1],
    [-80, 1],
    [-79, 2],
    [-70, 2],
    [-69, 3],
    [-61, 3],
    [-60, 4],
    [-59, 4],
    [-50, 4],
    ['invalid', 1],
  ])('maps %s dBm to signal level %s', (rssi, level) => {
    expect(convertRssi(rssi)).toBe(level);
  });
});

describe('getRssiLabel', () => {
  it.each([
    [-40, 'Very strong'],
    [-50, 'Very strong'],
    [-51, 'Strong'],
    [-67, 'Strong'],
    [-68, 'Fair'],
    [-80, 'Fair'],
    [-81, 'Weak'],
    [-100, 'Weak'],
  ])('maps %s dBm to %s', (rssi, label) => {
    expect(getRssiLabel(rssi)).toBe(label);
  });

  it('handles missing and invalid values', () => {
    expect(getRssiLabel(undefined)).toBe('Unknown signal');
    expect(getRssiLabel('invalid')).toBe('Unknown signal');
  });
});
