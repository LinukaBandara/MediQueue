/**
 * lib/echo.ts
 *
 * Laravel Echo client, configured for Reverb (Pusher-protocol compatible,
 * so we use the standard pusher-js transport under the hood — no need for
 * an actual Pusher account).
 *
 * Install first:
 *   npm install laravel-echo pusher-js
 */

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

let echoInstance: Echo<'reverb'> | null = null;

/**
 * Lazily create a single shared Echo instance. Call this from client
 * components only (it touches `window`) — never at module scope in a
 * file that might be imported by a Server Component.
 */
export function getEcho(): Echo<'reverb'> {
  if (echoInstance) return echoInstance;

  window.Pusher = Pusher;

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? 'localhost',
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
  });

  return echoInstance;
}

export function disconnectEcho(): void {
  echoInstance?.disconnect();
  echoInstance = null;
}
