'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader } from './Loader';

/**
 * Wrap any staff-only page in this. Redirects to /login if there's no
 * authenticated session once the initial /api/me check has resolved —
 * checking isLoading first avoids a flash-redirect while that request
 * is still in flight on page load.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="page-shell" style={{ paddingTop: 60 }}>
        <Loader label="Checking session…" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
