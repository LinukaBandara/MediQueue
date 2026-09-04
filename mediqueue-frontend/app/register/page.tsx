'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { MinimalFooter } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import { Loader } from '@/components/Loader';
import { apiFetch } from '@/lib/apiClient';
import type { Appointment } from '@/types/queue';

/**
 * MediQueue has no patient passwords — patients are identified by phone
 * number at booking time (see PatientBookingController). This page is
 * the patient-facing equivalent of "login": enter your phone, see your
 * bookings for today. It's deliberately lighter-weight than staff auth
 * because the trust model is different (self-service, low stakes,
 * scoped to today only).
 */
export default function RegisterPage() {
  const [phone, setPhone] = useState('');
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setSearched(true);
    try {
      const res = await apiFetch<{ data: Appointment[] }>(
        `/api/public/lookup?phone=${encodeURIComponent(phone)}`
      );
      setAppointments(res.data);
    } catch {
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-shell fade-in-page" style={{ paddingTop: 40, paddingBottom: 40, maxWidth: 520 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Find your booking</h1>
        <p className="muted" style={{ marginBottom: 28 }}>
          No account needed — enter the phone number you booked with to see today&apos;s appointments.
        </p>

        <form onSubmit={handleLookup} className="glass" style={{ padding: 20, display: 'flex', gap: 10, marginBottom: 24 }}>
          <input
            className="field-input"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button className="btn-grad" disabled={isLoading} style={{ flexShrink: 0 }}>
            <Icon name="search" size={14} color="white" />
            {isLoading ? 'Searching…' : 'Find'}
          </button>
        </form>

        {searched && !isLoading && appointments?.length === 0 && (
          <div className="empty-state glass">No bookings found for today with that number.</div>
        )}

        {appointments && appointments.length > 0 && (
          <div>
            <div className="section-label">Today&apos;s bookings</div>
            {appointments.map((a) => (
              <div key={a.id} className="glass" style={{ padding: 18, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Token #{a.token_number}</div>
                  <div className="muted" style={{ fontSize: 13 }}>{a.doctor?.name ?? 'Doctor'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint-deep)', textTransform: 'capitalize' }}>{a.status.replace('_', ' ')}</div>
                  {a.queue_position && <div className="muted" style={{ fontSize: 12 }}>Position {a.queue_position}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <span className="muted" style={{ fontSize: 13 }}>First time here? </span>
          <a href="/" style={{ color: 'var(--mint-deep)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            Browse doctors and book →
          </a>
        </div>
      </main>
      <MinimalFooter />
    </>
  );
}
