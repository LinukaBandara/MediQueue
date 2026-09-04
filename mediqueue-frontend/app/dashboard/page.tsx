'use client';

import { useEffect, useState } from 'react';
import { SidebarNav, MobileDashNav } from '@/components/SidebarNav';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Icon } from '@/components/Icon';
import { Loader } from '@/components/Loader';
import { apiFetch } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import { useAllQueues } from '@/hooks/useAllQueues';
import type { Doctor, Patient } from '@/types/queue';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  useEffect(() => {
    apiFetch<{ data: Doctor[] }>('/api/doctors')
      .then((res) => setDoctors(res.data))
      .finally(() => setDoctorsLoading(false));
  }, []);

  const { waiting, beingServed, isLoading: queueLoading, refetch } = useAllQueues(doctors);

  async function callPatient(appointmentId: number) {
    await apiFetch(`/api/appointments/${appointmentId}/call`, { method: 'POST' });
    refetch();
  }

  const isLoading = doctorsLoading || queueLoading;

  return (
    <div className="dash-shell">
      <SidebarNav />

      <div className="dash-main">
        <div className="dash-content fade-in-page">
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>
            Good day, {user?.name ?? 'there'} 👋
          </h1>
          <p className="muted" style={{ fontSize: 14, marginBottom: 24 }}>
            Here&apos;s what&apos;s happening across your clinic right now.
          </p>

          {isLoading ? (
            <Loader label="Loading dashboard…" />
          ) : (
            <>
              {/* Real, honest stats - no fabricated trend percentages */}
              <div className="stagger-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
                <div className="glass stat-card">
                  <div className="icon-tile stat-icon blue"><Icon name="stethoscope" size={18} /></div>
                  <div className="stat-value">{doctors.length}</div>
                  <div className="stat-label">Doctors on duty</div>
                </div>
                <div className="glass stat-card">
                  <div className="icon-tile stat-icon orange"><Icon name="clock" size={18} /></div>
                  <div className="stat-value">{waiting.length}</div>
                  <div className="stat-label">Patients waiting</div>
                </div>
                <div className="glass stat-card">
                  <div className="icon-tile stat-icon green"><Icon name="checkBadge" size={18} /></div>
                  <div className="stat-value">{beingServed.length}</div>
                  <div className="stat-label">Currently being seen</div>
                </div>
                <div className="glass stat-card">
                  <div className="icon-tile stat-icon red"><Icon name="users" size={18} /></div>
                  <div className="stat-value">{waiting.length + beingServed.length}</div>
                  <div className="stat-label">Total in queue today</div>
                </div>
              </div>

              <div className="dash-two-col">
                {/* Combined live queue across all doctors */}
                <div className="glass" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 15, margin: 0 }}>Live queue — all doctors</h3>
                    <span className="live-pill"><span className="live-dot" />Live</span>
                  </div>

                  {waiting.length === 0 ? (
                    <div className="empty-state">No patients waiting right now.</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ textAlign: 'left', color: 'var(--muted)', fontSize: 12 }}>
                            <th style={{ padding: '8px 6px' }}>#</th>
                            <th style={{ padding: '8px 6px' }}>Patient</th>
                            <th style={{ padding: '8px 6px' }}>Doctor</th>
                            <th style={{ padding: '8px 6px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {waiting.map((appointment) => (
                            <tr key={appointment.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                              <td style={{ padding: '10px 6px', fontWeight: 700 }}>#{appointment.token_number}</td>
                              <td style={{ padding: '10px 6px' }}>{appointment.patient.name}</td>
                              <td style={{ padding: '10px 6px', color: 'var(--muted)' }}>{appointment.doctorName}</td>
                              <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                                <button className="btn-grad" style={{ padding: '6px 12px', fontSize: 12, minHeight: 'auto' }} onClick={() => callPatient(appointment.id)}>
                                  Call
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* Now serving snapshot */}
                  <div className="glass" style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 15, margin: '0 0 12px' }}>Currently being seen</h3>
                    {beingServed.length === 0 ? (
                      <p className="muted" style={{ fontSize: 13, margin: 0 }}>No one is currently being seen.</p>
                    ) : (
                      beingServed.map((a) => (
                        <div key={a.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--glass-border)' }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>#{a.token_number}</div>
                          <div style={{ fontSize: 13 }}>{a.patient.name}</div>
                          <div className="muted" style={{ fontSize: 12 }}>{a.doctorName}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <PatientLookup />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <MobileDashNav />
    </div>
  );
}

function PatientLookup() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    setIsSearching(true);
    try {
      const res = await apiFetch<{ data: Patient[] }>(`/api/patients?search=${encodeURIComponent(search)}`);
      setResults(res.data);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="glass" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 15, margin: '0 0 12px' }}>Patient lookup</h3>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          className="field-input"
          placeholder="Name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px 12px', fontSize: 13, minHeight: 'auto' }}
        />
        <button className="btn-grad" style={{ padding: '10px 14px', fontSize: 13, minHeight: 'auto' }}>
          <Icon name="search" size={13} color="white" />
        </button>
      </form>
      {isSearching && <Loader size="sm" />}
      {!isSearching && results.map((p) => (
        <div key={p.id} style={{ fontSize: 13, padding: '8px 0', borderTop: '1px solid var(--glass-border)' }}>
          <div style={{ fontWeight: 600 }}>{p.name}</div>
          <div className="muted" style={{ fontSize: 12 }}>{p.phone}</div>
        </div>
      ))}
    </div>
  );
}
