'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/apiClient';
import { Icon } from '@/components/Icon';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setError('Incorrect email or password.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} className="fade-in-page">
      <div className="glass" style={{ width: '100%', maxWidth: 380, padding: 36 }}>
        <div className="brand" style={{ marginBottom: 36 }}>
          <div className="icon-tile solid brand-mark">
            <Icon name="heartPulse" size={16} color="white" />
          </div>
          MediQueue
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>Staff sign in</h1>
        <p className="muted" style={{ fontSize: 14, marginBottom: 28 }}>
          Enter your clinic credentials to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label className="field-label">Email</label>
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@clinic.lk"
            />
          </div>
          <div style={{ marginBottom: 22 }}>
            <label className="field-label">Password</label>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="********"
            />
          </div>
          {error && (
            <p role="alert" className="field-error" style={{ marginBottom: 16 }}>
              {error}
            </p>
          )}
          <button type="submit" className="btn-grad" style={{ width: '100%' }} disabled={isSubmitting}>
            <Icon name="lock" size={14} color="white" />
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="muted" style={{ fontSize: 13, marginTop: 24, textAlign: 'center' }}>
          Having trouble? Contact your clinic administrator.
        </p>
      </div>
    </main>
  );
}
