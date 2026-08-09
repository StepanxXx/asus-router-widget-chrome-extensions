import { describe, expect, it } from 'vitest';
import { createSmoothChartPath } from './chartPaths';

describe('createSmoothChartPath', () => {
  it('creates a filled smooth Bézier path', () => {
    const path = createSmoothChartPath(
      [
        { inc: 0, out: 10 },
        { inc: 50, out: 25 },
        { inc: 100, out: 50 },
      ],
      'inc',
      100,
    );

    expect(path.line).toMatch(/^M .+ C .+ C /);
    expect(path.area).toMatch(/^M .+ L .+ C .+ Z$/);
    expect(path.line).not.toContain('NaN');
  });

  it('handles empty data and a zero maximum', () => {
    expect(createSmoothChartPath([], 'inc', 0)).toEqual({ area: '', line: '' });

    const path = createSmoothChartPath([{ inc: 0, out: 0 }], 'inc', 0);
    expect(path.line).not.toContain('NaN');
    expect(path.area).not.toContain('NaN');
  });
});
