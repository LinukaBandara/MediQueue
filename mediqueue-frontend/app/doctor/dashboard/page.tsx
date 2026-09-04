'use client';

import { apiFetch } from '@/lib/apiClient';
import { QueueList } from '@/components/QueueList';
import { StaffNav } from '@/components/StaffNav';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import type { Appointment } from '@/types/queue';

export default function DoctorDashboardPage() {
  return (
    <ProtectedRoute>
      <DoctorDashboardContent />
    </ProtectedRoute>
  );
}

function DoctorDashboardContent() {
  const { user } = useAuth();
  const doctorId = user?.doctorProfile?.id;

  async function callNext(appointment: Appointment, refetch: () => void) {
    await apiFetch(`/api/appointments/${appointment.id}/call`, { method: 'POST' });
    refetch();
  }

  async function complete(appointment: Appointment, refetch: () => void) {
    await apiFetch(`/api/appointments/${appointment.id}/resolve`, {
      method: 'POST',
      json: { status: 'completed' },
    });
    refetch();
  }

  return (
    <>
      <StaffNav />
      <main className="page-shell fade-in-page" style={{ paddingTop: 32, paddingBottom: 40, maxWidth: 700 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>
          Good day, Dr. {user?.name}
        </h1>
        <p className="muted" style={{ fontSize: 14, marginBottom: 28 }}>Your live patient queue.</p>

        {!doctorId ? (
          <div className="empty-state glass">
            Your account isn&apos;t linked to a doctor profile yet — ask your clinic admin to connect it.
          </div>
        ) : (
          <QueueList
            doctorId={doctorId}
            renderActions={(appointment, refetch) => (
              <>
                <button className="btn-grad" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => callNext(appointment, refetch)}>
                  Call
                </button>
                <button className="btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => complete(appointment, refetch)}>
                  Complete
                </button>
              </>
            )}
          />
        )}
      </main>
    </>
  );
}
