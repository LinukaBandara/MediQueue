'use client';

/**
 * hooks/useQueue.ts
 *
 * Fetches a doctor's live queue and keeps it fresh in real time.
 *
 * Deliberate design choice (matches the backend's broadcast payload):
 * the `queue.updated` event only tells us "something changed for this
 * doctor" — it carries no queue data itself. On receiving it, we refetch
 * the full queue via REST rather than trusting an embedded payload. This
 * means a client that briefly misses an event (tab backgrounded, socket
 * reconnect) is never left with a subtly wrong snapshot — the next event,
 * or the periodic safety refetch below, always pulls the true state.
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { getEcho } from '@/lib/echo';
import type { Appointment } from '@/types/queue';

export type ConnectionStatus = 'connecting' | 'live' | 'disconnected';

export function useQueue(doctorId: number) {
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const response = await apiFetch<{ data: Appointment[] }>(
        `/api/doctors/${doctorId}/queue`
      );
      setQueue(response.data);
    } catch {
      // A failed refetch shouldn't nuke the last-known-good queue from
      // the screen — leave the stale list up rather than blanking it,
      // and let the connection indicator communicate the problem.
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    refetch();

    const echo = getEcho();
    const channel = echo.channel(`doctor-queue.${doctorId}`);

    channel.subscribed(() => setStatus('live'));
    channel.error(() => setStatus('disconnected'));
    channel.listen('.queue.updated', () => {
      refetch();
    });

    // Safety net: even if a WebSocket event is somehow missed (e.g. a
    // reconnect race), never go more than 15s without a fresh read.
    const interval = setInterval(refetch, 15000);

    return () => {
      echo.leaveChannel(`doctor-queue.${doctorId}`);
      clearInterval(interval);
    };
  }, [doctorId, refetch]);

  return { queue, status, isLoading, refetch };
}
