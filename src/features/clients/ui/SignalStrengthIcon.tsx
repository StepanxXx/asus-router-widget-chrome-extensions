import { convertRssi, getRssiLabel } from '../model/signalStrength';

export function SignalStrengthIcon({ value }: { value: unknown }) {
  const level = convertRssi(value);
  const label = getRssiLabel(value);

  return (
    <svg
      className={`clients-signal-icon clients-signal-icon--${level}`}
      viewBox="0 0 20 16"
      role="img"
      aria-label={`${label}: ${level} of 4`}
    >
      {[4, 8, 12, 16].map((height, index) => (
        <rect
          key={height}
          className={index < level ? 'is-active' : undefined}
          x={index * 5}
          y={16 - height}
          width="3"
          height={height}
          rx="1"
        />
      ))}
    </svg>
  );
}
