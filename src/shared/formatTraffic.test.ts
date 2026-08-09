import { describe, expect, it } from 'vitest';
import { formatMegabitsPerSecond, formatMegabytes } from './formatTraffic';

describe('traffic formatters', () => {
  it('formats bytes per second as megabits per second', () => {
    expect(formatMegabitsPerSecond(1024 * 1024)).toBe('8 Mbps');
    expect(formatMegabitsPerSecond(1.5 * 1024 * 1024)).toBe('12 Mbps');
  });

  it('formats bytes as megabytes', () => {
    expect(formatMegabytes(2 * 1024 * 1024)).toBe('2 MB');
  });

  it('clamps negative and missing values to zero', () => {
    expect(formatMegabitsPerSecond(-1)).toBe('0 Mbps');
    expect(formatMegabytes()).toBe('0 MB');
  });
});
