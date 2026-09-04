'use client';

/**
 * components/QueueList.tsx
 *
 * Shared between the staff live-queue screen, the doctor dashboard, and
 * the waiting-room display (via renderActions=undefined for read-only
 * mode). Action buttons are passed as a render prop so each screen wires
 * up its own permitted actions rather than this component knowing roles.
 */

import { useQueue } from '@/hooks/useQueue';
import { LiveIndicator } from './LiveIndicator';
import { Icon } from './Icon';
import { Loader } from './Loader';
import type { Appointment } from '@/types/queue';

interface QueueListProps {
  doctorId: number;
  renderActions?: (appointment: Appointment, refetch: () => void) => React.ReactNode;
  compact?: boolean;
}

export function QueueList({ doctorId, renderActions, compact }: QueueListProps) {
  const { queue, status, isLoading, refetch } = useQueue(doctorId);

  if (isLoading) {
    return <Loader label="Loading queue…" />;
  }

  const current = queue.find((a) => a.status === 'called' || a.status === 'in_progress');
  const waiting = queue.filter((a) => a.status === 'waiting');

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <LiveIndicator status={status} />
      </div>

      <div className="glass" style={{ padding: 20, marginBottom: 28, borderLeft: '3px solid var(--accent)' }}>
        <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Now serving</div>
        {current ? (
          <>
            <div style={{ fontSize: compact ? 26 : 32, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
              #{current.token_number}
            </div>
            <div className="muted" style={{ fontSize: 14 }}>{current.patient.name}</div>
          </>
        ) : (
          <p className="muted" style={{ margin: 0 }}>No patient currently being seen.</p>
        )}
      </div>

      <div className="section-label">Waiting ({waiting.length})</div>
      {waiting.length === 0 ? (
        <div className="empty-state glass">
          <Icon name="checkBadge" size={22} color="var(--mint-deep)" />
          <p style={{ margin: '10px 0 4px', fontWeight: 600 }}>No patients waiting</p>
          <p className="muted" style={{ fontSize: 13, margin: 0 }}>New patients will appear here instantly.</p>
        </div>
      ) : (
        <div className="glass" style={{ padding: '4px 20px' }}>
          {waiting.map((appointment) => (
            <div key={appointment.id} className="divider-row">
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums', minWidth: 34 }}>
                  #{appointment.token_number}
                </span>
                <span style={{ fontSize: 14 }}>{appointment.patient.name}</span>
              </div>
              {renderActions && <div style={{ display: 'flex', gap: 8 }}>{renderActions(appointment, refetch)}</div>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
