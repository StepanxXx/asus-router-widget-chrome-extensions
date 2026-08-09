import { describe, expect, it } from 'vitest';
import { getRssiLabel } from './signalStrength';

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
