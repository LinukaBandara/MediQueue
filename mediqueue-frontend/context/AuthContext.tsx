'use client';

/**
 * context/AuthContext.tsx
 *
 * Wraps the whole app (see app/layout.tsx) so any page/component can read
 * the current user and call login()/logout(). Talks to Laravel's
 * AuthController via apiFetch.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiFetch, ensureCsrfCookie } from '@/lib/apiClient';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'staff';
  clinic_id: number | null;
  doctorProfile?: { id: number } | null; // Eloquent serializes the relation using its method name (camelCase), not snake_case
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // On app load, check if a session cookie already exists (e.g. the
    // user refreshed the page) by hitting /me. A 401 just means "logged
    // out" — not an error worth surfacing.
    apiFetch<AuthUser>('/api/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    await ensureCsrfCookie();
    const { user } = await apiFetch<{ user: AuthUser }>('/api/login', {
      method: 'POST',
      json: { email, password },
    });
    setUser(user);
  }

  async function logout() {
    await apiFetch('/api/logout', { method: 'POST' });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
