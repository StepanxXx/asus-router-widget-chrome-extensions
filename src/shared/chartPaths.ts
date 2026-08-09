export type ChartPoint = {
  inc: number;
  out: number;
};

export type SmoothChartPath = {
  area: string;
  line: string;
};

type SmoothChartOptions = {
  width?: number;
  height?: number;
  maxPoints?: number;
  controlOffset?: number;
};

export function createSmoothChartPath(
  samples: ChartPoint[],
  vector: 'inc' | 'out',
  max: number,
  options: SmoothChartOptions = {},
): SmoothChartPath {
  const { width = 150, height = 50, maxPoints = 30, controlOffset = 5 } = options;

  if (samples.length === 0) return { area: '', line: '' };

  const scaleMax = max > 0 ? max : 1;
  const xStep = width / Math.max(maxPoints - 1, 1);
  const points = samples.map((sample, index) => {
    const value = Math.max(0, sample[vector]);
    const normalized = Math.min(1, value / scaleMax);
    return {
      x: Math.min(width, index * xStep),
      y: height - (Math.round(normalized * (height - 2)) + 1),
    };
  });
  const first = points[0];
  let curves = '';

  for (let index = 0; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    curves += ` C ${current.x + controlOffset} ${current.y}, ${next.x - controlOffset} ${next.y}, ${next.x} ${next.y}`;
  }

  const last = points.at(-1) ?? first;
  return {
    line: `M ${first.x} ${first.y}${curves}`,
    area: `M ${first.x} ${height} L ${first.x} ${first.y}${curves} L ${last.x} ${height} Z`,
  };
}
