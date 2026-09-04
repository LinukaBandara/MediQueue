'use client';

import { useEffect, useState } from 'react';
import { StaffNav } from '@/components/StaffNav';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Icon } from '@/components/Icon';
import { Loader } from '@/components/Loader';
import { apiFetch, ApiError } from '@/lib/apiClient';
import type { Patient } from '@/types/queue';

export default function PatientsPage() {
  return (
    <ProtectedRoute>
      <PatientsContent />
    </ProtectedRoute>
  );
}

function PatientsContent() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function loadPatients(query = '') {
    setIsLoading(true);
    try {
      const res = await apiFetch<{ data: Patient[] }>(`/api/patients?search=${encodeURIComponent(query)}`);
      setPatients(res.data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadPatients(search);
  }

  return (
    <>
      <StaffNav />
      <main className="page-shell fade-in-page" style={{ paddingTop: 32, paddingBottom: 40, maxWidth: 700 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>Patients</h1>
            <p className="muted" style={{ fontSize: 14 }}>Search existing patients or add a new one.</p>
          </div>
          <button className="btn-grad" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : '+ New patient'}
          </button>
        </div>

        {showForm && <NewPatientForm onCreated={() => { setShowForm(false); loadPatients(search); }} />}

        <form onSubmit={handleSearch} className="glass" style={{ padding: 16, display: 'flex', gap: 10, marginBottom: 24 }}>
          <Icon name="search" size={16} color="#6E6E73" />
          <input
            className="field-input"
            style={{ background: 'transparent', border: 'none', padding: 0 }}
            placeholder="Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {isLoading && <Loader label="Loading patients…" />}
        {!isLoading && patients.length === 0 && <div className="empty-state glass">No patients found.</div>}

        {patients.map((patient) => (
          <div key={patient.id} className="divider-row">
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{patient.name}</div>
              <div className="muted" style={{ fontSize: 13 }}>{patient.phone}</div>
            </div>
            {patient.email && <div className="muted" style={{ fontSize: 13 }}>{patient.email}</div>}
          </div>
        ))}
      </main>
    </>
  );
}

function NewPatientForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await apiFetch('/api/patients', {
        method: 'POST',
        json: { name, phone, email: email || null },
      });
      onCreated();
    } catch (err) {
      if (err instanceof ApiError && err.validationErrors) {
        setError(Object.values(err.validationErrors).flat().join(' '));
      } else {
        setError('Could not create patient. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass" style={{ padding: 20, marginBottom: 24, display: 'grid', gap: 12 }}>
      <input className="field-input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="field-input" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      <input className="field-input" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
      {error && <p className="field-error">{error}</p>}
      <button className="btn-grad" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save patient'}</button>
    </form>
  );
}
