/**
 * lib/apiClient.ts
 *
 * Central fetch wrapper for talking to the Laravel API using Sanctum's
 * SPA (cookie-based) authentication.
 *
 * How Sanctum SPA auth works, and why this file looks the way it does:
 * 1. Laravel issues a `laravel_session` cookie + an `XSRF-TOKEN` cookie.
 * 2. Every "unsafe" request (POST/PUT/PATCH/DELETE) must echo the
 *    XSRF-TOKEN value back as an `X-XSRF-TOKEN` header, or Laravel
 *    rejects it as a CSRF failure.
 * 3. Before the FIRST request in a session, the frontend must call
 *    GET /sanctum/csrf-cookie once to make Laravel set that cookie.
 * 4. Every request — GET or not — must be sent with `credentials:
 *    'include'` so the browser actually attaches/receives cookies
 *    across the Next.js <-> Laravel origins.
 * 5. Laravel's `SANCTUM_STATEFUL_DOMAINS` env var must list the Next.js
 *    domain (e.g. localhost:3000, or your Vercel domain) or none of
 *    this works even with correct headers.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Call this once before the first login attempt (e.g. on the login page
 * mount, or lazily the first time apiFetch hits a 419 CSRF error).
 */
export async function ensureCsrfCookie(): Promise<void> {
  await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    credentials: 'include',
  });
}

interface ApiFetchOptions extends RequestInit {
  json?: unknown;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { json, headers, ...rest } = options;

  const isUnsafeMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
    (options.method ?? 'GET').toUpperCase()
  );

  const finalHeaders: HeadersInit = {
    Accept: 'application/json',
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(isUnsafeMethod ? { 'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') ?? '' } : {}),
    ...headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: finalHeaders,
    body: json ? JSON.stringify(json) : rest.body,
  });

  if (response.status === 419) {
    // CSRF token mismatch/expired — refresh it once and retry the request.
    await ensureCsrfCookie();
    return apiFetch<T>(path, options);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`API error ${status}`);
  }

  /** Laravel validation errors come back as { message, errors: { field: [msg] } } */
  get validationErrors(): Record<string, string[]> | null {
    if (this.body && typeof this.body === 'object' && 'errors' in this.body) {
      return (this.body as { errors: Record<string, string[]> }).errors;
    }
    return null;
  }
}
