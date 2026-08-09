export function formatMegabitsPerSecond(value = 0): string {
  return `${Math.max(0, (value / 1024 / 1024) * 8).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} Mbps`;
}

export function formatMegabytes(value = 0): string {
  return `${Math.max(0, value / 1024 / 1024).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })} MB`;
}
