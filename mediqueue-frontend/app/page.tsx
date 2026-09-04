'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Icon, type IconName } from '@/components/Icon';
import { Loader } from '@/components/Loader';
import { apiFetch } from '@/lib/apiClient';
import type { Doctor } from '@/types/queue';

const SPEC_ICON: Record<string, IconName> = {
  'General Physician': 'stethoscope',
  Pediatrics: 'baby',
  Cardiology: 'heartPulse',
};

export default function HomePage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiFetch<{ data: Doctor[] }>('/api/public/doctors')
      .then((res) => setDoctors(res.data))
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section
        style={{
          background: 'var(--hero-gradient)',
          padding: '36px 0 44px',
          color: 'white',
        }}
      >
        <div className="page-shell hero-grid">
          <div>
            <div className="hero-eyebrow" style={{ background: 'rgba(255,255,255,0.18)', color: 'white' }}>
              <Icon name="checkBadge" size={14} color="white" />
              Trusted by 12,000+ patients
            </div>
            <h1 className="hero-title" style={{ color: 'white' }}>
              Your health, without the wait
            </h1>
            <p className="hero-sub" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Book an exact time slot or join a live queue - see real wait times, updated the instant they change.
            </p>
            <div className="hero-cta-wrap">
              <Link href="/register" className="btn-grad" style={{ background: 'white', color: 'var(--navy)' }}>
                <Icon name="search" size={15} color="var(--navy)" />
                Find your booking
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="floating-card card-1">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div className="icon-tile solid" style={{ width: 36, height: 36 }}>
                  <Icon name="stethoscope" size={16} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Dr. Fernando</div>
                  <div className="muted" style={{ fontSize: 11 }}>General</div>
                </div>
              </div>
              <div className="muted" style={{ fontSize: 11 }}>Now serving</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--navy)' }}>#14</div>
            </div>
            <div className="floating-card card-2">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon name="flash" size={16} color="var(--mint-deep)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--mint-deep)' }}>Live update</span>
              </div>
              <div className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
                Queue position updates automatically - no refresh needed.
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell">
        {/* QUICK INFO CARDS - overlapping the hero slightly for a premium layered feel */}
        <div className="quick-cards stagger-grid" style={{ marginTop: -28 }}>
          <div className="glass hoverable quick-card">
            <div className="icon-tile"><Icon name="flash" size={18} color="var(--navy)" /></div>
            <h4>Live Queue</h4>
            <p>Real-time wait updates</p>
          </div>
          <div className="glass hoverable quick-card">
            <div className="icon-tile"><Icon name="calendar" size={18} color="var(--navy)" /></div>
            <h4>Book a Slot</h4>
            <p>Exact time appointments</p>
          </div>
          <div className="glass hoverable quick-card">
            <div className="icon-tile"><Icon name="checkBadge" size={18} color="var(--navy)" /></div>
            <h4>Find Doctors</h4>
            <p>All license-verified</p>
          </div>
          <div className="glass hoverable quick-card">
            <div className="icon-tile"><Icon name="lock" size={18} color="var(--navy)" /></div>
            <h4>Secure</h4>
            <p>No account required</p>
          </div>
        </div>

        {/* AVAILABLE DOCTORS */}
        <div style={{ marginTop: 36 }}>
          <div className="section-label">Available doctors</div>

          {isLoading && <Loader label="Finding available doctors…" />}
          {error && <p style={{ color: 'var(--danger)' }}>Couldn&apos;t load doctors right now — please try again shortly.</p>}
          {!isLoading && !error && doctors.length === 0 && (
            <div className="empty-state glass">No doctors are available to book right now.</div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }} className="stagger-grid">
            {doctors.map((doctor) => (
              <Link
                key={doctor.id}
                href={`/book/${doctor.id}`}
                className="glass hoverable"
                style={{ padding: 20, display: 'block', textDecoration: 'none', color: 'inherit' }}
              >
                <div className="icon-tile" style={{ width: 46, height: 46, marginBottom: 14 }}>
                  <Icon name={SPEC_ICON[doctor.specialization ?? ''] ?? 'stethoscope'} size={20} color="var(--navy)" />
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{doctor.name}</div>
                <div className="muted" style={{ fontSize: 13, marginBottom: 8 }}>{doctor.specialization ?? 'General'}</div>
                <div style={{ fontSize: 12, color: 'var(--mint-deep)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name="checkBadge" size={12} color="var(--mint-deep)" />
                  Verified doctor
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* SERVICES */}
        <div style={{ marginTop: 56 }}>
          <div className="section-label">Our services</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }} className="stagger-grid">
            <ServiceRow icon="ambulance" title="Emergency Care" desc="24/7 walk-in care with live queue tracking, no appointment needed." />
            <ServiceRow icon="baby" title="Pediatrics" desc="Appointments for children, family-friendly scheduling." />
            <ServiceRow icon="heartPulse" title="Cardiology" desc="Specialist consultations, exact-time booking only." />
          </div>
        </div>

        {/* APPOINTMENT BANNER */}
        <div
          className="hoverable"
          style={{
            marginTop: 56, borderRadius: 22, padding: '28px 26px',
            background: 'var(--brand-gradient)', color: 'white',
            display: 'flex', flexDirection: 'column', gap: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="icon-tile round" style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.2)' }}>
              <Icon name="calendar" size={22} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>Never lose your place in line</div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Get notified the moment your turn is close.</div>
            </div>
          </div>
          <Link href="/register" className="btn-grad" style={{ background: 'white', color: 'var(--navy)', alignSelf: 'flex-start' }}>
            Check my booking
          </Link>
        </div>

        {/* MEET OUR DOCTORS */}
        <div style={{ marginTop: 56, marginBottom: 20 }}>
          <div className="section-label">Meet our doctors</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }} className="stagger-grid">
            {[
              { name: 'Dr. Fernando', spec: 'General', icon: 'stethoscope' as IconName },
              { name: 'Dr. Silva', spec: 'Pediatrics', icon: 'baby' as IconName },
              { name: 'Dr. Jayasinghe', spec: 'Cardiology', icon: 'heartPulse' as IconName },
              { name: 'Dr. Bandara', spec: 'Dermatology', icon: 'shieldCheck' as IconName },
            ].map((d) => (
              <div key={d.name} className="glass hoverable" style={{ padding: 18, textAlign: 'center' }}>
                <div
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: 16, marginBottom: 12,
                    background: 'linear-gradient(150deg, var(--sky-pale), var(--mint))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Icon name={d.icon} size={30} color="var(--navy)" />
                </div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{d.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{d.spec}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

function ServiceRow({ icon, title, desc }: { icon: IconName; title: string; desc: string }) {
  return (
    <div className="glass hoverable" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div className="icon-tile" style={{ width: 44, height: 44 }}>
        <Icon name={icon} size={20} color="var(--navy)" />
      </div>
      <div>
        <h3 style={{ fontSize: 15, margin: '0 0 4px' }}>{title}</h3>
        <p className="muted" style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}
