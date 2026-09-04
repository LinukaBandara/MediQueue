'use client';

/**
 * Waiting-room TV display — public, no auth (matches the backend's
 * public Reverb channel). Dark background, huge tabular numerals, no
 * interactive elements, meant to be read from across a room.
 */

import { use } from 'react';
import { useQueue } from '@/hooks/useQueue';
import { Loader } from '@/components/Loader';

export default function WaitingRoomDisplay({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = use(params);
  const { queue, isLoading } = useQueue(Number(doctorId));

  const current = queue.find((a) => a.status === 'called' || a.status === 'in_progress');
  const waiting = queue.filter((a) => a.status === 'waiting').slice(0, 4);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#001D39',
        color: 'white',
        padding: '60px 70px',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
      }}
    >
      <div style={{ fontSize: 20, color: '#8FB0C9', marginBottom: 6, fontWeight: 500 }}>Test Clinic</div>
      <div style={{ fontSize: 30, fontWeight: 600, marginBottom: 60, fontFamily: "'Fraunces', Georgia, serif" }}>
        Doctor #{doctorId}
      </div>

      {isLoading ? (
        <Loader label="Loading…" color="#7BBDE8" labelColor="#8FB0C9" />
      ) : (
        <>
          <div style={{ fontSize: 20, color: '#8FB0C9', marginBottom: 14 }}>Now serving</div>
          <div style={{ fontSize: 180, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: '#FF9500' }}>
            {current ? current.token_number : '—'}
          </div>
          {current && <div style={{ fontSize: 32, marginTop: 12, color: '#EAF4FB' }}>{current.patient.name}</div>}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '56px 0 40px' }} />

          <div style={{ fontSize: 18, color: '#8FB0C9', marginBottom: 20 }}>Up next</div>
          <div style={{ display: 'flex', gap: 36 }}>
            {waiting.length === 0 ? (
              <span style={{ color: '#8FB0C9' }}>No one waiting</span>
            ) : (
              waiting.map((a) => (
                <div key={a.id} style={{ fontSize: 48, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#BDD8E9' }}>
                  {a.token_number}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
