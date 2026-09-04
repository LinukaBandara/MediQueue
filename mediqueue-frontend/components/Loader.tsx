/**
 * components/Loader.tsx
 *
 * A heartbeat/EKG-style loading indicator instead of a generic spinner —
 * matches the medical theme and reuses the same visual language as the
 * heartPulse icon used in the brand mark. Used everywhere the app is
 * waiting on the network: doctor lists, queue fetches, session checks.
 */

interface LoaderProps {
  label?: string;
  color?: string;
  labelColor?: string;
  size?: 'sm' | 'md';
}

export function Loader({ label, color = 'var(--mint)', labelColor, size = 'md' }: LoaderProps) {
  const width = size === 'sm' ? 56 : 84;
  const height = size === 'sm' ? 22 : 32;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: size === 'md' ? '24px 0' : 0 }}>
      <svg width={width} height={height} viewBox="0 0 100 40" fill="none">
        <polyline
          points="0,20 22,20 30,4 38,36 46,20 58,20 64,12 70,20 100,20"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ekg-path"
        />
      </svg>
      {label && (
        <p className={labelColor ? undefined : 'muted'} style={{ fontSize: 13, margin: 0, color: labelColor }}>
          {label}
        </p>
      )}
    </div>
  );
}
