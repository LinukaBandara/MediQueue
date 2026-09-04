import type { ConnectionStatus } from '@/hooks/useQueue';

const LABELS: Record<ConnectionStatus, string> = {
  connecting: 'Connecting…',
  live: 'Live',
  disconnected: 'Reconnecting…',
};

export function LiveIndicator({ status }: { status: ConnectionStatus }) {
  return (
    <span className="live-pill">
      <span className={`live-dot ${status !== 'live' ? 'off' : ''}`} aria-hidden="true" />
      {LABELS[status]}
    </span>
  );
}
