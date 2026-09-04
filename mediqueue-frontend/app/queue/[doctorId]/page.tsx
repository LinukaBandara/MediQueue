'use client';

import { use } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { QueueList } from '@/components/QueueList';
import { StaffNav } from '@/components/StaffNav';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import type { Appointment } from '@/types/queue';

export default function DoctorQueuePage({
  params,
}: {
  params: Promise<{ doctorId: string }>;
}) {
  const { doctorId } = use(params);

  async function callPatient(appointment: Appointment, refetch: () => void) {
    await apiFetch(`/api/appointments/${appointment.id}/call`, { method: 'POST' });
    refetch();
  }

  async function skipPatient(appointment: Appointment, refetch: () => void) {
    await apiFetch(`/api/appointments/${appointment.id}/resolve`, {
      method: 'POST',
      json: { status: 'no_show' },
    });
    refetch();
  }

  return (
    <ProtectedRoute>
      <StaffNav />
      <main className="page-shell fade-in-page" style={{ paddingTop: 32, paddingBottom: 40, maxWidth: 700 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>Live Queue — Doctor #{doctorId}</h1>
          <p className="muted" style={{ fontSize: 14 }}>Today&apos;s appointments, updated in real time.</p>
        </div>
        <QueueList
          doctorId={Number(doctorId)}
          renderActions={(appointment, refetch) => (
            <>
              <button className="btn-grad" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => callPatient(appointment, refetch)}>
                Call
              </button>
              <button className="btn-danger" onClick={() => skipPatient(appointment, refetch)}>
                Skip
              </button>
            </>
          )}
        />
      </main>
    </ProtectedRoute>
  );
}
