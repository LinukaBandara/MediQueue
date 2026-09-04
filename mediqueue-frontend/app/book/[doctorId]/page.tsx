'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { MinimalFooter } from '@/components/Footer';
import { Icon } from '@/components/Icon';
import { apiFetch, ApiError } from '@/lib/apiClient';
import type { Appointment } from '@/types/queue';

type Mode = 'queue' | 'scheduled';

export default function BookPage({ params }: { params: Promise<{ doctorId: string }> }) {
  const { doctorId } = use(params);
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('queue');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === 'scheduled' && !scheduledAt) {
      setError('Please choose a date and time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const appointment = await apiFetch<{ data: Appointment }>('/api/public/book', {
        method: 'POST',
        json: {
          name,
          phone,
          doctor_id: Number(doctorId),
          mode,
          scheduled_at: mode === 'scheduled' ? scheduledAt : null,
        },
      });
      setConfirmed(appointment.data);
    } catch (err) {
      if (err instanceof ApiError) {
        const validation = err.validationErrors;
        if (validation) {
          setError(Object.values(validation).flat().join(' '));
        } else if (err.status === 429) {
          setError('Too many booking attempts — please wait a moment and try again.');
        } else {
          setError('Something went wrong. Please check your details and try again.');
        }
      } else {
        setError('Network error — please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-shell fade-in-page" style={{ paddingTop: 40, paddingBottom: 40, maxWidth: 560 }}>
        <button className="btn-ghost" onClick={() => router.back()} style={{ marginBottom: 24, display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <Icon name="arrowLeft" size={14} /> Back
        </button>

        {confirmed ? (
          <div className="glass" style={{ padding: 32, textAlign: 'center' }}>
            <div className="icon-tile solid round" style={{ width: 56, height: 56, margin: '0 auto 18px' }}>
              <Icon name="checkBadge" size={26} color="white" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>You&apos;re booked!</h1>
            <p className="muted" style={{ marginBottom: 24 }}>
              {confirmed.status === 'waiting' && confirmed.queue_position
                ? `Your token is #${confirmed.token_number}, position ${confirmed.queue_position} in the queue.`
                : `Your token is #${confirmed.token_number}.`}
            </p>
            <div className="glass" style={{ padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--mint-deep)' }}>#{confirmed.token_number}</div>
              <div className="muted" style={{ fontSize: 13 }}>Save this token number — you can check your status any time with your phone number.</div>
            </div>
            <button className="btn-grad" onClick={() => router.push('/')} style={{ width: '100%' }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Book your visit</h1>

            <div className="glass" style={{ display: 'flex', padding: 5, marginBottom: 24 }}>
              <button
                type="button"
                onClick={() => setMode('queue')}
                className={mode === 'queue' ? 'btn-grad' : ''}
                style={{
                  flex: 1, padding: 11, borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 600,
                  background: mode === 'queue' ? undefined : 'transparent',
                  color: mode === 'queue' ? undefined : 'var(--muted)',
                  cursor: 'pointer',
                }}
              >
                Join Queue
              </button>
              <button
                type="button"
                onClick={() => setMode('scheduled')}
                className={mode === 'scheduled' ? 'btn-grad' : ''}
                style={{
                  flex: 1, padding: 11, borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 600,
                  background: mode === 'scheduled' ? undefined : 'transparent',
                  color: mode === 'scheduled' ? undefined : 'var(--muted)',
                  cursor: 'pointer',
                }}
              >
                Book Exact Time
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {mode === 'scheduled' && (
                <div style={{ marginBottom: 16 }}>
                  <label className="field-label">Preferred date &amp; time</label>
                  <input
                    type="datetime-local"
                    className="field-input"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                  />
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label className="field-label">Full name</label>
                <input
                  className="field-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Kasun Perera"
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="field-label">Phone number</label>
                <input
                  className="field-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="077 123 4567"
                />
                <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                  We use this to identify your booking — no account or password needed.
                </p>
              </div>

              {error && <p className="field-error" style={{ marginBottom: 16 }}>{error}</p>}

              <button type="submit" className="btn-grad" style={{ width: '100%' }} disabled={isSubmitting}>
                <Icon name="lock" size={14} color="white" />
                {isSubmitting ? 'Booking…' : mode === 'queue' ? 'Join queue now' : 'Confirm booking'}
              </button>
            </form>
          </>
        )}
      </main>
      <MinimalFooter />
    </>
  );
}
