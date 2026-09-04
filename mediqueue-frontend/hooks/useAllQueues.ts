'use client';

/**
 * hooks/useAllQueues.ts
 *
 * The backend has no single "combined queue across all doctors" endpoint
 * (each doctor's queue is scoped, deliberately, to that doctor - see
 * DoctorController::queue()). Rather than add backend complexity for a
 * dashboard convenience view, this hook fetches every doctor's queue in
 * parallel and merges them client-side, tagging each appointment with
 * its doctor's name for display.
 *
 * Everything here is real data from the API - no fabricated stats,
 * matching the project's own house rule against fake analytics.
 */

import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/apiClient';
import { getEcho } from '@/lib/echo';
import type { Appointment, Doctor } from '@/types/queue';

export interface QueueWithDoctor extends Appointment {
  doctorName: string;
  doctorId: number;
}

export function useAllQueues(doctors: Doctor[]) {
  const [queues, setQueues] = useState<QueueWithDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (doctors.length === 0) {
      setQueues([]);
      setIsLoading(false);
      return;
    }

    try {
      const results = await Promise.all(
        doctors.map((doctor) =>
          apiFetch<{ data: Appointment[] }>(`/api/doctors/${doctor.id}/queue`)
            .then((res) => res.data.map((a) => ({ ...a, doctorName: doctor.name, doctorId: doctor.id })))
            .catch(() => [])
        )
      );
      setQueues(results.flat());
    } finally {
      setIsLoading(false);
    }
  }, [doctors]);

  useEffect(() => {
    refetch();

    if (doctors.length === 0) return;

    // Subscribe to every doctor's channel so the combined dashboard view
    // is genuinely live, not just a one-time snapshot on page load - the
    // same pattern as useQueue, just fanned out across doctors.
    const echo = getEcho();
    const channelNames = doctors.map((d) => `doctor-queue.${d.id}`);
    channelNames.forEach((name) => {
      echo.channel(name).listen('.queue.updated', () => refetch());
    });

    return () => {
      channelNames.forEach((name) => echo.leaveChannel(name));
    };
  }, [doctors, refetch]);

  const waiting = queues.filter((q) => q.status === 'waiting');
  const beingServed = queues.filter((q) => q.status === 'called' || q.status === 'in_progress');

  return { queues, waiting, beingServed, isLoading, refetch };
}
